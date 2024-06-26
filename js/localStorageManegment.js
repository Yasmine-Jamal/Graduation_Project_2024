
function setSessionItemwithExpiration(key, value, expirationInMinuts){
    const now = new Date();
    const expirationTime = now.getTime() + expirationInMinuts*60000;
    const item = {
        value: value,
        expiration: expirationTime
    };
    // // Clear session storage and save email with expiration
    // localStorage.clear();
    localStorage.setItem(key, JSON.stringify(item));
}

function getSessionItemwithExpiration(key){
    const itemStr = localStorage.getItem(key);
    if(itemStr == null){
        return null;
    }
    console.log(itemStr);
    const item = JSON.parse( itemStr );
    const now = new Date();
    if(now.getTime()>item.expiration){
        localStorage.removeItem(key);
        return null;
    }
    return item.value;
}
function cleanupExpiredSessionItems() {
    const now = new Date().getTime();

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const itemStr = localStorage.getItem(key);

        if (itemStr) {
            const item = JSON.parse(itemStr);
            if (item.expiration && now > item.expiration) {
                localStorage.removeItem(key);
                i--; // Adjust the index after removal
            }
        }
    }
}

// const email = getSessionItemwithExpiration('email');
function checkEmail() {
    const email = getSessionItemwithExpiration('email');
    console.log(email);
    if (email != null) {
        // If email exists and is not expired, refresh the expiration time for another 12 hours
        setSessionItemwithExpiration('email', email, 12*60); // 12 hours in milliseconds
        console.log('Email found and refreshed:', email);
        return email;
    } else {
        // If email does not exist or is expired, redirect to login page
        window.location = '../login.html'; // Replace with your login page URL
    }
}

function checkName() {
    const name = getSessionItemwithExpiration('name');
    
    if (name != null) {
        // If email exists and is not expired, refresh the expiration time for another 12 hours
        setSessionItemwithExpiration('name', name, 12*60); // 12 hours in milliseconds
        console.log('Name found and refreshed:', name);

    } 
    return name;
}


// Call cleanupExpiredSessionItems at the appropriate time, e.g., on page load
document.addEventListener('DOMContentLoaded', cleanupExpiredSessionItems);
