function popUp(titulo, relleno, icono) {
  Swal.fire({
    title: titulo,
    text: relleno,
    icon: icono,
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
      });
  });
});
