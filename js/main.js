const bars_btn=document.querySelector('.toggle-btn');
const bars_icon=document.querySelector('.toggle-btn i');
const dropMenue=document.querySelector('.dropdown');
const signUpButton=document.querySelector('.signup');
const loginButton=document.querySelector('.login');

bars_btn.onclick=function(){
    dropMenue.classList.toggle('open');
    const isOpen=dropMenue.classList.contains('open')

    bars_icon.classList= isOpen ?'fas fa-times':'fas fa-bars';
}
/* animation sections */


document.addEventListener('DOMContentLoaded', () => {
    renameAccount();
    const sections = document.querySelectorAll('.animated-section');

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, { threshold: 0.2 }); // Trigger when 10% of the section is in view

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});

function renameAccount (){
    const name = checkName();
    
    if(name != null){
        document.getElementById("acc").innerText = 'Welcome '+ name;
        document.getElementById("acc").style.textTransform= 'capitalize';
        document.getElementById("acc").style.fontSize= '1.2rem';
        signUpButton.style.display='none';
        loginButton.textContent='LOG OUT';
        return;
    }
    // document.getElementById("acc").innerText = 'Account';
}

loginButton.addEventListener('click',()=>{
    if (loginButton.textContent === 'LOG IN'){
        loginButton.href='login.html';
    }else{
        localStorage.clear();
        loginButton.href='index.html';
    }
})
