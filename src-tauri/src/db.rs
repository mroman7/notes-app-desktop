use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::Serialize;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

// Instead of a global static Lazy connection, we wrap the connection 
// inside a struct to inject it cleanly into Tauri's state management ecosystem.
pub struct DbState(pub Mutex<Connection>);

pub fn database_path(app_handle: &AppHandle) -> PathBuf {
  let dir = if cfg!(debug_assertions) {
    // Development mode: clean execution relative to your src-tauri project root
    let mut path = std::env::current_dir().unwrap_or_else(|_| std::env::temp_dir());
    path.push(".notepad");
    path
  } else {
    // Production: Rust automatically identifies the correct, standard OS-specific 
    // AppData Local directory based on your tauri.conf.json identifier.
    app_handle
      .path()
      .app_local_data_dir()
      .expect("failed to resolve native system local data directory")
  };
  
  std::fs::create_dir_all(&dir).expect("failed to create db directory");
  dir.join("notepad.db")
}

fn create_schema(conn: &Connection) -> rusqlite::Result<()> {
  conn.execute_batch(
    "PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT DEFAULT '',
      time_required TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );",
  )?;

  let _ = conn.execute("ALTER TABLE tasks ADD COLUMN description TEXT DEFAULT ''", []);
  let _ = conn.execute("ALTER TABLE tasks ADD COLUMN time_required TEXT DEFAULT ''", []);

  Ok(())
}

pub fn reset_database(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
  let path = database_path(app_handle);
  
  if path.exists() {
    std::fs::remove_file(&path)?;
    println!("Deleted database at {}", path.display());
  }
  
  let wal_path = format!("{}-wal", path.display());
  let shm_path = format!("{}-shm", path.display());
  if std::path::Path::new(&wal_path).exists() {
    std::fs::remove_file(&wal_path)?;
  }
  if std::path::Path::new(&shm_path).exists() {
    std::fs::remove_file(&shm_path)?;
  }
  
  println!("Database reset complete. Fresh schema will be created on next connection.");
  Ok(())
}

// Main initializer called from your main.rs setup hook
pub fn init(app_handle: &AppHandle) -> DbState {
  if let Err(e) = reset_database(app_handle) {
    eprintln!("Warning: failed to reset database: {}", e);
  }
  
  let path = database_path(app_handle);
  println!("SQLite DB path: {}", path.display());
  
  let conn = Connection::open(&path).expect("failed to open database");
  create_schema(&conn).expect("failed to create schema");
  
  DbState(Mutex::new(conn))
}

fn current_timestamp() -> String {
  Utc::now().to_rfc3339()
}

/* --- Struct Definitions & Helpers --- */

#[derive(Serialize)]
pub struct Note {
  pub id: i64,
  pub content: String,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(Serialize)]
pub struct Project {
  pub id: i64,
  pub name: String,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(Serialize)]
pub struct Task {
  pub id: i64,
  pub project_id: i64,
  pub title: String,
  pub status: String,
  pub description: String,
  pub time_required: String,
  pub created_at: String,
  pub updated_at: String,
}

fn row_to_note(row: &Row) -> rusqlite::Result<Note> {
  Ok(Note {
    id: row.get(0)?,
    content: row.get(1)?,
    created_at: row.get(2)?,
    updated_at: row.get(3)?,
  })
}

fn row_to_project(row: &Row) -> rusqlite::Result<Project> {
  Ok(Project {
    id: row.get(0)?,
    name: row.get(1)?,
    created_at: row.get(2)?,
    updated_at: row.get(3)?,
  })
}

fn row_to_task(row: &Row) -> rusqlite::Result<Task> {
  Ok(Task {
    id: row.get(0)?,
    project_id: row.get(1)?,
    title: row.get(2)?,
    status: row.get(3)?,
    description: row.get(4).unwrap_or_default(),
    time_required: row.get(5).unwrap_or_default(),
    created_at: row.get(6)?,
    updated_at: row.get(7)?,
  })
}

/* --- Refactored Tauri Commands --- */

#[tauri::command]
pub fn get_all_notes(state: tauri::State<'_, DbState>) -> Result<Vec<Note>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, content, created_at, updated_at FROM notes ORDER BY updated_at DESC")
    .map_err(|e| e.to_string())?;
  let notes = stmt
    .query_map([], |row| row_to_note(row))
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<Note>, _>>()
    .map_err(|e| e.to_string())?;
  Ok(notes)
}

#[tauri::command]
pub fn get_note_by_id(id: i64, state: tauri::State<'_, DbState>) -> Result<Option<Note>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, content, created_at, updated_at FROM notes WHERE id = ?1")
    .map_err(|e| e.to_string())?;
  let note = stmt
    .query_row(params![id], |row| row_to_note(row))
    .optional()
    .map_err(|e| e.to_string())?;
  Ok(note)
}

#[tauri::command]
pub fn delete_note(id: i64, state: tauri::State<'_, DbState>) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute("DELETE FROM notes WHERE id = ?1", params![id])
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub fn save_note(id: Option<i64>, content: String, state: tauri::State<'_, DbState>) -> Result<Note, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let now = current_timestamp();

  if let Some(id) = id {
    conn
      .execute(
        "UPDATE notes SET content = ?1, updated_at = ?2 WHERE id = ?3",
        params![content, now, id],
      )
      .map_err(|e| e.to_string())?;
    let mut stmt = conn
      .prepare("SELECT id, content, created_at, updated_at FROM notes WHERE id = ?1")
      .map_err(|e| e.to_string())?;
    let note = stmt
      .query_row(params![id], |row| row_to_note(row))
      .map_err(|e| e.to_string())?;
    return Ok(note);
  }

  conn
    .execute(
      "INSERT INTO notes (content, created_at, updated_at) VALUES (?1, ?2, ?3)",
      params![content, now, now],
    )
    .map_err(|e| e.to_string())?;

  let id = conn.last_insert_rowid();
  let mut stmt = conn
    .prepare("SELECT id, content, created_at, updated_at FROM notes WHERE id = ?1")
    .map_err(|e| e.to_string())?;
  let note = stmt
    .query_row(params![id], |row| row_to_note(row))
    .map_err(|e| e.to_string())?;
  Ok(note)
}

#[tauri::command]
pub fn get_all_projects(state: tauri::State<'_, DbState>) -> Result<Vec<Project>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, name, created_at, updated_at FROM projects ORDER BY created_at DESC")
    .map_err(|e| e.to_string())?;
  let projects = stmt
    .query_map([], |row| row_to_project(row))
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<Project>, _>>()
    .map_err(|e| e.to_string())?;
  Ok(projects)
}

#[tauri::command]
pub fn create_project(name: String, state: tauri::State<'_, DbState>) -> Result<Project, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let now = current_timestamp();
  conn
    .execute(
      "INSERT INTO projects (name, created_at, updated_at) VALUES (?1, ?2, ?3)",
      params![name, now, now],
    )
    .map_err(|e| e.to_string())?;
  let id = conn.last_insert_rowid();
  let mut stmt = conn
    .prepare("SELECT id, name, created_at, updated_at FROM projects WHERE id = ?1")
    .map_err(|e| e.to_string())?;
  let project = stmt
    .query_row(params![id], |row| row_to_project(row))
    .map_err(|e| e.to_string())?;
  Ok(project)
}

#[tauri::command]
pub fn get_tasks_for_project(project_id: i64, state: tauri::State<'_, DbState>) -> Result<Vec<Task>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare(
      "SELECT id, project_id, title, status, description, time_required, created_at, updated_at FROM tasks WHERE project_id = ?1 ORDER BY updated_at DESC",
    )
    .map_err(|e| e.to_string())?;
  let tasks = stmt
    .query_map(params![project_id], |row| row_to_task(row))
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<Task>, _>>()
    .map_err(|e| e.to_string())?;
  Ok(tasks)
}

#[tauri::command]
pub fn create_task(
  project_id: i64,
  title: String,
  description: Option<String>,
  time_required: Option<String>,
  state: tauri::State<'_, DbState>,
) -> Result<Task, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let now = current_timestamp();
  let desc = description.unwrap_or_default();
  let time_req = time_required.unwrap_or_default();
  conn
    .execute(
      "INSERT INTO tasks (project_id, title, status, description, time_required, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      params![project_id, title, "todo", desc, time_req, now, now],
    )
    .map_err(|e| e.to_string())?;
  let id = conn.last_insert_rowid();
  let mut stmt = conn
    .prepare(
      "SELECT id, project_id, title, status, description, time_required, created_at, updated_at FROM tasks WHERE id = ?1",
    )
    .map_err(|e| e.to_string())?;
  let task = stmt
    .query_row(params![id], |row| row_to_task(row))
    .map_err(|e| e.to_string())?;
  Ok(task)
}

#[tauri::command]
pub fn update_task_status(id: i64, status: String, state: tauri::State<'_, DbState>) -> Result<Task, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let now = current_timestamp();
  conn
    .execute(
      "UPDATE tasks SET status = ?1, updated_at = ?2 WHERE id = ?3",
      params![status, now, id],
    )
    .map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare(
      "SELECT id, project_id, title, status, description, time_required, created_at, updated_at FROM tasks WHERE id = ?1",
    )
    .map_err(|e| e.to_string())?;
  let task = stmt
    .query_row(params![id], |row| row_to_task(row))
    .map_err(|e| e.to_string())?;
  Ok(task)
}

#[tauri::command]
pub fn update_task(
  id: i64,
  title: String,
  description: Option<String>,
  time_required: Option<String>,
  status: String,
  state: tauri::State<'_, DbState>,
) -> Result<Task, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let now = current_timestamp();
  let desc = description.unwrap_or_default();
  let time_req = time_required.unwrap_or_default();
  conn
    .execute(
      "UPDATE tasks SET title = ?1, description = ?2, time_required = ?3, status = ?4, updated_at = ?5 WHERE id = ?6",
      params![title, desc, time_req, status, now, id],
    )
    .map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare(
      "SELECT id, project_id, title, status, description, time_required, created_at, updated_at FROM tasks WHERE id = ?1",
    )
    .map_err(|e| e.to_string())?;
  let task = stmt
    .query_row(params![id], |row| row_to_task(row))
    .map_err(|e| e.to_string())?;
  Ok(task)
}

#[tauri::command]
pub fn delete_task(id: i64, state: tauri::State<'_, DbState>) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute("DELETE FROM tasks WHERE id = ?1", params![id])
    .map_err(|e| e.to_string())?;
  Ok(())
}