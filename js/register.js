function goBack() {
    window.history.back();
}

document.getElementById('registrationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://86.38.205.133:8087/api/drivers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullName: fullName,
            age: parseInt(age),
            email: email,
            password: password
        })
    });

    if (response.ok) {
        const responseData = await response.json();
        showMessage("Registration successful!");
        // alert('Registration successful');
        console.log(responseData);
        // Storing values in variables
        const name = responseData.fullName;
        const ageValue = responseData.age;
        const emailValue = responseData.email;

        // Display the key/value pairs on the page
        const resultDiv = document.createElement('div');
        resultDiv.id = 'result';
        resultDiv.innerHTML = `
            <p>Full Name: ${name}</p>
            <p>Email: ${emailValue}</p>
            <p>Age: ${ageValue}</p>
        `;
        document.body.appendChild(resultDiv);

        // Log the variables to the console
        console.log(`Full Name: ${name}`);
        console.log(`Email: ${emailValue}`);
        console.log(`Age: ${ageValue}`);
    } else {
        showMessage("Registration failed!");
        // alert('Registration failed');
        console.error('Error:', response.statusText);
    }
});