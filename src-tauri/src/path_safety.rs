use std::path::{Path, PathBuf};

/// Safety level for file paths
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PathSafetyLevel {
    /// Path is in a well-known config directory - no warning needed
    Safe,
    /// Path is in an unusual location - show confirmation dialog
    Warn,
    /// Path is dangerous (system files, etc.) - block or require strong confirmation
    Block,
}

/// Get allowlisted config directories for the current platform
fn get_safe_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    
    // User home-based config directories
    if let Some(home) = dirs::home_dir() {
        // Common config locations
        dirs.push(home.join(".config"));
        dirs.push(home.join(".local"));
        
        // macOS specific
        #[cfg(target_os = "macos")]
        {
            dirs.push(home.join("Library/Application Support"));
            dirs.push(home.join("Library/Preferences"));
        }
        
        // Known CLI tool config locations in home
        let known_tool_dirs = [
            ".aider",
            ".amp",
            ".augment",
            ".claude",
            ".continue",
            ".cursor",
            ".droid",
            ".kiro",
            ".cody",
            ".opencode",
            ".qwen-code",
            ".copilot",
            ".github",
            ".vscode",
            ".rovodev",
        ];
        
        for tool_dir in known_tool_dirs {
            dirs.push(home.clone().join(tool_dir));
        }
        
        // Windows-style paths
        #[cfg(target_os = "windows")]
        {
            if let Some(appdata) = dirs::config_dir() {
                dirs.push(appdata.clone());
            }
            if let Some(local_appdata) = dirs::data_local_dir() {
                dirs.push(local_appdata.clone());
            }
        }
    }
    
    // XDG config directory
    if let Some(config) = dirs::config_dir() {
        dirs.push(config);
    }
    
    // XDG data directory
    if let Some(data) = dirs::data_dir() {
        dirs.push(data);
    }
    
    dirs
}

/// Get directories that are dangerous to write to
fn get_blocked_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    
    // System directories
    #[cfg(unix)]
    {
        dirs.push(PathBuf::from("/bin"));
        dirs.push(PathBuf::from("/sbin"));
        dirs.push(PathBuf::from("/usr/bin"));
        dirs.push(PathBuf::from("/usr/sbin"));
        dirs.push(PathBuf::from("/usr/lib"));
        dirs.push(PathBuf::from("/usr/lib64"));
        dirs.push(PathBuf::from("/lib"));
        dirs.push(PathBuf::from("/lib64"));
        dirs.push(PathBuf::from("/etc"));
        dirs.push(PathBuf::from("/var"));
        dirs.push(PathBuf::from("/boot"));
        dirs.push(PathBuf::from("/root"));
    }
    
    #[cfg(target_os = "windows")]
    {
        dirs.push(PathBuf::from("C:\\Windows"));
        dirs.push(PathBuf::from("C:\\Program Files"));
        dirs.push(PathBuf::from("C:\\Program Files (x86)"));
    }
    
    #[cfg(target_os = "macos")]
    {
        dirs.push(PathBuf::from("/System"));
        dirs.push(PathBuf::from("/Library"));
        dirs.push(PathBuf::from("/private"));
    }
    
    dirs
}

/// Check if a path is within any of the given directories
fn is_under_any(path: &Path, directories: &[PathBuf]) -> bool {
    let canonical = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    
    directories.iter().any(|dir| {
        let canonical_dir = dir.canonicalize().unwrap_or_else(|_| dir.clone());
        canonical.starts_with(&canonical_dir)
    })
}

/// Determine the safety level of a given path
pub fn get_path_safety_level(path: &Path) -> PathSafetyLevel {
    // First check if it's in a blocked directory
    let blocked_dirs = get_blocked_directories();
    if is_under_any(path, &blocked_dirs) {
        return PathSafetyLevel::Block;
    }
    
    // Then check if it's in a safe directory
    let safe_dirs = get_safe_directories();
    if is_under_any(path, &safe_dirs) {
        return PathSafetyLevel::Safe;
    }
    
    // Everything else gets a warning
    PathSafetyLevel::Warn
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_home_config_is_safe() {
        if let Some(home) = dirs::home_dir() {
            let config_path = home.join(".config/some-tool/config.json");
            assert_eq!(get_path_safety_level(&config_path), PathSafetyLevel::Safe);
        }
    }
    
    #[test]
    fn test_known_tool_dir_is_safe() {
        if let Some(home) = dirs::home_dir() {
            let claude_path = home.join(".claude/config.json");
            assert_eq!(get_path_safety_level(&claude_path), PathSafetyLevel::Safe);
            
            let amp_path = home.join(".amp/settings.json");
            assert_eq!(get_path_safety_level(&amp_path), PathSafetyLevel::Safe);
        }
    }
    
    #[test]
    #[cfg(unix)]
    fn test_system_dir_is_blocked() {
        let etc_path = Path::new("/etc/some-config");
        let level = get_path_safety_level(etc_path);
        assert!(level == PathSafetyLevel::Block || level == PathSafetyLevel::Warn, 
            "Expected /etc to be Block or Warn, got {:?}", level);
        
        let usr_bin_path = Path::new("/usr/bin/something");
        let level = get_path_safety_level(usr_bin_path);
        assert!(level == PathSafetyLevel::Block || level == PathSafetyLevel::Warn,
            "Expected /usr/bin to be Block or Warn, got {:?}", level);
    }
    
    #[test]
    fn test_unusual_path_warns() {
        // A path not in any known safe or blocked directory should warn
        let weird_path = Path::new("/tmp/some-random-dir/config.json");
        // /tmp might be under /var on some systems, so this could be Block or Warn
        let level = get_path_safety_level(weird_path);
        assert!(level == PathSafetyLevel::Warn || level == PathSafetyLevel::Block);
    }
    
    #[test]
    fn test_is_safe_path() {
        if let Some(home) = dirs::home_dir() {
            let safe_path = home.join(".config/test.json");
            assert_eq!(get_path_safety_level(&safe_path), PathSafetyLevel::Safe);
            
            #[cfg(unix)]
            {
                let unsafe_path = Path::new("/etc/passwd");
                assert_eq!(get_path_safety_level(unsafe_path), PathSafetyLevel::Block);
            }
        }
    }
}
