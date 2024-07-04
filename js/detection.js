// Elements
const openCameraButton = document.getElementById('openCamera');
const startDrivingButton = document.getElementById('startDriving');
const endDrivingButton = document.getElementById('endDriving');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton')
const imagePreview = document.getElementById('imagePreview');
const alertButton = document.getElementById('alertButton');
const resetButton = document.getElementById('resetButton');
const context = canvas.getContext('2d');

var formData;
var captureInterval;
let isDriving = false;
let isDrowsy = false;
var alertStartTime;
let isCameraOn = false;
let aiResult;
let alertSoundInterval;
let stopCameraThread = false;
let alertSound = new Audio('../voice/alert2.mp3');

//Functions

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            startDrivingButton.disabled = false;
        })
        .catch(err => {
            console.error("Error accessing the camera: ", err);
        });
}

function closeCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    clearInterval(captureInterval);
}

async function startDriving() {
    const email = checkEmail();
    const name = checkName();
    console.log("email : " + email + " name: " + name)
    if (email == null || name == null) {
        return;
    }
    // Start driving API call
    console.log("Email : " + email)
    fetch(`http://86.38.205.133:8087/api/driving-states/startDriving/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Start driving response:', data);
            setSessionItemwithExpiration('drivingStateId', data.drivingStateId, 12 * 60)
            const drivingStateId = data.drivingStateId;
            console.log('Extracted startDrivingId:', drivingStateId);
        })
        .catch(error => console.error('Error starting driving:', error));

    isDriving = true;
    startDrivingButton.disabled = true;
    endDrivingButton.disabled = false;
    stopCameraThread = false;
    captureInterval = setInterval(captureFrame, 200); // Capture 10 frame every second
}


async function checkDrowsiness(aiResult) {
    if (stopCameraThread) return;
    if (aiResult === "drowsy" && !isDrowsy) {
        if (alertStartTime == null) {
            alertStartTime = formatDate(new Date());
        }
        isDrowsy = true;
        while (isDrowsy) {
            playAlertSound();
            await sleep(1000)
        }

    } else if (aiResult === "awake" && isDrowsy) {
        saveDrowsyState();
        alertStartTime = null;
        stopAlertSound();
        isDrowsy = false;
    }
}


function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

async function saveDrowsyState() {
    const endTime = formatDate(new Date());
    const drivingStateid = getSessionItemwithExpiration('drivingStateId');

    const requestData = {
        startTime: alertStartTime,
        endTime: endTime,
        drivingStateId: drivingStateid
    };
    console.log("alert start time : ",alertStartTime);
    console.log("alert end time : ",endTime);


    try {
        const response = await fetch('http://86.38.205.133:8087/api/drowsy-state-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        console.log('Drowsy state saved:', data);
    } catch (error) {
        console.error('Error saving drowsy state:', error);
    }
}

async function endDriving() {
    // captureThread.stop();
    stopCameraThread = true;
    clearInterval(captureInterval);
    isDriving = false;
    startDrivingButton.disabled = true;
    endDrivingButton.disabled = true;
    video.pause();
    video.srcObject.getTracks().forEach(track => track.stop());
    stopAlertSound();
    
    try {
        // Assuming `driverStateId` was set when starting the driving session
        const drivingStateId = getSessionItemwithExpiration('drivingStateId')
        console.log("drivingStateId : " + drivingStateId);
        const response = await fetch(`http://86.38.205.133:8087/api/driving-states/endDriving/${drivingStateId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('End driving response:', data);
        // clearInterval(captureInterval);

        alert('Driving session ended successfully.');
        // clearInterval(captureInterval);
    } catch (error) {
        console.error('Error ending driving:', error);
        alert('Failed to end the driving session. Please try again.');
    }
    localStorage.removeItem('drivingStateId')
}

async function playAlertSound() {
    alertSound.currentTime = 0;
    alertSound.play();

}

function stopAlertSound() {
    alertSound.pause();
    alertSound.currentTime = 0;
}


async function captureFrame() {
    // console.log("stopCameraThread : " + stopCameraThread);
    let date = new Date()
    console.log(formatDate(date));
    // console.log(" formData : ", formData);
    if (stopCameraThread) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
        try {
            formData = new FormData();
            formData.append('frame', blob, `frame-${Date.now()}.jpeg`);

            const response = await fetch('http://127.0.0.1:5000/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log(data.output)
            checkDrowsiness(data.output)

        } catch (error) {
            console.error('Error sending frame to server:', error);
        }
    }, 'image/jpeg');
}

// Event Listeners

openCameraButton.addEventListener('click', () => {
    if (isCameraOn) {
        closeCamera();
        openCameraButton.textContent = 'Open Camera';
        endDrivingButton.disabled = true;
        startDrivingButton.disabled = true;
    } else {
        const userConfirmed = confirm('Do you want to open your camera?');
        if (userConfirmed) {
            openCamera();
            openCameraButton.textContent = 'Close Camera';
            startDrivingButton.disabled = false;
        } else {
            alert('Camera Access Denied Please enable camera access ');
        }
    }
    isCameraOn = !isCameraOn;
});
startDrivingButton.addEventListener('click', startDriving);
endDrivingButton.addEventListener('click', endDriving);

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
            video.style.display = 'none';
            uploadButton.textContent = 'Send Image for Processing';
        };

        reader.readAsDataURL(file);
    }
});

function loadImage(event) {
    imagePreview.src = URL.createObjectURL(event.target.files[0]);
}

async function processImage() {
    // Hide the image preview
    imagePreview.style.display = 'block';
    // Convert imagePreview to a canvas and then to a blob
    const image = new Image();
    image.src = imagePreview.src;

    image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                console.error('Error creating Blob from canvas');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('frame', blob, `frame-${Date.now()}.jpeg`);

                const response = await fetch('http://127.0.0.1:5000/', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Full response data:", data);

                if (data && typeof data.output !== 'undefined') {
                    const drowsy = data.output;
                    console.log("result of drowsy output: ", drowsy);

                    console.log("result of isDrowsy output: ", isDrowsy);
                    
                    alertButton.style.color = '#fff';
                    

                    if (drowsy === 'drowsy') {
                        playAlertSound();
                        alertButton.textContent='Drowsy --> Danger';
                        alertButton.style.background='red';
                        await sleep(1000);
                        stopAlertSound();
                    } else if(drowsy === 'awake'){
                        alertButton.textContent='Awake --> Safe';
                        alertButton.style.background='green';
                        
                    }
                    
                } else {
                    console.error('API response does not contain expected "output" key.');
                    alertButton.textContent='No face';
                    alertButton.style.background='#ee7628';
                }

                uploadButton.textContent = 'Upload Image';
            } catch (error) {
                console.error('Error sending frame to server:', error);
            }
        }, 'image/jpeg');
    };

}

resetButton.addEventListener('click', () => {
    location.reload();
})