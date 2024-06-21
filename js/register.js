function goBack() {
    window.history.back();
}

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    var fullName = document.getElementById('fullName').value;
    var age = document.getElementById('age').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // Construct JSON object for the POST request
    var driverRegistrationRequest = {
        fullName: fullName,
        email: email,
        age: parseInt(age), // Convert age to integer
        password: password
    };

    // Make an HTTP POST request to the backend API
    await fetch('http://86.38.205.133:8087/api/drivers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverRegistrationRequest),
    })
    .then(response => {
        // Check if the response is JSON
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(data => {
        // Handle successful registration response
        console.log('Success:', data);

        // Optionally, you can redirect to another page or show a success message
        alert('Registration successful!');
        // window.location.href = 'success.html'; // Redirect to success page
    })
    .catch((error) => {
        // Handle errors
        alert(error.message);
        console.error('Error:', error.message);
    });
});
