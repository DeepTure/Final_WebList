const socket = io();

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