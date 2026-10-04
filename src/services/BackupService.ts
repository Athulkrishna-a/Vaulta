import { createFullBackup, restoreBackup, validateBackupFile, ValidationResult } from '../utils/backupRestore';
import { encryptBackupData, decryptBackupData } from './EncryptionService';
import { googleDriveService } from './GoogleDriveService';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { BackupInterval } from '../types';

export interface BackupProgressState {
  inProgress: boolean;
  stage: 'idle' | 'preparing' | 'encrypting' | 'uploading' | 'downloading' | 'decrypting' | 'validating' | 'restoring' | 'completed' | 'error';
  message: string;
}

class BackupService {
  private isBackupInProgress = false;
  private listenersRegistered = false;

  public isRunning(): boolean {
    return this.isBackupInProgress;
  }

  /**
   * Perform end-to-end cloud backup to Google Drive
   */
  async performCloudBackup(onProgress?: (state: BackupProgressState) => void): Promise<{ timestamp: string }> {
    if (this.isBackupInProgress) {
      throw new Error('A backup or restore operation is already in progress. Please wait.');
    }

    this.isBackupInProgress = true;

    try {
      onProgress?.({ inProgress: true, stage: 'preparing', message: 'Collecting transactions, categories & settings...' });
      const rawPayload = await createFullBackup();
      const rawJsonString = JSON.stringify(rawPayload);

      onProgress?.({ inProgress: true, stage: 'encrypting', message: 'Encrypting backup with AES-GCM 256-bit...' });
      const encryptedContainer = await encryptBackupData(rawJsonString);

      onProgress?.({ inProgress: true, stage: 'uploading', message: 'Uploading backup to Google Drive...' });
      const { timestamp } = await googleDriveService.uploadBackup(encryptedContainer);

      await Preferences.set({ key: 'last_gdrive_backup_time', value: timestamp });

      onProgress?.({ inProgress: false, stage: 'completed', message: 'Cloud backup completed successfully!' });
      return { timestamp };
    } catch (error) {
      onProgress?.({ inProgress: false, stage: 'error', message: (error as Error).message });
      throw error;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Download, decrypt, validate, and restore data from Google Drive
   */
  async performCloudRestore(onProgress?: (state: BackupProgressState) => void): Promise<ValidationResult> {
    if (this.isBackupInProgress) {
      throw new Error('A backup or restore operation is already in progress. Please wait.');
    }

    this.isBackupInProgress = true;

    try {
      onProgress?.({ inProgress: true, stage: 'downloading', message: 'Fetching backup file from Google Drive...' });
      const encryptedContent = await googleDriveService.downloadBackup();

      onProgress?.({ inProgress: true, stage: 'decrypting', message: 'Decrypting backup contents...' });
      const rawJsonString = await decryptBackupData(encryptedContent);

      let payload: any;
      try {
        payload = JSON.parse(rawJsonString);
      } catch (err) {
        throw new Error('Downloaded backup is not a valid JSON structure.');
      }

      onProgress?.({ inProgress: true, stage: 'validating', message: 'Validating backup version & record schemas...' });
      const validation = validateBackupFile(payload);

      if (!validation.valid) {
        onProgress?.({ inProgress: false, stage: 'error', message: `Validation failed: ${validation.errors.join('; ')}` });
        return validation;
      }

      onProgress?.({ inProgress: true, stage: 'restoring', message: 'Restoring transactions, accounts & settings into local database...' });
      await restoreBackup(payload);

      onProgress?.({ inProgress: false, stage: 'completed', message: 'Data restore completed successfully!' });
      return validation;
    } catch (error) {
      onProgress?.({ inProgress: false, stage: 'error', message: (error as Error).message });
      throw error;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Register native app lifecycle background backup check (NO setInterval used)
   */
  initBackgroundSync(getBackupConfig: () => { autoBackup: boolean; interval: BackupInterval; lastBackupTimestamp?: string }) {
    if (this.listenersRegistered) return;
    this.listenersRegistered = true;

    // Trigger check whenever native app returns to foreground / state changes
    App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        const config = getBackupConfig();
        await this.checkAndRunAutoBackup(config);
      }
    });

    // Also run an initial check on app boot
    setTimeout(() => {
      const config = getBackupConfig();
      this.checkAndRunAutoBackup(config);
    }, 5000);
  }

  private async checkAndRunAutoBackup(config: { autoBackup: boolean; interval: BackupInterval; lastBackupTimestamp?: string }) {
    if (!config.autoBackup || config.interval === 'manual' || config.interval === 'never' || this.isBackupInProgress) {
      return;
    }

    const lastTimeStr = config.lastBackupTimestamp;
    const lastTime = lastTimeStr ? new Date(lastTimeStr).getTime() : 0;
    const now = Date.now();
    const elapsedMs = now - lastTime;

    let requiredMs = 24 * 3600 * 1000; // Daily
    if (config.interval === 'weekly') {
      requiredMs = 7 * 24 * 3600 * 1000;
    } else if (config.interval === 'monthly') {
      requiredMs = 30 * 24 * 3600 * 1000;
    } else if (config.interval === '90_days') {
      requiredMs = 90 * 24 * 3600 * 1000;
    }

    if (elapsedMs >= requiredMs) {
      console.log(`Auto-backup interval (${config.interval}) reached. Starting silent cloud backup...`);
      try {
        const { backupToSupabase } = await import('./supabaseStorageSync');
        await backupToSupabase();
      } catch (err) {
        console.warn('Silent background Supabase backup failed:', err);
      }
    }
  }
}

export const backupService = new BackupService();
