# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in CLI Config Editor, please report it responsibly:

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. Email the maintainer directly or use GitHub's private vulnerability reporting feature
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical: ASAP, high: 2 weeks, medium: 1 month)

## Security Best Practices for Users

This application reads and writes CLI tool configuration files. Please note:

- Configuration files may contain sensitive data (API keys, tokens)
- The app only accesses files in `$HOME`, `$CONFIG`, and `$APPDATA` directories
- No data is transmitted to external servers
- All operations are performed locally on your machine

## Scope

The following are in scope for security reports:

- Remote code execution
- Local privilege escalation
- Arbitrary file read/write outside allowed paths
- Cross-site scripting (XSS) in the WebView
- Insecure handling of sensitive configuration data

## Out of Scope

- Vulnerabilities in third-party dependencies (report to upstream)
- Social engineering attacks
- Physical access attacks
