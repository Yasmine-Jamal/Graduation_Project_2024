document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate login functionality (replace with actual validation)
    if (username === 'admin' && password === 'password') {
        // Successful login
        alert('Login successful!');
        // Redirect to another page or perform other actions
    } else {
        // Failed login
        const errorMessage = document.getElementById('error-message');
        errorMessage.innerText = 'Invalid username or password';
    }
});
