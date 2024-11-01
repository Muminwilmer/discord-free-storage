document.getElementById('uploadForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const formData = new FormData();
  const id = Math.floor(Math.random()*10000000)
  formData.append('file', file);
  formData.append('encrypted', document.getElementById('encryptedCheck').checked);
  formData.append('password', document.getElementById('encryptPassword').value);
  formData.append('id', id);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    // alert('File received successfully!');
    pollQueue(file.name,"Upload", id)
    loadFiles()
  } else {
    alert('File upload failed.');
  }
});
document.getElementById('fetchFiles').addEventListener('click', async () => {
  loadFiles()
});
window.onload = function() {
  loadFiles()
}
async function loadFiles() {
  try {
    const response = await fetch('/files');
    const files = await response.json();
    const filesContainer = document.getElementById('filesContainer');
    filesContainer.innerHTML = ''; // Clear existing list

    files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.classList.add('file-item');
      let id = file.id
      if (!file.id){
        id = file.shortId
      }
      const fileInfo = document.createElement('div');
      fileInfo.classList.add('file-info');
      fileInfo.innerHTML = `
        <span style="padding-right:4em;max-width: 4em;"><strong>Name:</strong> ${file.name}${file.type}</span>
        <span style="padding-right:4em;max-width: 4em;"><strong>Size:</strong> ${file.size}</span>
        <span style="padding-right:4em;max-width: 4em;"><strong>Encrypted:</strong> ${file.encrypted}</span>
      `;
      if (!file?.finished){
        fileInfo.innerHTML += `<span style="padding-right:4em;max-width: 4em;" id="+${id}"><strong></strong></span>`
      }

      const fileActions = document.createElement('div');
      fileActions.classList.add('file-actions');

      const buttonDownload = document.createElement('button');
      buttonDownload.innerHTML = "Download";
      buttonDownload.dataset.id = id;
      fileActions.appendChild(buttonDownload);
      

      const buttonDelete = document.createElement('button');
      buttonDelete.innerHTML = "Delete";
      buttonDelete.dataset.id = id;
      fileActions.appendChild(buttonDelete);

      if (!file?.finished){
        const buttonCheck = document.createElement('button');
        buttonCheck.innerHTML = "Check";
        buttonCheck.dataset.id = id;

        buttonCheck.addEventListener('click', async () => {
          const fileId = buttonCheck.dataset.id;
          try {
            pollQueue(file.name+file.type, "Upload", fileId) 
            buttonCheck.remove()
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        });

        fileActions.appendChild(buttonCheck)
      }


      const progressBar = document.createElement('div');
      progressBar.classList.add('progress-bar');
      progressBar.id = id
      progressBar.innerHTML = `<div class="progress-bar-fill"></div>`;
      progressBar.style.display = 'none';

      buttonDownload.addEventListener('click', async () => {
        const fileId = buttonDownload.dataset.id;
        progressBar.style.display = 'block';
        pollQueue(fileId,"Download",id)
        try {
          const downloadResponse = await fetch(`/download?id=${fileId}&name=${file.name}&file=${file.type}&pass=${document.getElementById('encryptPassword').value}`);

          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch (error) {
          console.error('Error downloading file:', error);
        } finally {
          progressBar.style.display = 'none';
        }
      });

      buttonDelete.addEventListener('click', async () => {
        const fileId = buttonDelete.dataset.id;
        try {
          await fetch(`/delete?id=${fileId}`)
          .then(loadFiles())
          
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      });


      fileItem.appendChild(fileInfo);
      fileItem.appendChild(fileActions);
      fileItem.appendChild(progressBar);
      filesContainer.appendChild(fileItem);
    });
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}
async function pollQueue(fileName, type, progressBarId) {
  const start = Date.now()
  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(`/queue?name=${fileName}&type=${type.toLowerCase()}&start=${start}`);
      const data = await response.json();
      const bar = document.getElementById(progressBarId);

      if (data?.done === true || parseInt(data.progress)>=100) {
        loadFiles();
        clearInterval(intervalId);
      } else if (bar) {
        console.log(bar);
        const fill = bar.querySelector('.progress-bar-fill'); // Target the inner fill element
        
        bar.style.display = 'block';  // Show the progress bar
        if (fill) {
          fill.style.width = data.progress;  // Set the width to the progress value
          console.log(document.getElementById("+"+progressBarId))
          const ETA = document.getElementById("+"+progressBarId)
          ETA.outerHTML = `<span style="padding-right:4em;max-width: 6em;" id="+${progressBarId}"><strong>ETA: </strong>${data.remainingTime}</span>`
          // <span style="padding-right:4em;max-width: 4em;" id="+903853"><strong></strong></span>
        } else {
          console.warn('Inner fill element not found.');
        }
      } else {
        console.warn(`Progress bar with id ${progressBarId} not found.`);
      }
    } catch (error) {
      console.error('Error checking queue status:', error);
      clearInterval(intervalId); // Stop polling if there's an error
    }
  }, 2500); // Poll every 2.5 second
}