function setSessionItemwithExpiration(key, value, expirationInMinuts){
    const now = new Date();
    const expirationTime = now.getTime() + expirationInMinuts*60000;
    const item = {
        value: value,
        expiration: expirationTime
    };
    localStorage.setItem(key, JSON.stringify(item));
}

function getSessionItemwithExpiration(key){
    const itemStr = localStorage.getItem(key);
    if(!itemStr){
        return null;
    }
    const item = JSON.parse(itemStr);
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

// Call cleanupExpiredSessionItems at the appropriate time, e.g., on page load
document.addEventListener('DOMContentLoaded', cleanupExpiredSessionItems);
