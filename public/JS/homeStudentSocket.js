const socket = io();

function sendMyAssistences(tokenData, room){
    const boleta = $('#idStudent').val();
    socket.emit('assistences:send',{tokenData, boleta, room});
}