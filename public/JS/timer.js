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
        verifyTokenSaved();
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