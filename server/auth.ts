import crypto from 'crypto';

/**
 * Hash a password using SHA-256 with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, originalHash] = hash.split(':');
  if (!salt || !originalHash) {
    return false;
  }
  
  const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return newHash === originalHash;
}

/**
 * Generate a random student ID
 */
export function generateStudentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `STU${timestamp}${random}`;
}
