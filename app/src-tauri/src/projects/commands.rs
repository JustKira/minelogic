use std::collections::HashMap;

use nanoid::nanoid;
use serde::{Deserialize, Serialize};
use serde_json::json;
use specta::Type;
use tauri::{self, AppHandle};
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Deserialize, Debug, Clone, Type)]
pub struct LocalProject {
    pub path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Type)]
pub struct RemoteProject {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Type)]
pub struct ProjectsList {
    pub local_projects: HashMap<String, LocalProject>,
    pub remote_projects: HashMap<String, RemoteProject>,
}

#[tauri::command]
#[specta::specta]
pub fn add_local_project(path: String, app: AppHandle) -> Result<String, String> {
    let id = nanoid!();

    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let local_project = LocalProject { path };

    // Try to get existing local_projects
    let mut local_projects: HashMap<String, LocalProject> =
        if let Some(existing) = store.get("local_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    // Add the new local project
    local_projects.insert(id.clone(), local_project);

    // Save back to store
    store.set("local_projects", json!(local_projects));

    store.save().map_err(|err| err.to_string())?;
    Ok(id)
}

#[allow(dead_code)]
#[tauri::command]
#[specta::specta]
pub fn list_all_projects(app: AppHandle) -> Result<ProjectsList, String> {
    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let local_projects: HashMap<String, LocalProject> =
        if let Some(existing) = store.get("local_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    let remote_projects: HashMap<String, RemoteProject> =
        if let Some(existing) = store.get("remote_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    Ok(ProjectsList {
        local_projects,
        remote_projects,
    })
}

#[tauri::command]
#[specta::specta]
pub fn add_remote_project(
    host: String,
    port: u16,
    user: String,
    password: String,
    app: AppHandle,
) -> Result<String, String> {
    let id = nanoid!();

    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let remote_project = RemoteProject {
        host,
        port,
        user,
        password,
    };

    // Try to get existing remote_projects
    let mut remote_projects: HashMap<String, RemoteProject> =
        if let Some(existing) = store.get("remote_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    // Add the new remote project
    remote_projects.insert(id.clone(), remote_project);

    // Save back to store
    store.set("remote_projects", json!(remote_projects));

    store.save().map_err(|err| err.to_string())?;
    Ok(id)
}

#[tauri::command]
#[specta::specta]
pub fn remove_remote_project(id: String, app: AppHandle) -> Result<(), String> {
    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let mut remote_projects: HashMap<String, RemoteProject> =
        if let Some(existing) = store.get("remote_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    if remote_projects.remove(&id).is_none() {
        return Err(format!("Remote project with id '{}' not found", id));
    }

    store.set("remote_projects", json!(remote_projects));
    store.save().map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn remove_local_project(id: String, app: AppHandle) -> Result<(), String> {
    let store = app
        .store("projects.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let mut local_projects: HashMap<String, LocalProject> =
        if let Some(existing) = store.get("local_projects") {
            serde_json::from_value(existing).map_err(|err| err.to_string())?
        } else {
            HashMap::new()
        };

    if local_projects.remove(&id).is_none() {
        return Err(format!("Local project with id '{}' not found", id));
    }

    store.set("local_projects", json!(local_projects));
    store.save().map_err(|err| err.to_string())?;
    Ok(())
}
