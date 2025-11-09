use russh::{client, keys::ssh_key, ChannelId};
use serde::Serialize;
use specta::Type;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{AppHandle, State};
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

use crate::{
    projects::models::RemoteProject,
    ssh::{
        models::*,
        state::{SFTPConnectionState, SFTPSession},
    },
};

struct Client;

#[derive(Serialize, Type)]
pub struct ActiveConnection {
    pub id: String,
    pub project: RemoteProject,
}

impl client::Handler for Client {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &ssh_key::PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }

    async fn data(
        &mut self,
        _channel: ChannelId,
        _data: &[u8],
        _session: &mut client::Session,
    ) -> Result<(), Self::Error> {
        Ok(())
    }
}

#[tauri::command(async)]
#[specta::specta]
pub async fn connect_to_remote_project(
    id: String,
    state: State<'_, Mutex<SFTPConnectionState>>,
    app: AppHandle,
) -> Result<(), String> {
    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let remote_projects: HashMap<String, RemoteProject> =
        if let Some(existing) = store.get("remote_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    let remote_project = remote_projects
        .get(&id)
        .cloned()
        .ok_or_else(|| format!("Remote project with id '{}' not found", id))?;

    log::info!("Connecting to remote project: {}", remote_project.host);

    let sh = Client {};
    let config = Arc::new(russh::client::Config::default());
    let mut session = client::connect(
        config,
        (remote_project.host.clone(), remote_project.port),
        sh,
    )
    .await
    .map_err(|e| format!("Failed to connect to remote project: {}", e))?;

    session
        .authenticate_password(remote_project.user.clone(), remote_project.password.clone())
        .await
        .map_err(|e| format!("Failed to authenticate with remote project: {}", e))?;
    let channel = session
        .channel_open_session()
        .await
        .map_err(|e| format!("Failed to open channel: {}", e))?;
    channel
        .request_subsystem(true, "sftp")
        .await
        .map_err(|e| format!("Failed to request subsystem: {}", e))?;
    let sftp = russh_sftp::client::SftpSession::new(channel.into_stream())
        .await
        .map_err(|e| format!("Failed to create sftp session: {}", e))?;
    let mut state = state.lock().await;
    state.session = Some(SFTPSession { id, session: sftp });
    Ok(())
}

#[tauri::command(async)]
#[specta::specta]
pub async fn get_active_connection(
    state: State<'_, Mutex<SFTPConnectionState>>,
    app: AppHandle,
) -> Result<ActiveConnection, String> {
    let session_id = {
        let state = state.lock().await;
        if let Some(session) = state.session.as_ref() {
            session.id.clone()
        } else {
            return Err("No active SFTP session".to_string());
        }
    };

    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let remote_projects: HashMap<String, RemoteProject> =
        if let Some(existing) = store.get("remote_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    let project = remote_projects
        .get(&session_id)
        .cloned()
        .ok_or_else(|| format!("Remote project with id '{}' not found", session_id))?;

    Ok(ActiveConnection {
        id: session_id,
        project,
    })
}

#[tauri::command(async)]
#[specta::specta]
pub async fn list_directory(
    dir: String,
    state: State<'_, Mutex<SFTPConnectionState>>,
) -> Result<Vec<FileSystemEntry>, String> {
    let mut state = state.lock().await;

    let sftp = state.session.as_mut().ok_or("No active SFTP session")?;

    let entries = sftp
        .session
        .read_dir(dir.clone())
        .await
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    let file_system_entries: Vec<FileSystemEntry> = entries
        .into_iter()
        .map(|entry| {
            let file_type = format!("{:?}", entry.file_type());
            let name = entry.file_name();

            if file_type.contains("Dir") {
                FileSystemEntry::Directory(DirEntry {
                    name,
                    r#type: file_type,
                })
            } else {
                FileSystemEntry::File(FileEntry {
                    name,
                    r#type: file_type,
                    size: entry.metadata().size.unwrap_or(0) as u32,
                })
            }
        })
        .collect();

    Ok(file_system_entries)
}
