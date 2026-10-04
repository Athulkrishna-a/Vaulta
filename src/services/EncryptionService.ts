/**
 * Web Crypto API AES-GCM 256-bit encryption for expense data backups.
 * Encrypts and decrypts versioned JSON data before storing on Google Drive.
 */

const SALT_SIZE = 16; // 128-bit salt
const IV_SIZE = 12; // 96-bit IV for AES-GCM
const KEY_ITERATIONS = 100000;

// Device-scoped static pepper combined with passkey
const PepperKey = 'Vaulta_ExpenseTrack_Secure_Backup_V1';

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase + PepperKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: KEY_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptBackupData(
  jsonDataString: string,
  passphrase = 'VaultaAppSecureBackupKey'
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonDataString);

  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));

  const key = await deriveKey(passphrase, salt);

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  const container = {
    version: 1,
    encrypted: true,
    algorithm: 'AES-GCM-256',
    exportedAt: new Date().toISOString(),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    payload: bufferToBase64(encryptedContent),
  };

  return JSON.stringify(container, null, 2);
}

export async function decryptBackupData(
  encryptedContainerJson: string,
  passphrase = 'VaultaAppSecureBackupKey'
): Promise<string> {
  let container: any;
  try {
    container = JSON.parse(encryptedContainerJson);
  } catch (err) {
    throw new Error('Invalid backup file format: Not valid JSON.');
  }

  // If file is unencrypted legacy JSON, return raw JSON string directly
  if (!container.encrypted || !container.payload) {
    return encryptedContainerJson;
  }

  if (!container.salt || !container.iv) {
    throw new Error('Encrypted backup is missing salt or IV parameters.');
  }

  const salt = base64ToBuffer(container.salt);
  const iv = base64ToBuffer(container.iv);
  const payload = base64ToBuffer(container.payload);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      payload as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed: Incorrect encryption key or corrupted backup payload.');
  }
}
