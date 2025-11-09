use serde::{Deserialize, Serialize};
use specta::Type;
use std::collections::HashMap;

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
