window.addEventListener("scroll", function(){

const navbar = document.querySelector(".navbar");

navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);

});

const form = document.getElementById("reservationForm");

if(form){

form.addEventListener("submit", function(e){

e.preventDefault();

alert("Reservación enviada correctamente");

form.reset();

});

}