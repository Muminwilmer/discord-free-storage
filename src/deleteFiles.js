import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // Get the current file name
const __dirname = path.dirname(__filename); // Get the directory name of the current module

async function deleteFiles(client, id, channelId) {
  const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
  const result = data.find(block => block.id === String(id));

  if (!result) {
    console.log("No result")
    return;
  }

  result.messageId.forEach(async (id, index) => {
    const channel = await client.channels.fetch(channelId);
    if (!channel){
      console.log("No channel")
      return;
    }
    const fetchedMessage = await channel.messages.fetch(id)
    if (!fetchedMessage) {
      console.log("Message not found");
      return;
    }
    try {
      fetchedMessage.delete()
      console.log(`Deleted - Id: ${id}, Index: ${index}`)
    } catch (error){
      console.log(error)
    }
  });
  const updatedData = data.filter(block => block !== result);
  fs.writeFileSync('./data/files.json', JSON.stringify(updatedData, null, 2), 'utf8');
}
export default deleteFiles;