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

setInterval(function(){
                fecha();
            },1000)

updateTime('0');