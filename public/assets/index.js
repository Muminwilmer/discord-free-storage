document.getElementById('uploadForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const fileName = document.getElementById('fileNameInput').value;
  const id = Math.floor(Math.random()*10000000)

  if(!file)return;
  if(!fileName)return;

  const formData = new FormData();

  formData.append('file', file);
  formData.append('fileName', fileName)
  formData.append('encrypted', document.getElementById('encryptedCheck').checked);
  formData.append('password', document.getElementById('encryptPassword').value);
  formData.append('id', id);

  document.getElementById('fileInput').value = ""
  document.getElementById('fileNameInput').value = ""
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    // alert('File received successfully!');
    pollQueue(id,"Upload")
    loadFiles()
  } else {
    alert('File upload failed.');
  }
});
document.getElementById('fileInput').addEventListener('change', function(event) {
  if (event?.target?.files){
    document.getElementById('fileNameInput').value = event.target.files[0].name;
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

    document.getElementById('encryptPassword').addEventListener('input', async (event) => {
      const password = event.target.value
      const downloadButtons = document.getElementsByClassName('download');
      Array.from(downloadButtons).forEach((button) => {
        const id = button.getAttribute('data-id'); // Assuming each button has a data-id attribute
        const fileName = button.getAttribute('data-name'); // Assuming each button has a data-name attribute
        const fileType = button.getAttribute('data-type'); // Assuming each button has a data-type attribute
        button.href = `/download?id=${id}&name=${fileName}&file=${fileType}&pass=${password}`;
      });
    })

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
        <span style=""><strong>Name:</strong> ${file.name}.${file.type}</span>
        <span style=""><strong>Size:</strong> ${file.size}</span>
        <span style="min-width:fit-content;"><strong>Encrypted:</strong> ${file.encrypted}</span>
      `;
      fileInfo.innerHTML += `<span style="display:none;" id="+${id}"><strong></strong></span>`

      const fileActions = document.createElement('div');
      fileActions.classList.add('file-actions');

      const buttonDownload = document.createElement('a');
      buttonDownload.innerHTML = "Download";
      buttonDownload.dataset.id = id;
      buttonDownload.href = `/download?id=${id}&name=${file.name}&file=${file.type}&pass=${document.getElementById('encryptPassword').value}`;
      buttonDownload.classList.add('button');
      buttonDownload.classList.add('download');
      
      buttonDownload.addEventListener('click', async () => {
        const fileId = buttonDownload.dataset.id;
        progressBar.style.display = 'block';
        pollQueue(fileId, "Download")
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

      fileActions.appendChild(buttonDownload);


      const buttonDelete = document.createElement('button');
      buttonDelete.innerHTML = "Delete";
      buttonDelete.dataset.id = id;
      buttonDelete.classList.add('button');

      buttonDelete.addEventListener('click', async () => {
        const fileId = buttonDelete.dataset.id;
        try {
          await fetch(`/delete?id=${fileId}`)
          .then(loadFiles())
          
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      });

      fileActions.appendChild(buttonDelete);


      if (!file?.finished){
        const buttonCheck = document.createElement('button');
        buttonCheck.innerHTML = "Check";
        buttonCheck.dataset.id = id;
        buttonCheck.classList.add('button');

        buttonCheck.addEventListener('click', async () => {
          const fileId = buttonCheck.dataset.id;
          try {
            pollQueue(fileId, "Upload") 
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


      fileItem.appendChild(fileInfo);
      fileItem.appendChild(fileActions);
      fileItem.appendChild(progressBar);
      filesContainer.appendChild(fileItem);
    });
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}
async function pollQueue(id, type) {
  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(`/queue?id=${id}&type=${type.toLowerCase()}`);
      const data = await response.json();
      const bar = document.getElementById(id);
      const progress = data.progress
      const remainingTime = data.remainingTime
      const completed = data.completed // Completed files
      const total = data.total // Total files
    
      // Convert remaining time to minutes and seconds
      const remainingSeconds = Math.floor(remainingTime / 1000);
      const remainingHours = Math.floor(remainingSeconds / 3600); // Total hours
      const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60); // Minutes after hours are accounted for
      const remainingSecondsFormatted = remainingSeconds % 60; // Remaining seconds after hours and minutes
      
      // Put together the time string
      let timeString = '';
      if (remainingHours > 0) timeString += `${remainingHours}h `;
      /*if (remainingMinutes > 0) */timeString += `${remainingMinutes}m `;
      /*if (remainingSecondsFormatted > 0 || timeString == '') */timeString += `${remainingSecondsFormatted}s`;
      
      if (data?.done === true || parseInt(progress)>=100) {
        loadFiles();
        clearInterval(intervalId);
      } else if (bar) {
        const fill = bar.querySelector('.progress-bar-fill'); // Target the inner fill element
        
        bar.style.display = 'block';  // Show the progress bar
        if (fill) {
          fill.style.width = progress+"%";  // Set the width to the progress value
          const ETA = document.getElementById("+"+id)
          ETA.outerHTML = `<span style="padding-left:6em;min-width:10em;" id="+${id}"><strong>ETA: </strong>${timeString||"0"}</span>`
        } else {
          console.warn('Inner fill element not found.');
        }
      } else {
        console.warn(`Progress bar with id ${id} not found.`);
      }
    } catch (error) {
      console.error('Error checking queue status:', error);
      clearInterval(intervalId); // Stop polling if there's an error
    }
  }, 2500); // Poll every 2.5 second
}