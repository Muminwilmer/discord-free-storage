import fs from 'fs';
async function deleteFiles(client, id, channelId) {
  const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
  const result = data.find(block => block.ids.includes(id));

  if (!result) {
    console.log("No result")
    return;
  }

  result.ids.forEach(async (id, index) => {
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