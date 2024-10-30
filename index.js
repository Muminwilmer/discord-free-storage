import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
const app = express();
const PORT = process.env.PORT || 3000;
import fs from 'fs'
import mime from 'mime-types'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

import sendSplitFiles from './src/sendSplitFiles.js'
import fetchFiles from './src/fetchFiles.js'
import deleteFiles from './src/deleteFiles.js'

// Create discord client
const clientModule = await import('./src/startDiscord.js');
const client = clientModule.default()

const upload = multer({
  // storage: multer.memoryStorage()
  dest: 'uploading/'
});

/* Fixa dest uploading till resten av koden istället för buffern :P */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    const filePath = path.join(__dirname, 'uploading', req.file.filename);
    const file = req.file
    const body = req.body
    const channelId = process.env.discordChannel
    // const chunks = await splitFile(filePath, JSON.parse(req.body.encrypted), req.body.password)
    // await sendSplitFiles(client, process.env.discordChannel,chunks,file.originalname, JSON.parse(body.encrypted), body.id)
    await sendSplitFiles(client, channelId, filePath, file.originalname, JSON.parse(body.encrypted), body.password, body.id)

    res.send('File received successfully!');
  } else {
    res.status(400).send('File upload failed.');
  }
});

app.get('/files', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8'));
  const safeData = []
  data.forEach(data => {
    safeData.push({
      encrypted: data.encrypted,
      id: data.ids[0] || null,
      name: data.name,
      size: data.size,
      type: data.type,
      finished: data.finished,
      shortId: data.id || null
    })
    
  });
  res.send(safeData);
});

app.get('/download', async (req, res) => {
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
      'Content-Type': mime.lookup(file) || "application/octet-stream",
      'Content-Disposition': `attachment; filename="${name}${file}"`,
      'Content-Length': fileBuffers.length
    });

    res.status(200).send(fileBuffers);
    setTimeout(() => {
      client.downloadQueue.delete(id);
      console.log(`Removed ${id} from downloadQueue`);
    }, 5000);
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
    res.send({done:true})
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
  const id = req.query.id;
  deleteFiles(client, id, process.env.discordChannel)
  res.status(200).send({deleted:true})
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
