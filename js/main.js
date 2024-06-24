const bars_btn=document.querySelector('.toggle-btn');
const bars_icon=document.querySelector('.toggle-btn i');
const dropMenue=document.querySelector('.dropdown');
// if(isRegOrLog){
//     document.getElementById("acc").innerHTML = getSessionItemwithExpiration('name');
// }
// else{
//     document.getElementById("acc").innerHTML = "Account";
// }
bars_btn.onclick=function(){
    dropMenue.classList.toggle('open');
    const isOpen=dropMenue.classList.contains('open')

    bars_icon.classList= isOpen ?'fas fa-times':'fas fa-bars';
}
/* animation sections */


document.addEventListener('DOMContentLoaded', () => {
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
