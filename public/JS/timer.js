
function fecha(time){

    if(time){
        var actual = new Date().getTime();
        gap = (time.getTime() + (60000 * 50)) - actual;

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
}

setInterval(function(){
                fecha(a);
            },1000)

var a = new Date();
let b = a.getMinutes();
fecha(a);