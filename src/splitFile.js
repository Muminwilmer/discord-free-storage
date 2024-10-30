function splitFile(file, encrypted, password){
    let fileBuffer = file.buffer;
    if (encrypted){
      const encrypt = require('./encrypt')
      fileBuffer = encrypt(fileBuffer, password)
    }
    const chunkSize = 10 * 1024 * 1024; // 8MB in bytes
    const chunks = [];

    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
      const chunk = fileBuffer.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    console.log(`File uploaded: ${file.originalname}`);
    console.log(`Total chunks: ${chunks.length}`);
    console.log(`Chunk sizes:`, chunks.map(chunk => chunk.length));


    return chunks
  }
module.exports = splitFile