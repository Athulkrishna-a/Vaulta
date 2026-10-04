import { supabase } from './supabaseClient';
import { getCurrentUser } from './supabaseAuth';
import { createFullBackup, validateBackupFile, restoreBackup, ValidationResult } from '../utils/backupRestore';
import { settingsRepository } from '../data/repositories/settingsRepository';

const BUCKET_NAME = 'vaulta-backups';
const FILE_NAME = 'vaulta-backup.json';

export interface StorageSyncResult {
  success: boolean;
  message: string;
  timestamp?: string;
  summary?: ValidationResult['summary'];
}

/**
 * Backup local IndexedDB data as a versioned JSON file to private Supabase Storage
 */
export async function backupToSupabase(): Promise<StorageSyncResult> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User is not authenticated. Please sign in to your Supabase account.');
  }

  // 1. Generate full versioned JSON backup object from IndexedDB
  const backupPayload = await createFullBackup();
  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  const filePath = `${user.id}/${FILE_NAME}`;

  // 2. Upload file to Supabase Storage bucket with upsert = true
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, blob, {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) {
    // If bucket doesn't exist yet or storage error occurred
    throw new Error(`Cloud Storage upload failed: ${error.message}`);
  }

  const timestamp = new Date().toISOString();

  // 3. Save last cloud backup timestamp in local settings
  const settings = await settingsRepository.get();
  await settingsRepository.update({
    driveBackup: {
      ...settings.driveBackup,
      connected: true,
      userEmail: user.email,
      lastBackupTimestamp: timestamp,
      autoBackup: false,
      interval: 'manual',
      wifiOnly: false,
    },
  });

  return {
    success: true,
    message: 'JSON Backup uploaded successfully to Supabase Storage.',
    timestamp,
    summary: {
      transactionCount: backupPayload.transactions.length,
      categoryCount: backupPayload.categories.length,
      accountCount: backupPayload.accounts.length,
      budgetCount: backupPayload.budgets.length,
      exportedAt: backupPayload.exportedAt,
    },
  };
}

/**
 * Download versioned JSON backup file from Supabase Storage & restore to local IndexedDB
 */
export async function restoreFromSupabase(): Promise<StorageSyncResult> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User is not authenticated. Please sign in to your Supabase account.');
  }

  const filePath = `${user.id}/${FILE_NAME}`;

  // 1. Download file blob from Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download backup file from cloud: ${error.message}`);
  }

  if (!data) {
    throw new Error('No backup file found in your Supabase Cloud Storage.');
  }

  // 2. Read and parse JSON text
  const jsonText = await data.text();
  let payload: any;
  try {
    payload = JSON.parse(jsonText);
  } catch (err) {
    throw new Error('Downloaded backup file is not valid JSON.');
  }

  // 3. Validate backup payload structure & schema
  const validation = validateBackupFile(payload);
  if (!validation.valid) {
    throw new Error(`Backup validation error: ${validation.errors.join('; ')}`);
  }

  // 4. Safely restore into local IndexedDB
  await restoreBackup(payload);

  return {
    success: true,
    message: 'Cloud backup downloaded and restored into local database successfully.',
    timestamp: payload.exportedAt,
    summary: validation.summary,
  };
}
