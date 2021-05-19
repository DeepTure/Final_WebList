const socket = io();

function sendMyAssistences(tokenData){
    const boleta = $('#idStudent').val();
    socket.emit('assistences:send',{tokenData, boleta});
}