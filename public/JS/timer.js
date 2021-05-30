//En esta parte comienza el timer
var tiempoFaltante = new Date();

/**
 * Hace funcionar el reloj
 * @param {Date} missingTime El tiempo que falta para que termine en minutos y segundos
 * @returns {Boolean} si el reloj ya terminó
 */
function prepareTimer(missingTime){
    if(missingTime){tiempoFaltante = missingTime}
    tiempoFaltante.setSeconds(tiempoFaltante.getSeconds() -1)
    $("#minuto").text(tiempoFaltante.getMinutes())
    $("#segundo").text(tiempoFaltante.getSeconds())
    
    //si el tiempo es cero es porque ya termino
    if((tiempoFaltante.getMinutes() == 0) && (tiempoFaltante.getSeconds() == 0)){
        console.log("Ya chingastes");
        //popUpTimer('acepte todos los usuaris','Debe aceptar todos los usuarios antes de que se elimine el codigo','info',6000);
        Swal.fire({
            title: 'Tiempo terminado',
            text:'Debe elegir si aceptar todas las solicitudes o rechazarlas',
            icon:'warning',
            showCancelButton: true,
            cancelButtonText: 'Rechazar todas',
            confirmButtonColor:'#007bff',
            cancelButtonColor:'#dc3545',
            confirmButtonAriaLabel: 'Aceptar todas',
            timer: 6000,//ponemos un tiempo para que se cierre automaticamenyte
            timerProgressBar:true//es para que se vea el tiempo
          }).then((willBe)=>{
            console.log('willBe: ',willBe);
            if(willBe.isDismissed){
                rejectAll();
            }else if(willBe.isConfirmed){
                acceptAll();
            }
            deleteTokenSaved();
            $('#showCode').hide();
            $('#settingsCode').hide();
            $('#subjects').hide();
            $('#groups').show();
            $('#generateCode').hide();
            $('.groupsSection').show();
          });
          return true;
    }else{
        return false;
    }
}

function startTimer(){
    let secondAfterSecond = setInterval(function(){
        let end = prepareTimer();
        if(end){
            clearInterval(secondAfterSecond);
        }
    },1000);
}