

document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('videoElement');
    const toggleCameraButton = document.getElementById('toggleCameraButton');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const imagePreview = document.getElementById('imagePreview');
    const alertButton = document.getElementById('alertButton');
    const resetButton = document.getElementById('resetButton');
    let isCameraOn = false;
    let captureInterval;

    // Request permission for notifications
    // if (Notification.permission === 'default') {
    //     Notification.requestPermission();
    // }

    async function getVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            videoElement.style.margin = 'auto';
            videoElement.style.width = '100%';
            videoElement.style.height = '300px';
            imagePreview.style.display = 'none';

            // Start capturing frames
            captureInterval = setInterval(captureFrame, 1000 / 25); // 25 frames per second
        } catch (err) {
            console.error('Error accessing camera: ', err);
            alert('Camera Access Denied Please enable camera access in your browser settings.');
        }
    }

    function stopVideo() {
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        clearInterval(captureInterval);
    }

    // function showNotification(title, body) {
    //     if (Notification.permission === 'granted') {
    //         new Notification(title, { body });
    //     } else {
    //         alert(`${title}: ${body}`);
    //     }
    // }

    toggleCameraButton.addEventListener('click', () => {
        if (isCameraOn) {
            stopVideo();
            toggleCameraButton.textContent = 'Open Camera';
        } else {
            const userConfirmed = confirm('Do you want to open your camera?');
            if (userConfirmed) {
                getVideo();
                toggleCameraButton.textContent = 'Close Camera';
            } else {
                alert('Camera Access Denied Please enable camera access in your browser settings.');
            }
        }
        isCameraOn = !isCameraOn;
    });

    uploadButton.addEventListener('click', () => {
        if (uploadButton.textContent === 'Upload Image') {
            fileInput.click();
        } else {
            processImage();
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const dataUrl = e.target.result;
                imagePreview.src = dataUrl;
                imagePreview.style.display = 'block';
                imagePreview.style.margin = 'auto';
                imagePreview.style.width = '100%';
                imagePreview.style.height = '300px';
                videoElement.style.display = 'none';
                uploadButton.textContent = 'Send Image for Processing';
            };

            reader.readAsDataURL(file);
        }
    });

    function processImage() {
        // Hide the image preview
        imagePreview.style.display = 'block';

        // Simulate image processing using the AI model
        setTimeout(() => {
            const isDrowsy = Math.random() < 0.5; 
            alertButton.textContent = isDrowsy ? 'Drowsy--> danger' : 'Safe';
            alertButton.style.background = isDrowsy ? 'red' : 'green';
            alertButton.style.color = '#fff';
            // alertButton.style.display = 'block';
            if (isDrowsy) {
                playAlertSound();
            } else {
                alertButton.classList.remove('alert');
                alertButton.classList.add('safe');
                alertButton.textContent = 'Safe';
            }
            uploadButton.textContent = 'Upload Image';
        }, 2000);
    }

    function playAlertSound() {
        const alertSound = new Audio('../voice/alert2.mp3'); 
        alertSound.play();
    }

    resetButton.addEventListener('click',()=>{
        location.reload();
    })

    function captureFrame() {
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                sendFrameToModel(blob);
            }, 'image/jpeg');
        }
    }

    async function sendFrameToModel(blob) {
        const formData = new FormData();
        formData.append('file', blob);

        try {
            const response = await fetch('/process_frame', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            resultDiv.textContent = result.drowsy ? 'Drowsy' : 'Safe';
            resultDiv.style.color = result.drowsy ? 'red' : 'green';
            if (result.drowsy) {
                alertButton.style.display = 'block';
                alertButton.style.margin = 'auto';
                playAlertSound();
            } else {
                alertButton.classList.remove('alert');
                alertButton.classList.add('safe');
                alertButton.textContent = 'Safe';
            }
        } catch (error) {
            console.error('Error processing frame:', error);
        }
    }
});

// Email api/////////////////////////////////////////////////////////////////////////////

document.getElementById('authenticateButton').addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value;
    const response = await fetch(`http://86.38.205.133:8087/api/driving-states/startDriving/${email}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        toggleCameraButton.style.visibility = 'visible';
        uploadButton.style.visibility = 'visible';
    } else {
        alert('Authentication failed. Email not registered.');
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////

