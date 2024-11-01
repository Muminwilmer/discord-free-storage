import fs from 'fs';
import encrypt from './encrypt.js';

async function sendSplitFiles(client, channelId, filePath, fileName, encrypted, password, shortId) {
  const splitName = fileName.match(/^([^.]+)(\..+)?$/);
  
  const fileDetails = {
    name: splitName[1] || "corrupt",
    type: splitName[2] || "",
    encrypted: encrypted || false,
    size: 0, // Initialize size, will be calculated during sending
    finished: false,
    id: shortId,
    ids: [],
  };
  console.log(fileDetails)

  await addToJson(fileDetails);
  const stats = await fs.promises.stat(filePath);
  
  // Set initial file queue info
  const initialQueueData = { name: fileName, files: 0, full: Math.ceil(stats.size / (1024 * 1024) / 10) };
  client.uploadQueue.set(fileName, initialQueueData);

  const readStream = fs.createReadStream(filePath, { highWaterMark: 10 * 1024 * 1024 }); // Read in 10 MB chunks

  readStream.on('data', async (chunk) => {
    readStream.pause(); // Pause the stream to handle the chunk
    try {
      // Encrypt the chunk if needed
      if (encrypted) {
        
        chunk = encrypt(chunk, password);
      }

      const channel = await client.channels.fetch(channelId);
      const partFileName = `part`; // Naming the part

      const sentMessage = await channel.send({
        content: `part`,
        files: [{ attachment: chunk, name: partFileName }],
      });

      // Update file details and upload queue
      fileDetails.ids.push(sentMessage.id);
      fileDetails.size += chunk.length; // Update size for the fileDetails

      // Update upload queue
      const result = client.uploadQueue.get(fileName);
      if (result) {
        result.files++;
        client.uploadQueue.set(fileName, result);
      }
    } catch (error) {
      console.error("Error sending message or fetching channel:", error);
    } finally {
      readStream.resume(); // Resume reading the next chunk
    }
  });

  readStream.on('end', async () => {
    // Mark the file as finished
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
