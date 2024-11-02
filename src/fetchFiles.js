import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Ensure fetch is imported if using it in Node.js

async function fetchFiles(client, id, channel, password) {
  try {
    // Load file details from JSON
    const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
    const result = data.find(block => block.id.includes(id));

    if (!result) {
      console.log("No result found");
      return;
    }

    // Initialize the download queue
    client.downloadQueue.set(id, { name: id, files: 0, full: result.ids.length, start: Date.now() });

    // Directory to store temporary chunks
    const tempDir = `./temp/${id}`;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Download each chunk and save to a temporary file
    for (const [index, fileId] of result.ids.entries()) {
      await fetchAndSaveChunk(client, fileId, channel, tempDir, index, password, result.encrypted, id);
    }

    // Concatenate all chunks into the final file
    const finalFilePath = `./downloads/${result.name}${result.type}`;
    await concatenateChunks(tempDir, finalFilePath, result.ids.length);

    // Cleanup: remove temporary files and directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log("Download complete! File saved at:", finalFilePath);
    return finalFilePath;
  } catch (error) {
    console.error("Error fetching files:", error);
  }
}

// Helper to fetch a single chunk, decrypt if needed, and save to disk
async function fetchAndSaveChunk(client, fileId, channelId, tempDir, index, password, isEncrypted, topId) {
  const channel = await client.channels.fetch(channelId);
  const fetchedMessage = await channel.messages.fetch(fileId);

  if (!fetchedMessage.attachments.size) {
    console.error(`No attachments found for id: ${fileId}`);
    return;
  }

  const attachment = fetchedMessage.attachments.first();
  const response = await fetch(attachment.url);
  const arrayBuffer = await response.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  // Decrypt if required
  if (isEncrypted) {
    const decrypt = require('./decrypt');
    buffer = await decrypt(buffer, password);
  }

  // Save chunk as a temporary file
  const tempFilePath = path.join(tempDir, `chunk_${index}`);
  fs.writeFileSync(tempFilePath, buffer);
  
  // Update download progress in queue
  const result = client.downloadQueue.get(topId);
  if (result) {
    result.files++;
    client.downloadQueue.set(topId, result);
    console.log(`Downloaded chunk ${index + 1}/${result.full}`);
  }
}

// Concatenate all chunks into a final file
async function concatenateChunks(tempDir, finalFilePath, chunkCount) {
  const writeStream = fs.createWriteStream(finalFilePath);

  for (let i = 0; i < chunkCount; i++) {
    const chunkPath = path.join(tempDir, `chunk_${i}`);
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