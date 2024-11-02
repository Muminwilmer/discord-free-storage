import crypto from 'crypto'

function getKey(key) {
  return crypto.createHash('sha256').update(key).digest(); // SHA-256 hash to get 32 bytes
}

async function decrypt(encryptedBuffer, key) {
  const iv = encryptedBuffer.slice(0, 16); // Extract the IV
  const encryptedData = encryptedBuffer.slice(16); // Extract encrypted data
  const derivedKey = getKey(key); // Ensure key is 32 bytes
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  } catch (error){
    console.log(error)
    if (error.code === 'ERR_OSSL_BAD_DECRYPT') return 401
  } 
}

export default decrypt