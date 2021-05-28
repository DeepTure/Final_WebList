const socket = io();

socket.on('assistence:student:tokenTime',(tokenTime)=>{
    console.log('Recivido: '+tokenTime);
    sessionStorage.setItem('tokenTime',tokenTime);
});

/**
 * 
 * @param {object} tokenData es la data del token
 * @param {String} room es el id de la sala a la que se debe conectar
 * @param {object} userdata contiene el nombre y apellido del alumno
 */
function sendMyAssistences(tokenData, room, userdata){
    const boleta = $('#idStudent').val();
    socket.emit('assistences:send',{tokenData, boleta, room, name:userdata.nombre, last:userdata.app});
}

/**
 * Hace una peticion al socket del profesor por la hora de creacion del token
 * @param {String} room es el id de la sala a la que se debe contectar   
 */
function askTime(room){
    socket.emit('assistence:time',room);
}