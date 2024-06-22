function setSessionItemwithExpiration(key, value, expirationInMinuts){
    const now = new Date();
    const expirationTime = now.getTime() + expirationInMinuts*60000;
    const item = {
        value: value,
        expiration: expirationTime
    };
    sessionStorage.setItem(key, JSON.stringify(item));
}

function getSessionItemwithExpiration(key){
    const itemStr = sessionStorage.getItem(key);
    if(!itemStr){
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if(now.getTime()>item.expiration){
        sessionStorage.removeItem(key);
        return null;
    }
    return item.value;
}

