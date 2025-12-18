mod commands;
mod config;

use commands::{
    check_multiple_paths, delete_file, file_exists, get_tools, read_file, resolve_path, write_file,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_tools,
            read_file,
            write_file,
            file_exists,
            check_multiple_paths,
            resolve_path,
            delete_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
