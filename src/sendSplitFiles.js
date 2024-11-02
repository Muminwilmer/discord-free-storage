import fs from 'fs';
import encrypt from './encrypt.js';

async function sendSplitFiles(client, channelId, filePath, fileName, encrypted, password, id) {
  const splitName = fileName.match(/^([^.]+)(\..+)?$/);
  
  const fileDetails = {
    name: splitName[1] || "corrupt",
    type: splitName[2] || "",
    encrypted: encrypted || false,
    size: 0, // Initialize size, will be calculated during sending
    finished: false,
    id: id,
    messageId: [],
  };
  console.log(fileDetails)

  await addToJson(fileDetails);
  const stats = await fs.promises.stat(filePath);
  const totalChunks = Math.ceil(stats.size / (10 * 1024 * 1024));

  // Set initial file queue info
  const initialQueueData = { name: fileName, id:id, files: 0, full: totalChunks, start:Date.now() };
  client.uploadQueue.set(id, initialQueueData);
  console.log(client.uploadQueue)

  const readStream = fs.createReadStream(filePath, { highWaterMark: 10 * 1024 * 1024 });
  let sentChunks = 0; // Counter for sent chunks

  readStream.on('data', async (chunk) => {
    readStream.pause(); // Pause the stream to handle the chunk
    try {
      // Encrypt the chunk if needed
      if (encrypted) {
        chunk = await encrypt(chunk, password);
      }
      // console.log(chunk)
      const channel = await client.channels.fetch(channelId);
      const partFileName = `part`; // Naming the part

      const sentMessage = await channel.send({
        content: `part`,
        files: [{ attachment: chunk, name: partFileName }],
      });

      // Update file details and upload queue
      fileDetails.messageId.push(sentMessage.id);
      fileDetails.size += chunk.length; // Update size for the fileDetails

      // Update upload queue
      const result = client.uploadQueue.get(id);
      if (result) {
        result.files++;
        client.uploadQueue.set(id, result);
      }

      sentChunks++
    } catch (error) {
      console.error("Error sending message or fetching channel:", error);
    } finally {
      readStream.resume(); // Resume reading the next chunk
    }
  });

  readStream.on('end', async () => {
    // Mark the file as finished
    while (sentChunks < totalChunks) {
      console.log(`Waiting for ${sentChunks}==${totalChunks}`)
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for all chunks to be sent
    }

    fileDetails.finished = true;
    fileDetails.size = (fileDetails.size / (1024 * 1024)).toFixed(2) + "MB";

    await addToJson(fileDetails); // Save details to JSON
    client.uploadQueue.delete(fileName); // Clean up the upload queue
    console.log(`Removed ${fileName} from uploadQueue`);

    // Delete the original file after processing
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  });

  readStream.on('error', (err) => {
    console.error("Error reading file:", err);
  });
}

async function addToJson(newData) {
  let existingFiles = [];
  try {
    const data = fs.readFileSync('./data/files.json', 'utf8');
    existingFiles = JSON.parse(data);
  } catch (error) {
    console.error("Error reading files.json:", error);
  }

  const findFile = existingFiles.find(
    block => block.id === newData.id && block.finished === false
  );

  if (!findFile) {
    existingFiles.push(newData);
  } else {
    Object.assign(findFile, newData);
  }

  try {
    fs.writeFileSync('./data/files.json', JSON.stringify(existingFiles, null, 2));
    console.log('File details updated in files.json');
  } catch (error) {
    console.error("Error writing to files.json:", error);
  }
}

export default sendSplitFiles;
