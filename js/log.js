document.addEventListener('DOMContentLoaded', function () {
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');

    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);


    // Function to validate Email
    function validateEmail() {
        var email = emailInput.value.trim();
        var emailError = document.getElementById('emailError');
        emailError.textContent = '';

        if (email === '') {
            emailError.textContent = 'Please enter your email';
            return false;
        }
        else if (email.length < 6 || email.length > 254) {
            emailError.textContent = 'minimum length of email 6';
            return false;
        } else if (!isValidEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        return true;
    }

    // Function to validate Password
    function validatePassword() {
        var password = passwordInput.value;
        var passwordError = document.getElementById('passwordError');
        passwordError.textContent = '';

        if (password === '') {
            passwordError.textContent = 'Please enter a password';
            return false;
        }
        else if (password.length < 6 || password.length > 254) {
            passwordError.textContent = 'minimum length of password 6 ';
            return false;
        }
        return true;
    }

    // Function to validate email format
    function isValidEmail(email) {
        // Basic email validation regex (you can use a more sophisticated regex if needed)
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Event listener for form submission
    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Clear previous error messages
        clearErrors();

        // Validate form fields
        var isEmailValid = validateEmail();
        var isPasswordValid = validatePassword();

        // Check if all fields are valid before proceeding
        if (isEmailValid && isPasswordValid) {
            // Get form values
            var email = emailInput.value.trim();
            var password = passwordInput.value;

            // Construct JSON object for the POST request
            var data = {
                email: email,
                password: password
            };

            // Make an HTTP POST request to the backend API
            await fetch('http://86.38.205.133:8087/api/drivers/getByEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
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
                    // Clear session storage and save email with expiration
                    localStorage.clear();
                    setSessionItemwithExpiration('email', data.email, 0.5); // 12 Hour expiration
                    // Optionally, you can redirect to another page or show a success message
                    alert('login successful!');
                    // window.location.href = 'success.html'; // Redirect to success page

                    // Clear form after successful registration (if needed)
                    document.getElementById('loginForm').reset();
                    clearErrors();
                    window.location = './/index.html';
                })
                .catch((error) => {
                    // Handle errors
                    console.error('Error:', error.message);
                    // alert(error.message);
                    document.getElementById('loginError').textContent = error.message;
                });
        }
    });

    // Function to clear all error messages
    function clearErrors() {
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
    }
});
