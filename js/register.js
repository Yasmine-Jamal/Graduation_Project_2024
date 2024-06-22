function goBack() {
    window.history.back();
}
document.addEventListener('DOMContentLoaded', function () {
    // Add blur event listeners for input fields
    var fullNameInput = document.getElementById('fullName');
    var ageInput = document.getElementById('age');
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');

    fullNameInput.addEventListener('blur', validateFullName);
    ageInput.addEventListener('blur', validateAge);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);

    // Function to validate Full Name
    function validateFullName() {
        var fullName = fullNameInput.value.trim();
        var fullNameError = document.getElementById('fullNameError');
        fullNameError.textContent = '';

        if (fullName === '') {
            fullNameError.textContent = 'Please enter your full name';
            return false;
        }
        else if (fullName.length < 3) {
            fullNameError.textContent = 'minimum length 3';
            return false;
        }
        return true;
    }

    // Function to validate Age
    function validateAge() {
        var age = ageInput.value.trim();
        var ageError = document.getElementById('ageError');
        ageError.textContent = '';

        if (age === '') {
            ageError.textContent = 'Please enter your age';
            return false;
        } else if (isNaN(age) || parseInt(age) <= 0) {
            ageError.textContent = 'Please enter a valid age';
            return false;
        }
        else if (parseInt(age) < 18) {
            ageError.textContent = 'minimum age 18';
            return false;
        }
        return true;
    }

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
    document.getElementById('registrationForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Clear previous error messages
        clearErrors();

        // Validate form fields
        var isFullNameValid = validateFullName();
        var isAgeValid = validateAge();
        var isEmailValid = validateEmail();
        var isPasswordValid = validatePassword();

        // Check if all fields are valid before proceeding
        if (isFullNameValid && isAgeValid && isEmailValid && isPasswordValid) {
            // Get form values
            var fullName = fullNameInput.value.trim();
            var age = ageInput.value.trim();
            var email = emailInput.value.trim();
            var password = passwordInput.value;

            // Construct JSON object for the POST request
            var data = {
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
                    // Save email locally
                    // saveEmailLocally(data.email);

                    // Optionally, you can redirect to another page or show a success message
                    alert('Registration successful!');
                    // window.location.href = 'success.html'; // Redirect to success page

                    // Clear form after successful registration (if needed)
                    document.getElementById('registrationForm').reset();
                    clearErrors();
                })
                .catch((error) => {
                    // Handle errors
                    console.error('Error:', error.message);
                    // alert(error.message);
                    document.getElementById('registrationError').textContent = error.message;
                });
        }
    });

    // Function to clear all error messages
    function clearErrors() {
        document.getElementById('fullNameError').textContent = '';
        document.getElementById('ageError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
    }
});
// Function to save email locally
// function saveEmailLocally(email) {
//     const filename = 'registered_email.txt';
//     const emailContent = `Registered email: ${email}`;

//     // Create a Blob object with the email content
//     const blob = new Blob([emailContent], { type: 'text/plain' });

//     // Create a link element
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = filename;

//     // Append the link to the body
//     document.body.appendChild(a);

//     // Programmatically click the link to trigger the download
//     a.click();

//     // Clean up resources
//     document.body.removeChild(a);
//     URL.revokeObjectURL(a.href);
// }
// 
// 
// function saveEmailLocally(email) {
//     const filename = 'registered_email.txt';
//     const emailContent = `Registered email: ${email}\n`;

//     // Read the existing content of the file
//     readFileContents(filename)
//         .then(existingContent => {
//             // Combine existing content with new email
//             const updatedContent = existingContent + emailContent;

//             // Write the updated content back to the file
//             writeFileContents(filename, updatedContent);
//         })
//         .catch(error => {
//             console.error('Error reading file:', error);
//         });
// }

// // Function to read file contents
// function readFileContents(filename) {
//     return new Promise((resolve, reject) => {
//         const fileReader = new FileReader();
//         fileReader.onload = function(event) {
//             const content = event.target.result;
//             resolve(content);
//         };
//         fileReader.onerror = function(error) {
//             reject(error);
//         };

//         // Read the file as text
//         fileReader.readAsText(new Blob([filename], { type: 'text/plain' }));
//     });
// }

// // Function to write file contents
// function writeFileContents(filename, content) {
//     const blob = new Blob([content], { type: 'text/plain' });

//     // Create a link element
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = filename;

//     // Programmatically click the link to trigger the download
//     a.click();

//     // Clean up resources
//     URL.revokeObjectURL(a.href);
// }
// 
// function saveEmailLocally(email) {
//     var emailFile = new File("E:\graduation project\savedEmails.txt");
//     // emailFile.writeln(email);
//     // emailFile.close();
//     var output = writeFile(emailFile, null, email);
//     console.log("The number of bytes written to file was: " + output);
// }

