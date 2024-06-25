// Elements
const openCameraButton = document.getElementById('openCamera');
const startDrivingButton = document.getElementById('startDriving');
const endDrivingButton = document.getElementById('endDriving');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const fileInput = document.getElementById('fileInput');
const uploadButton=document.getElementById('uploadButton')
const imagePreview = document.getElementById('imagePreview');
const alertButton = document.getElementById('alertButton');
const resetButton = document.getElementById('resetButton');
const context = canvas.getContext('2d');

let captureInterval;
let isDriving = false;
let isDrowsy = false;
let alertStartTime;
let isCameraOn= false;

//Functions
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


function startDriving() {
     const email = checkEmail();
     const name = checkName();
     console.log("email : "+ email+" name: "+name)
     if( email == null || name == null){
       return;
     }
    // Start driving API call
    console.log("Email : "+email)
    fetch(`http://86.38.205.133:8087/api/driving-states/startDriving/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Start driving response:', data);
        setSessionItemwithExpiration('drivingStateId',data.drivingStateId,12 * 60)
        const drivingStateId = data.drivingStateId;
        console.log('Extracted startDrivingId:', drivingStateId);
    })
    .catch(error => console.error('Error starting driving:', error));

        isDriving = true;
        startDrivingButton.disabled = true;
        endDrivingButton.disabled = false;
        captureInterval = setInterval(captureFrame, 40); // Capture 25 frame every second
    
}



async function endDriving() {
    clearInterval(captureInterval);
    isDriving = false;
    startDrivingButton.disabled = false;
    endDrivingButton.disabled = true;
    video.pause();
    video.srcObject.getTracks().forEach(track => track.stop());

    try {
        // Assuming `driverStateId` was set when starting the driving session
        const drivingStateId=getSessionItemwithExpiration('drivingStateId')
        console.log("drivingStateId : "+drivingStateId);
        const response = await fetch(`http://86.38.205.133:8087/api/driving-states/endDriving/${drivingStateId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('End driving response:', data);

        // Handle the response as needed
        // For example, display a message to the user
        alert('Driving session ended successfully.');
    } catch (error) {
        console.error('Error ending driving:', error);
        alert('Failed to end the driving session. Please try again.');
    }
    localStorage.removeItem('drivingStateId')
}


function playAlertSound() {
    const alertSound = new Audio('../voice/alert2.mp3'); 
    alertSound.play();
}

async function captureFrame() {
    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    playAlertSound()
    // // Convert the canvas content to a Blob
    // return new Promise((resolve, reject) => {
    //     canvas.toBlob(async (blob) => {
    //         try {
    //             // Call the AI model API with the frame
    //             const response = await fetch('http://127.0.0.1:5000/process', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/octet-stream' },
    //                 body: blob
    //             });
                
    //             // Parse the JSON response
    //             const data = await response.json();
    //             resolve(data); // Resolve the promise with the API response data
    //         } catch (error) {
    //             reject(error); // Reject the promise in case of an error
    //         }
    //     }, 'image/jpeg');
    // });
}


/************************************************************************************************************* */
// function captureFrame() {
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(blob => {
//         // Call AI model API with the frame
//         fetch('http://127.0.0.1:5000/process', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/octet-stream' },
//             body: blob
//         }).then(response => response.json())
//           .then(data => {
//               if (data.drowsy) {
//                   handleDrowsinessDetected();
//               } else {
//                   handleAlertEnd();
//               }
//           })
//           .catch(error => console.error('Error detecting drowsiness:', error));
//     }, 'image/jpeg');
// }

function handleDrowsinessDetected() {
    if (!isDrowsy) {
        isDrowsy = true;
        alertStartTime = new Date();
        playAlertSound()
        // alertDiv.style.display = 'block';
    }
}

function handleAlertEnd() {
    if (isDrowsy) {
        isDrowsy = false;
        alertDiv.style.display = 'none';
        const alertEndTime = new Date();
        const driverId = localStorage.getItem('driverId');

        // Store alert details API call
        fetch('https://your-backend-api/store-alert-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverId: driverId,
                alertStartTime: alertStartTime.toISOString(),
                alertEndTime: alertEndTime.toISOString()
            })
        }).then(response => response.json())
          .then(data => console.log('Store alert details response:', data))
          .catch(error => console.error('Error storing alert details:', error));
    }
}

// Event Listeners

openCameraButton.addEventListener('click', () => {
    if (isCameraOn) {
        closeCamera();
        openCameraButton.textContent = 'Open Camera';
        endDrivingButton.disabled=true;
        startDrivingButton.disabled=true;
    } else {
        const userConfirmed = confirm('Do you want to open your camera?');
        if (userConfirmed) {
            openCamera();
            openCameraButton.textContent = 'Close Camera';
            startDrivingButton.disabled=false;
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



resetButton.addEventListener('click',()=>{
    location.reload();
})