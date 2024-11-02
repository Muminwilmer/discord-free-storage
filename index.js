import express from 'express'; // Import the Express library
import path from 'path'; // Import the path module for handling file paths
import { fileURLToPath } from 'url'; // Import fileURLToPath to handle URL paths in ES modules
import multer from 'multer'; // Import multer for handling file uploads
import fs from 'fs'; // Import the filesystem module to interact with the filesystem
import mime from 'mime-types'; // Import mime-types to handle file MIME types

const app = express(); // Create an instance of an Express application
const PORT = process.env.PORT || 3000; // Set the port to listen on, defaults to 3000
const __filename = fileURLToPath(import.meta.url); // Get the current file name
const __dirname = path.dirname(__filename); // Get the directory name of the current module

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import custom modules for handling file operations
import sendSplitFiles from './src/sendSplitFiles.js';
import fetchFiles from './src/fetchFiles.js';
import deleteFiles from './src/deleteFiles.js';

// Create a Discord client instance
const clientModule = await import('./src/startDiscord.js');
const client = clientModule.default(); // Initialize the Discord client

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploading/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });


// Clear out uploading and downloading on boot
const uploadPath = path.join(__dirname, 'uploading');
console.log("Attempting to delete:", uploadPath)
fs.readdir(uploadPath, (err, files) => {
  if (files.length==0)return;
  for (const file of files) {
    fs.unlink(path.join(uploadPath, file), () => {})
  }
});

const downloadPath = path.join(__dirname, 'downloads');
console.log("Attempting to delete:", downloadPath)
fs.readdir(downloadPath, (err, files) => {
  if (files.length==0)return;
  for (const file of files) {
    fs.unlink(path.join(downloadPath, file), () => {});
  }
});





/*
  Define a route to serve the main HTML page.
  Example: When accessing http://localhost:3000/, the server will respond with 'index.html'.
*/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html')); // Send the index.html file
});

/*
  Define a route to handle file uploads.
  Example: Sending a POST request to http://localhost:3000/upload with a file in the 'file' field.
*/
app.post('/upload', upload.single('file'), async (req, res) => {
  if (req.file) { // Check if a file was uploaded
    const originalFilePath = path.join(__dirname, 'uploading', req.file.filename); // Path of the original file
    const newFilePath = path.join(__dirname, 'uploading', req.body.id); // New path using body.id as the filename

    // Rename the file to use req.body.id
    fs.rename(originalFilePath, newFilePath, async (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).send('Error processing the file.');
      }

      // Proceed with further processing after renaming
      const file = req.file; // Get the uploaded file information
      const body = req.body; // Get additional form data
      const channelId = process.env.discordChannel; // Get Discord channel ID from environment variables
      const fileName = body.fileName || file.originalname;

      // Send the split files to the specified Discord channel
      await sendSplitFiles(client, channelId, newFilePath, fileName, JSON.parse(body.encrypted), body.password, body.id);

      res.send('File received and renamed successfully!'); // Respond to the client
    });
  } else {
    res.status(400).send('File upload failed.'); // Respond with an error if no file was uploaded
  }
});

/*
  Define a route to retrieve a list of uploaded files.
  Example: Accessing http://localhost:3000/files will return JSON data of uploaded files.
*/
app.get('/files', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8')); // Read the files.json data
  const safeData = data.map(item => ({
    encrypted: item.encrypted,
    id: item.id || null, // Get the first ID or null
    name: item.name,
    size: item.size,
    type: item.type,
    finished: item.finished,
  }));

  res.send(safeData); // Send the list of files as JSON
});

/*
  Define a route for downloading files.
  Example: Sending a GET request to http://localhost:3000/download?id=123&name=test.txt&file=test.txt&pass=1234.
*/
app.get('/download', async (req, res) => {
  const id = req.query.id; // Retrieve file ID from query parameters
  const name = req.query.name; // Retrieve file name from query parameters
  const file = req.query.file; // Retrieve file name from query parameters
  const password = req.query.pass || "0000"; // Retrieve password or use default to make encrypt not scream at me

  try {
    // Fetch files using the provided ID and password
    console.log(id)
    const filePath = await fetchFiles(client, id, process.env.discordChannel, password);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).send('No files found for the specified ID.'); // Error if no files found
    }

    // Set the headers for file download
    res.set({
      'Content-Type': mime.lookup(filePath) || "application/octet-stream", // Set the file type
      'Content-Disposition': `attachment; filename="${name}"`, // Set the filename for download
      'Content-Length': fs.statSync(filePath).size // Set the content length
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // res.status(200).send(filePath); // Send the file buffers as the response

    // Cleanup after a delay
    setTimeout(() => {
      client.downloadQueue.delete(id); // Remove the ID from the download queue
      console.log(`Removed ${id} from downloadQueue`); // Log removal
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      console.log("Deleted file.")
    }, 5000);
  } catch (error) {
    console.error("Error during file download:", error); // Log any errors
    res.status(500).send('An error occurred while processing your request.'); // Respond with an error
  }
});

/*
  Define a route to check the progress of queued operations.
  Example: Sending a GET request to http://localhost:3000/queue?name=test&type=download&start=timestamp.
*/
app.get('/queue', async (req, res) => {
  let id = req.query.id; // Get the name from query parameters
  const type = req.query.type + "Queue"; // Determine the queue type (downloadQueue, uploadQueue, etc.)
  const result = client[type].get(id); // Retrieve the result from the appropriate queue
  if (!result) {
    res.send({ done: true }); // If no result found, send done status
    return;
  }

  // Calculate progress and estimated remaining time
  const completedFiles = result.files;
  const totalFiles = result.full;
  const progressPercent = (completedFiles / totalFiles) * 100; // Percentage of completion

  const elapsedTime = Date.now() - result.start; // Calculate elapsed time
  const averageTimePerFile = elapsedTime / completedFiles; // Average time per file
  const remainingFiles = totalFiles - completedFiles; // Remaining files
  const estimatedRemainingTime = remainingFiles * averageTimePerFile; // Estimated remaining time

  // Convert remaining time to minutes and seconds
  const remainingSeconds = Math.floor(estimatedRemainingTime / 1000);
  const remainingHours = Math.floor(remainingSeconds / 3600); // Total hours
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60); // Minutes after hours are accounted for
  const remainingSecondsFormatted = remainingSeconds % 60; // Remaining seconds after hours and minutes
  
  // Put together the time string
  let timeString = '';
  if (remainingHours > 0) timeString += `${remainingHours}h `;
  if (remainingMinutes > 0) timeString += `${remainingMinutes}m `;
  if (remainingSecondsFormatted > 0 || timeString == '') timeString += `${remainingSecondsFormatted}s`;
  

  // Special handling for download queue to get the name
  // if (type === "downloadQueue") {
  //   const data = JSON.parse(fs.readFileSync('./data/files.json', 'utf8')); // Read file data
  //   const block = data.find(block => block.id.includes(id)); // Find the block for the name
  //   id = block.id; // Update name with the found block name
  // }

  // Respond with progress and estimated remaining time
  res.status(200).send({
    progress: `${Math.floor(progressPercent * 10) / 10}%`, // Send formatted progress
    remainingTime: timeString.trim(), // Send formatted remaining time
    name: id // Send the name of the file or operation
  });
});

/*
  Define a route to delete files from the server or the Discord channel.
  Example: Sending a GET request to http://localhost:3000/delete?id=123.
*/
app.get('/delete', async (req, res) => {
  const id = req.query.id; // Retrieve the ID from query parameters
  await deleteFiles(client, id, process.env.discordChannel); // Delete the file using the provided ID

  res.status(200).send({ deleted: true }); // Respond with a success message
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log the server start message
});
