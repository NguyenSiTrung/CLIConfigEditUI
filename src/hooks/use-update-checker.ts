import { useState, useEffect, useCallback, useRef } from 'react';
import { check, type Update, type DownloadEvent } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateInfo {
  version: string;
  body?: string;
  date?: string;
}

export interface UseUpdateCheckerResult {
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  isChecking: boolean;
  checkError: string | null;
  checkForUpdates: () => Promise<void>;
  downloadAndInstall: () => Promise<void>;
  isInstalling: boolean;
  installProgress: number;
  dismissUpdate: () => void;
}

const CHECK_DEBOUNCE_MS = 5000;
const LAST_CHECK_KEY = 'lastUpdateCheck';
const DISMISSED_VERSION_KEY = 'dismissedUpdateVersion';

export function useUpdateChecker(checkOnMount = true): UseUpdateCheckerResult {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const updateRef = useRef<Update | null>(null);

  const checkForUpdates = useCallback(async () => {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const now = Date.now();
    
    if (lastCheck && now - parseInt(lastCheck, 10) < CHECK_DEBOUNCE_MS) {
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    try {
      const update = await check();
      localStorage.setItem(LAST_CHECK_KEY, now.toString());

      if (update) {
        updateRef.current = update;
        
        const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
        if (dismissedVersion === update.version) {
          return;
        }

        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version,
          body: update.body ?? undefined,
          date: update.date ?? undefined,
        });
      } else {
        setUpdateAvailable(false);
        setUpdateInfo(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check for updates';
      if (!errorMessage.includes('no updates available') && 
          !errorMessage.includes('network') &&
          !errorMessage.includes('fetch')) {
        setCheckError(errorMessage);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!updateRef.current) return;

    setIsInstalling(true);
    setInstallProgress(0);

    try {
      let downloaded = 0;
      let contentLength = 0;
      
      await updateRef.current.downloadAndInstall((event: DownloadEvent) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength ?? 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setInstallProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case 'Finished':
            setInstallProgress(100);
            break;
        }
      });

      await relaunch();
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : 'Failed to install update');
      setIsInstalling(false);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    if (updateInfo) {
      localStorage.setItem(DISMISSED_VERSION_KEY, updateInfo.version);
    }
    setUpdateAvailable(false);
    setUpdateInfo(null);
  }, [updateInfo]);

  useEffect(() => {
    if (checkOnMount) {
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [checkOnMount, checkForUpdates]);

  return {
    updateAvailable,
    updateInfo,
    isChecking,
    checkError,
    checkForUpdates,
    downloadAndInstall,
    isInstalling,
    installProgress,
    dismissUpdate,
  };
}
