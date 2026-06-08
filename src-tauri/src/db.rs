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
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    ",
  )?;


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
  pub title: String,
  pub content: String,
  pub created_at: String,
  pub updated_at: String,
}


fn row_to_note(row: &Row) -> rusqlite::Result<Note> {
  Ok(Note {
    id: row.get(0)?,
    title: row.get(1)?,
    content: row.get(2)?,
    created_at: row.get(3)?,
    updated_at: row.get(4)?,
  })
}


// Internal helper for fetching a single note
fn get_note_internal(conn: &Connection, id: i64) -> Result<Note, String> {
    conn.query_row(
        "SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?1",
        params![id],
        |row| row_to_note(row),
    ).map_err(|e| e.to_string())
}


/* --- Refactored Tauri Commands --- */

#[tauri::command]
pub fn get_all_notes(state: tauri::State<'_, DbState>) -> Result<Vec<Note>, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC")
    .map_err(|e| e.to_string())?;
  
  let notes = stmt
    .query_map([], |row| row_to_note(row))
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<Note>, _>>()
    .map_err(|e| e.to_string())?;
  Ok(notes)
}

#[tauri::command]
pub fn get_note_by_id(id: i64, state: tauri::State<'_, DbState>) -> Result<Note, String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  get_note_internal(&conn, id)
}

#[tauri::command]
pub fn create_note(
    title: String, 
    content: Option<String>, 
    state: tauri::State<'_, DbState>
) -> Result<Note, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let now = current_timestamp();
    let content_val = content.unwrap_or_default();

    conn.execute(
        "INSERT INTO notes (title, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        params![title, content_val, now, now],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_note_internal(&conn, id)
}

#[tauri::command]
pub fn update_note(
    id: i64, 
    title: Option<String>, 
    content: Option<String>, 
    state: tauri::State<'_, DbState>
) -> Result<Note, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let now = current_timestamp();

    // Fetch existing note using the helper
    let current_note = get_note_internal(&conn, id)?;
    
    let final_title = title.unwrap_or(current_note.title);
    let final_content = content.unwrap_or(current_note.content);

    conn.execute(
        "UPDATE notes SET title = ?1, content = ?2, updated_at = ?3 WHERE id = ?4",
        params![final_title, final_content, now, id],
    ).map_err(|e| e.to_string())?;

    get_note_internal(&conn, id)
}


#[tauri::command]
pub fn delete_note(id: i64, state: tauri::State<'_, DbState>) -> Result<(), String> {
  let conn = state.0.lock().map_err(|e| e.to_string())?;
  conn
    .execute("DELETE FROM notes WHERE id = ?1", params![id])
    .map_err(|e| e.to_string())?;
  Ok(())
}