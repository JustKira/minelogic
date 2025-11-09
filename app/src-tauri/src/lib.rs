use specta_typescript::Typescript;

use tauri::Manager;
use tauri_specta::{collect_commands, Builder};
use tokio::sync::Mutex;

mod errors;
mod projects;
mod ssh;

use projects::commands::*;
use ssh::commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = Builder::<tauri::Wry>::new()
        //Register Commands
        .commands(collect_commands![
            add_local_project,
            add_remote_project,
            list_all_projects,
            remove_remote_project,
            remove_local_project,
            connect_to_remote_project,
            get_active_connection,
            list_directory,
        ]);

    #[cfg(debug_assertions)]
    builder
        .export(Typescript::default(), "../src/core/api/tauri_bindings.ts")
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        // add plugins
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Webview,
                ))
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        // and finally tell Tauri how to invoke them
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            app.manage(Mutex::new(ssh::state::SFTPConnectionState::default()));

            builder.mount_events(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application")
}
