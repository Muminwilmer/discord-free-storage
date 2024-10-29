async function sendSplitFiles(client, channelId, chunks, fileName) {
  const fs = require('fs');
  
  const splitName = fileName.match(/^([^.]+)(\..+)?$/);
  console.log(splitName)
  const fileDetails = {
    name: splitName[1] || "corrupt",
    type: splitName[2] || "",
    size: `${Math.round(chunks.reduce((total, chunk) => total + chunk.length, 0)/1000/1000)}MB`||0,
    ids: []
  };
  client.uploadQueue.set(fileName, { name: fileName, files: 0, full: chunks.length });
  // Collect promises
  const sendPromises = chunks.map(async (chunk, index) => {
    try {
      const channel = await client.channels.fetch(channelId);
      const fileBuffer = Buffer.from(chunk);
      const partFileName = `part`;

      const sentMessage = await channel.send({
        content: `chunk`,
        files: [
          {
            attachment: fileBuffer,
            name: partFileName
          }
        ]
      });

      fileDetails.ids.push(sentMessage.id);
      console.log(client.uploadQueue)
      const result = client.uploadQueue.get(fileName);
      if (result) {
          result.files++;
          client.uploadQueue.set(fileName, result);
      }
    } catch (error) {
      console.error("Error sending message or fetching channel:", error);
    }
  });

  // Wait for promises
  await Promise.all(sendPromises);

  let existingFiles = [];
  try {
    const data = fs.readFileSync('./data/files.json', 'utf8');
    existingFiles = JSON.parse(data);
  } catch (error) {
    console.error("Error reading files.json:", error);
  }

  existingFiles.push(fileDetails);

  try {
    fs.writeFileSync('./data/files.json', JSON.stringify(existingFiles, null, 2));
    console.log('File details updated in files.json');
  } catch (error) {
    console.error("Error writing to files.json:", error);
  }
  setTimeout(() => {
    client.uploadQueue.delete(fileName);
    console.log(`Removed ${fileName} from uploadQueue`);
  }, 10000);
}

module.exports = sendSplitFiles;
