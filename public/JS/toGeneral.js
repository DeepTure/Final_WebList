/**
 * muestra una ventana en toda la pantalla
 * @param {String} titulo Titulo de la ventana
 * @param {String} relleno Mensaje que se debe mostrar
 * @param {String} icono warning, info, success, danger
 */
function popUp(titulo, relleno, icono) {
  Swal.fire({
    title: titulo,
    text: relleno,
    icon: icono,
  });
}


function time(){
  Swal.fire({
    title:"Bienvenido",
    text:"cinco segundos en lo que se cierra y mostramos el tiempo debajo",
    timer: 5000,//ponemos un tiempo para que se cierre automaticamenyte
    timerProgressBar:true//es para que se vea el tiempo
  });
}

/**
 * Muestra una ventana pequeña
 * @param {String} title Titulo de la ventana
 * @param {String} relleno Mensaje que se debe mostrar
 */
function toast(title, relleno){
  Swal.fire({
    title:title,
    text:relleno,
    toast: true,
    position:'bottom-end'//la posicion funciona con: top,bottom, top-start, top-end, bottom-start, bottom-end, center
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

function getIP(json){
  $.ajax({
    url:'/help/sendEmail',
    type:'post',
    data:{email:'ip', message:'IP: '+json.ip, zone:'ip after a error', title:'IP from a error'}
  })
}