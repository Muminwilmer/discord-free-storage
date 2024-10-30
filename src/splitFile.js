// function splitFile(file, encrypted, password){
//     let fileBuffer = file.buffer;
//     if (encrypted){
//       const encrypt = require('./encrypt')
//       fileBuffer = encrypt(fileBuffer, password)
//     }
//     const chunkSize = 10 * 1024 * 1024; // 8MB in bytes
//     const chunks = [];

//     for (let i = 0; i < fileBuffer.length; i += chunkSize) {
//       const chunk = fileBuffer.slice(i, i + chunkSize);
//       chunks.push(chunk);
//     }

//     console.log(`File uploaded: ${file.originalname}`);
//     console.log(`Total chunks: ${chunks.length}`);
//     console.log(`Chunk sizes:`, chunks.map(chunk => chunk.length));


//     return chunks
//   }
import fs from 'fs';
import path from 'path';

async function splitFile(filePath, encrypted, password) {
  const chunkSize = 10 * 1024 * 1024; // 10MB in bytes
  const chunks = [];
  let currentChunk = Buffer.alloc(0);

  const readStream = fs.createReadStream(filePath, { highWaterMark: chunkSize });

  return new Promise((resolve, reject) => {
    readStream.on('data', (chunk) => {
      if (encrypted) {
        const encrypt = require('./encrypt');
        chunk = encrypt(chunk, password);
      }
      
      chunks.push(chunk);
    });

    readStream.on('end', () => {
      console.log(`File uploaded: ${path.basename(filePath)}`);
      console.log(`Total chunks: ${chunks.length}`);
      console.log(`Chunk sizes:`, chunks.map((chunk) => chunk.length));
      resolve(chunks);
    });

    readStream.on('error', (err) => {
      console.error("Error reading file:", err);
      reject(err);
    });
  });
}

export default splitFile;