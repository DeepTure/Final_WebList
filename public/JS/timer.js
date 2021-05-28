var temp = new Date().getTime() + (60000 * 50);

function updateTime(newTime) {
    var timeToAdd = parseInt(newTime.charAt(0) + "" + newTime.charAt(1));
    if (timeToAdd > 50){
        timeToAdd = 50;
    }

    temp = new Date().getTime() + (60000 * timeToAdd);
}

function fecha(){

    var actual = new Date().getTime();
    gap = temp - actual;

    var segundo= 1000;
    var minuto = segundo * 60;
    var hora = minuto * 60;
    var dia = hora * 24;

    var d = Math.floor(gap / dia);
    var h = Math.floor((gap % (dia)) / (hora));
    var m = Math.floor((gap % (hora)) / (minuto));
    var s = Math.floor((gap % (minuto)) / segundo);

    if (m >= 0 || s >= 0){
        document.getElementById('minuto').innerText = m;
        document.getElementById('segundo').innerText = s;
    }
}

/*setInterval(function(){
                fecha();
            },1000)*/

updateTime('0');

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