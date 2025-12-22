use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum VersionError {
    #[error("Version not found: {0}")]
    NotFound(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Failed to get app data directory")]
    AppDataDir,
}

impl Serialize for VersionError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigVersion {
    pub id: String,
    pub config_id: String,
    pub name: String,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub timestamp: u64,
    pub source: String, // "manual" or "auto"
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VersionMetadata {
    pub id: String,
    pub config_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub timestamp: u64,
    pub source: String,
    pub is_default: bool,
}

impl From<&ConfigVersion> for VersionMetadata {
    fn from(v: &ConfigVersion) -> Self {
        VersionMetadata {
            id: v.id.clone(),
            config_id: v.config_id.clone(),
            name: v.name.clone(),
            description: v.description.clone(),
            timestamp: v.timestamp,
            source: v.source.clone(),
            is_default: v.is_default,
        }
    }
}

fn get_versions_dir(app: &AppHandle) -> Result<PathBuf, VersionError> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| VersionError::AppDataDir)?;
    Ok(app_data.join("versions"))
}

fn get_config_versions_dir(app: &AppHandle, config_id: &str) -> Result<PathBuf, VersionError> {
    let versions_dir = get_versions_dir(app)?;
    Ok(versions_dir.join(sanitize_filename(config_id)))
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect()
}

fn get_version_path(app: &AppHandle, config_id: &str, version_id: &str) -> Result<PathBuf, VersionError> {
    let config_dir = get_config_versions_dir(app, config_id)?;
    Ok(config_dir.join(format!("{}.json", version_id)))
}

#[tauri::command]
pub fn save_version(
    app: AppHandle,
    config_id: String,
    name: String,
    content: String,
    description: Option<String>,
    source: String,
) -> Result<ConfigVersion, VersionError> {
    let config_dir = get_config_versions_dir(&app, &config_id)?;
    fs::create_dir_all(&config_dir)?;

    let version = ConfigVersion {
        id: Uuid::new_v4().to_string(),
        config_id,
        name,
        content,
        description,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        source,
        is_default: false,
    };

    let version_path = config_dir.join(format!("{}.json", version.id));
    let json = serde_json::to_string_pretty(&version)?;
    fs::write(&version_path, json)?;

    Ok(version)
}

#[tauri::command]
pub fn list_versions(app: AppHandle, config_id: String) -> Result<Vec<VersionMetadata>, VersionError> {
    let config_dir = get_config_versions_dir(&app, &config_id)?;

    if !config_dir.exists() {
        return Ok(Vec::new());
    }

    let mut versions = Vec::new();

    for entry in fs::read_dir(&config_dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().map(|e| e == "json").unwrap_or(false) {
            let content = fs::read_to_string(&path)?;
            let version: ConfigVersion = serde_json::from_str(&content)?;
            versions.push(VersionMetadata::from(&version));
        }
    }

    // Sort by timestamp descending (newest first)
    versions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    Ok(versions)
}

#[tauri::command]
pub fn load_version(app: AppHandle, config_id: String, version_id: String) -> Result<ConfigVersion, VersionError> {
    let version_path = get_version_path(&app, &config_id, &version_id)?;

    if !version_path.exists() {
        return Err(VersionError::NotFound(version_id));
    }

    let content = fs::read_to_string(&version_path)?;
    let version: ConfigVersion = serde_json::from_str(&content)?;

    Ok(version)
}

#[tauri::command]
pub fn delete_version(app: AppHandle, config_id: String, version_id: String) -> Result<(), VersionError> {
    let version_path = get_version_path(&app, &config_id, &version_id)?;

    if !version_path.exists() {
        return Err(VersionError::NotFound(version_id));
    }

    fs::remove_file(&version_path)?;

    Ok(())
}

#[tauri::command]
pub fn update_version_metadata(
    app: AppHandle,
    config_id: String,
    version_id: String,
    name: Option<String>,
    description: Option<String>,
    is_default: Option<bool>,
) -> Result<VersionMetadata, VersionError> {
    let version_path = get_version_path(&app, &config_id, &version_id)?;

    if !version_path.exists() {
        return Err(VersionError::NotFound(version_id));
    }

    let content = fs::read_to_string(&version_path)?;
    let mut version: ConfigVersion = serde_json::from_str(&content)?;

    // Update fields if provided
    if let Some(new_name) = name {
        version.name = new_name;
    }
    if let Some(new_desc) = description {
        version.description = Some(new_desc);
    }
    if let Some(new_default) = is_default {
        if new_default {
            // Clear default from other versions first
            clear_default_versions(&app, &config_id, &version_id)?;
        }
        version.is_default = new_default;
    }

    // Update timestamp
    version.timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Save updated version
    let json = serde_json::to_string_pretty(&version)?;
    fs::write(&version_path, json)?;

    Ok(VersionMetadata::from(&version))
}

fn clear_default_versions(app: &AppHandle, config_id: &str, except_version_id: &str) -> Result<(), VersionError> {
    let config_dir = get_config_versions_dir(app, config_id)?;

    if !config_dir.exists() {
        return Ok(());
    }

    for entry in fs::read_dir(&config_dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().map(|e| e == "json").unwrap_or(false) {
            let content = fs::read_to_string(&path)?;
            let mut version: ConfigVersion = serde_json::from_str(&content)?;

            if version.id != except_version_id && version.is_default {
                version.is_default = false;
                let json = serde_json::to_string_pretty(&version)?;
                fs::write(&path, json)?;
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub fn duplicate_version(
    app: AppHandle,
    config_id: String,
    version_id: String,
    new_name: String,
) -> Result<ConfigVersion, VersionError> {
    let version_path = get_version_path(&app, &config_id, &version_id)?;

    if !version_path.exists() {
        return Err(VersionError::NotFound(version_id));
    }

    let content = fs::read_to_string(&version_path)?;
    let original: ConfigVersion = serde_json::from_str(&content)?;

    // Create new version with duplicated content
    let new_version = ConfigVersion {
        id: Uuid::new_v4().to_string(),
        config_id: config_id.clone(),
        name: new_name,
        content: original.content,
        description: original.description.map(|d| format!("{} (copy)", d)),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        source: "manual".to_string(),
        is_default: false,
    };

    let config_dir = get_config_versions_dir(&app, &config_id)?;
    let new_version_path = config_dir.join(format!("{}.json", new_version.id));
    let json = serde_json::to_string_pretty(&new_version)?;
    fs::write(&new_version_path, json)?;

    Ok(new_version)
}

#[tauri::command]
pub fn update_version_content(
    app: AppHandle,
    config_id: String,
    version_id: String,
    content: String,
) -> Result<VersionMetadata, VersionError> {
    let version_path = get_version_path(&app, &config_id, &version_id)?;

    if !version_path.exists() {
        return Err(VersionError::NotFound(version_id));
    }

    let file_content = fs::read_to_string(&version_path)?;
    let mut version: ConfigVersion = serde_json::from_str(&file_content)?;

    version.content = content;
    version.timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let json = serde_json::to_string_pretty(&version)?;
    fs::write(&version_path, json)?;

    Ok(VersionMetadata::from(&version))
}

#[tauri::command]
pub fn get_default_version(app: AppHandle, config_id: String) -> Result<Option<VersionMetadata>, VersionError> {
    let config_dir = get_config_versions_dir(&app, &config_id)?;

    if !config_dir.exists() {
        return Ok(None);
    }

    for entry in fs::read_dir(&config_dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().map(|e| e == "json").unwrap_or(false) {
            let content = fs::read_to_string(&path)?;
            let version: ConfigVersion = serde_json::from_str(&content)?;

            if version.is_default {
                return Ok(Some(VersionMetadata::from(&version)));
            }
        }
    }

    Ok(None)
}
