use tauri::Manager;

mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // 1. Initialize DB with the app handle context
      let db_state = db::init(app.handle());
      
      // 2. Register the state into Tauri's state management
      app.manage(db_state);

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      db::get_all_notes,
      db::get_note_by_id,
      db::delete_note,
      db::create_note,
      db::update_note,
      db::search_notes
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}