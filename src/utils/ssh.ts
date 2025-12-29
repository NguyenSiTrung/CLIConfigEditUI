import { invoke } from '@tauri-apps/api/core';
import type { SshConnectionInfo, SshStatusResult } from '../types';

export async function testSshHost(sshPath: string): Promise<SshStatusResult> {
  return await invoke<SshStatusResult>('test_ssh_host', { sshPath });
}

export async function checkRemoteConnection(connection: SshConnectionInfo): Promise<SshStatusResult> {
  return await invoke<SshStatusResult>('check_remote_connection', { connection });
}

export async function readRemoteConfig(sshPath: string): Promise<string> {
  return await invoke<string>('read_remote_config', { sshPath });
}

export async function writeRemoteConfig(sshPath: string, content: string): Promise<void> {
  await invoke<void>('write_remote_config', { sshPath, content });
}

export async function checkRemoteFileExists(sshPath: string): Promise<boolean> {
  return await invoke<boolean>('check_remote_file_exists', { sshPath });
}

export async function backupRemoteConfig(sshPath: string): Promise<string> {
  return await invoke<string>('backup_remote_config', { sshPath });
}

export async function parseSshPath(sshPath: string): Promise<SshConnectionInfo> {
  return await invoke<SshConnectionInfo>('parse_ssh_path', { sshPath });
}

export function formatSshPath(connection: SshConnectionInfo): string {
  let result = '';
  if (connection.user) {
    result += `${connection.user}@`;
  }
  result += connection.host;
  if (connection.port) {
    result += `:${connection.port}`;
  }
  result += `:${connection.path}`;
  return result;
}

export function isValidSshPath(path: string): boolean {
  const sshPathRegex = /^([^@:]+@)?[^:]+:.+$/;
  return sshPathRegex.test(path.trim());
}
