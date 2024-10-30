const fs = require('fs')
async function fetchFiles(client, id, channel, password) {
  try {
    const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
    const result = data.find(block => block.ids.includes(id));

    if (!result) {
      console.log("No result")
      return;
    }

    console.log(result);
    client.downloadQueue.set(id, { name: id, files: 0, full: result.ids.length });

    const fileList = await Promise.all(result.ids.map(async (fileId) => {
      return await fetchDiscord(client, fileId, channel, id);
    }));

    // console.log(fileList);
    const fullFile = Buffer.concat(fileList);
    if (result.encrypted){
      const decrypt = require('./decrypt')
      const decryptedFile = await decrypt(fullFile, password)
      return decryptedFile
    }
    return fullFile
  } catch (error) {
    console.error("Error fetching files:", error);
  }
}

async function fetchDiscord(client, id, channelId, topId) {
  const channel = await client.channels.fetch(channelId);
  if (!channel){
    console.log("No channel")
    return;
  }
  const fetchedMessage = await channel.messages.fetch(id)

  if (fetchedMessage.attachments.size == 0) {
    console.error(`No attachments found for id: ${messageId}`);
    return null;
  }

  const attachment = fetchedMessage.attachments.first();

  const response = await fetch(attachment.url)
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(`Downloaded ${attachment.name} with size ${Math.round(buffer.byteLength/1000/1000)} MB.`);
  const result = client.downloadQueue.get(topId);
  if (result) {
    result.files++;
    client.downloadQueue.set(topId, result);
    console.log(result.files)
  }
  
  return buffer
}
module.exports = fetchFiles