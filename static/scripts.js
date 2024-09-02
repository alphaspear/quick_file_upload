document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileName = document.getElementById('fileName');
    const progressWrapper = document.getElementById('progressWrapper');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const form = document.getElementById('uploadForm');
    const status = document.getElementById('status');

    chooseFileBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        const selectedFile = this.files.length > 0 ? this.files[0].name : '';
        fileName.textContent = selectedFile;
        uploadBtn.disabled = this.files.length === 0;
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        
        // Disable buttons
        uploadBtn.disabled = true;
        chooseFileBtn.disabled = true;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', form.action, true);
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressWrapper.style.display = 'block';
                progressBar.value = percentComplete;
                progressText.textContent = `${Math.round(percentComplete)}%`;
            }
        });

        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                status.textContent = 'Upload successful!';
                status.classList.add('success');
            } else {
                status.textContent = 'Upload failed.';
                status.classList.add('error');
            }
            // Hide progress bar after a delay and reset
            status.classList.add('fade-out');
                // Reset file input
                fileInput.value = '';
                fileName.textContent = '';
                uploadBtn.disabled = true;
                chooseFileBtn.disabled = false;
        });

        xhr.send(formData);
    });
});
