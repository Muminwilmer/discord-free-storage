import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Ensure fetch is imported if using it in Node.js
import decrypt from './decrypt.js';

async function fetchFiles(client, id, channel, password) {
  try {
    // Load file details from JSON
    const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
    const result = data.find(block => block.id === String(id));

    if (!result) {
      console.log("No result found");
      return;
    }
    
    // Initialize the download queue
    client.downloadQueue.set(id, { name: result.name, id:id, files: 0, full: result.messageId.length, start: Date.now() });
    // Directory to store temporary chunks
    const tempDir = `./temp/${id}`;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Download each chunk and save to a temporary file
    for (const [index, fileId] of result.messageId.entries()) {
      await fetchAndSaveChunk(client, fileId, channel, tempDir, index, password, result.encrypted, id);
    }

    // Concatenate all chunks into the final file
    const finalFilePath = `./downloads/${result.id}`;
    await concatenateChunks(tempDir, finalFilePath, result.messageId.length);

    // Cleanup: remove temporary files and directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log("Download complete! File saved at:", finalFilePath);
    return finalFilePath;
  } catch (error) {
    console.error("Error fetching files:", error);
  }
}

async function fetchWithTimeout(url, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Request timed out after ${timeout / 1000} seconds`);
    } else {
      console.error("Error fetching file:", error);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

// Helper to fetch a single chunk, decrypt if needed, and save to disk
async function fetchAndSaveChunk(client, fileId, channelId, tempDir, index, password, isEncrypted, id, retryCount = 3) {
  const channel = await client.channels.fetch(channelId);
  const fetchedMessage = await channel.messages.fetch(fileId);

  if (!fetchedMessage.attachments.size) {
    console.error(`No attachments found for id: ${fileId}`);
    return;
  }

  const attachment = fetchedMessage.attachments.first();
  
  let buffer;
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const response = await fetchWithTimeout(attachment.url, 30000); // 30-second timeout
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      break; // Exit the loop if successful
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for chunk ${index}: ${error.message}`);
      if (attempt === retryCount - 1) {
        throw new Error(`Failed to fetch chunk ${index} after ${retryCount} attempts`);
      }
    }
  }

  // Decrypt if required
  if (isEncrypted) {
    buffer = await decrypt(buffer, password);
  }
  console.log(buffer)
  // Save chunk as a temporary file
  if (Buffer.isBuffer(buffer)) {
    const tempFilePath = path.join(tempDir, `${id}_${index}`);
    fs.writeFileSync(tempFilePath, buffer);
    
    // Update download progress in queue
    const result = client.downloadQueue.get(id);
    if (result) {
      result.files++;
      client.downloadQueue.set(id, result);
      console.log(`Downloaded chunk ${index + 1}/${result.full}`);
    }
  } else {
    console.error(`Invalid buffer data for chunk ${index}, skipping write.`);
  }
}

// Concatenate all chunks into a final file
async function concatenateChunks(tempDir, finalFilePath, chunkCount) {
  const writeStream = fs.createWriteStream(finalFilePath);

  for (let i = 0; i < chunkCount; i++) {
    const chunkPath = path.join(tempDir, `${id}_${index}`);
    const chunkStream = fs.createReadStream(chunkPath);

    // Pipe chunk into final file
    await new Promise((resolve, reject) => {
      chunkStream.pipe(writeStream, { end: false });
      chunkStream.on('end', resolve);
      chunkStream.on('error', reject);
    });
  }

  writeStream.end(); // Close the write stream when done
}

export default fetchFiles