import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.NEXTAUTH_SECRET
  ? crypto.createHash('sha256').update(process.env.NEXTAUTH_SECRET).digest()
  : crypto.createHash('sha256').update('default-dev-secret-key-32-chars').digest();

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(cipherText: string): string {
  if (!cipherText || !cipherText.includes(':')) return cipherText || '';
  const parts = cipherText.split(':');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return cipherText;

  const ivHex = parts[0];
  const authTagHex = parts[1];
  const encryptedHex = parts[2];

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
