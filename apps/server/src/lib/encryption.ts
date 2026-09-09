import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'medimatch-secret-32-character-key!';
// Ensure 32 bytes for aes-256
const KEY_BUFFER = crypto.createHash('sha256').update(SECRET_KEY).digest();
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  if (!text) return '';
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return text; // Not encrypted
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return text;
  }
}

export function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  const visibleStart = key.slice(0, 4);
  const visibleEnd = key.slice(-4);
  return `${visibleStart}${'*'.repeat(Math.max(4, key.length - 8))}${visibleEnd}`;
}

