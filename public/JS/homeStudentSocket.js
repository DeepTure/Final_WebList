const socket = io();

$('#registerAttendance').click(function(){
    const code = $('#codeAttendance').val();
    const id = $('#idStudent').val();

    if(true){
        socket.emit('register:attendance', {
            code, id
        });
    }else{
        alert('el dato es incorrecto');
    }
});