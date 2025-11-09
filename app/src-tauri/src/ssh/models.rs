use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
pub struct FileEntry {
    pub name: String,
    pub r#type: String,
    pub size: u32,
}

#[derive(Serialize, Type)]
pub struct DirEntry {
    pub name: String,
    pub r#type: String,
}

#[derive(Serialize, Type)]
#[serde(tag = "entry_type")]
pub enum FileSystemEntry {
    File(FileEntry),
    Directory(DirEntry),
}
