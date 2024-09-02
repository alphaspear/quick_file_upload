document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileName = document.getElementById('fileName');
    const progressWrapper = document.getElementById('progressWrapper');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const speedText = document.getElementById('speedText');
    const sizeText = document.getElementById('sizeText');
    const form = document.getElementById('uploadForm');
    const status = document.getElementById('status');

    let startTime;

    function formatBytes(bytes) {
        if (bytes < 1024) {
            return `${bytes.toFixed(1)}B`;
        } else if (bytes < 1048576) { // 1024 * 1024
            return `${(bytes / 1024).toFixed(1)}KB`;
        } else if (bytes < 1073741824) { // 1024 * 1024 * 1024
            return `${(bytes / 1048576).toFixed(1)}MB`;
        } else {
            return `${(bytes / 1073741824).toFixed(1)}GB`;
        }
    }

    function formatSpeed(bytesPerSecond) {
        if (bytesPerSecond < 1024) {
            return `${bytesPerSecond.toFixed(1)} B/s`;
        } else if (bytesPerSecond < 1048576) { // 1024 * 1024
            return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
        } else if (bytesPerSecond < 1073741824) { // 1024 * 1024 * 1024
            return `${(bytesPerSecond / 1048576).toFixed(1)} MB/s`;
        } else {
            return `${(bytesPerSecond / 1073741824).toFixed(1)} GB/s`;
        }
    }

    chooseFileBtn.addEventListener('click', function() {
        progressWrapper.style.display = 'none';
        status.textContent = '';
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
        const selectedFileName = fileName.textContent;
        const totalFileSize = fileInput.files[0].size;

        // Disable buttons
        uploadBtn.disabled = true;
        chooseFileBtn.disabled = true;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', form.action, true);
        
        startTime = Date.now(); // Record start time
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const elapsedTime = (Date.now() - startTime) / 1000; // Time in seconds
                const percentComplete = (e.loaded / e.total) * 100;
                const bytesPerSecond = e.loaded / elapsedTime;
                const speed = formatSpeed(bytesPerSecond); // Convert speed to appropriate unit

                progressWrapper.style.display = 'block';
                progressBar.value = percentComplete;
                progressText.textContent = `${percentComplete.toFixed(1)}%`;
                speedText.textContent = `${speed}`; // Show upload speed
                sizeText.textContent = `${formatBytes(e.loaded)}/${formatBytes(totalFileSize)}`; // Show uploaded and total file size
            }
        });

        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                status.textContent = `${selectedFileName} uploaded successfully!`;
                status.classList.add('success');
            } else {
                status.textContent = `${selectedFileName} upload failed.`;
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
