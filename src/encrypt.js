import crypto from 'crypto'

function getKey(key) {
  return crypto.createHash('sha256').update(key).digest(); // SHA-256 hash to get 32 bytes
}

async function encrypt(buffer, key) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const derivedKey = getKey(key);    // Ensure key is 32 bytes
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return the IV and the encrypted data
  return Buffer.concat([iv, encrypted]); // Prepend IV for decryption later
}

export default encrypt;