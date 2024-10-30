const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs')
const mime = require('mime-types')

app.use(express.static(path.join(__dirname, 'public')));

const splitFile = require('./src/splitFile')
const sendSplitFiles = require('./src/sendSplitFiles')
const fetchFiles = require('./src/fetchFiles')
// Create discord client
const client = (require('./src/startDiscord'))();


const upload = multer({
  storage: multer.memoryStorage()
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const chunks = splitFile(req.file, req.body.encrypted||false, req.body.password||null)
    sendSplitFiles(client,process.env.discordChannel,chunks,req.file.originalname, req.body.encrypted||false)
    res.send('File received successfully!');
  } else {
    res.status(400).send('File upload failed.');
  }
});

app.get('/files', (req, res) => {
  const data = fs.readFileSync('./data/files.json', 'utf8');
  res.send(data);
});

app.get('/download', async (req, res) => {
  console.log("a")
  const id = req.query.id;
  const name = req.query.name;
  const file = req.query.file;
  const password = req.query.pass || "1234"
  try {
    const fileBuffers = await fetchFiles(client, id, process.env.discordChannel, password);

    if (!fileBuffers || !fileBuffers.length) {
      return res.status(404).send('No files found for the specified ID.');
    }

    res.set({
      'Content-Type': mime.lookup(file),
      'Content-Disposition': `attachment; filename="${name}${file}"`,
      'Content-Length': fileBuffers.length
    });

    res.status(200).send(fileBuffers);
    setTimeout(() => {
      client.downloadQueue.delete(id);
      console.log(`Removed ${id} from downloadQueue`);
    }, 10000);
  } catch (error) {
    console.error("Error during file download:", error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.get('/queue', async (req, res) => {
  let name = req.query.name
  const type = req.query.type+"Queue";
  const start = req.query.start
  const result = client[type].get(name);
  if (!result){
    res.send(null)
    return;
  }
  const completedFiles = result.files;
  const totalFiles = result.full;
  const progressPercent = (completedFiles / totalFiles) * 100; // % completed

  
  const elapsedTime = Date.now() - start;

  const averageTimePerFile = elapsedTime / completedFiles; // Average time per file in milliseconds
  const remainingFiles = totalFiles - completedFiles; // Remaining files
  const estimatedRemainingTime = remainingFiles * averageTimePerFile; // Remaining time in milliseconds

  const remainingSeconds = Math.floor(estimatedRemainingTime / 1000);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsFormatted = remainingSeconds % 60;
  console.log(type)
  if (type == "downloadQueue"){
    const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
    const block = data.find(block => block.ids.includes(name));
    name = block.name
  }
  res.status(200).send({
    progress: `${Math.floor(progressPercent * 10) / 10}%`, // Send formatted progress
    remainingTime: `${remainingMinutes}m ${remainingSecondsFormatted}s`, // Send formatted remaining time
    name: name
  });
});

app.get('/delete', async (req, res) => {
  const deleteFiles = require('./src/deleteFiles')
  const id = req.query.id;
  deleteFiles(client, id, process.env.discordChannel)
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
