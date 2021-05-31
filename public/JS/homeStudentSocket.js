const socket = io();

socket.on('assistence:student:tokenTime',(tokenTime)=>{
    console.log('Recivido: '+tokenTime);
    sessionStorage.setItem('tokenTime',tokenTime);
});

//Recibe la boleta y sala
socket.on('assistence:student:reject',(data)=>{
    console.log('peticion de rechazo');
    const boleta = $('#idStudent').val();
    if(data.boleta == boleta){
        $('#registerAttendance').show();
        popUp('Asistencia rechazada','Su profesor ha rechazado su asistencia','error');
    }
});

socket.on('assistence:student:accept',(data)=>{
    const boleta = $('#idStudent').val();
    if(data.boleta==boleta){
        $('#registerAttendance').show();
        popUp('Asistencia aceptada','Su profesor ha aceptado su asistencia','success');
        $('#inputShowCode').val('');
    }
});

socket.on('assistence:student:rejectAll',(data)=>{
    const boletaStudent = $('#idStudent').val();
    const boletas = data.students;
    boletas.forEach((boleta)=>{
        if(boletaStudent==boleta.boleta){
            $('#registerAttendance').show();
            popUp('Asistencia rechazada','Su profesor ha rechazado su asistencia','error');
        }
    });
});

socket.on('assistence:student:acceptAll',(data)=>{
    const boletaStudent = $('#idStudent').val();
    const boletas = data.students;
    boletas.forEach((boleta)=>{
        if(boletaStudent==boleta.boleta){
            $('#registerAttendance').show();
            popUp('Asistencia aceptada','Su profesor ha aceptado su asistencia','success');
            $('#inputShowCode').val('');
        }
    });
})

socket.on('assistence:student:endCode', ()=>{
    $('#registerAttendance').show();
    popUp('Asistencia rechazada','Su profesor ha no aceptó su asistencia','error');
    deleteWaitingThisStudent($('#idStudent').val());
});

//nos unimos a la sala
function joinRoomSocket(room){
    socket.emit('room:join',{room});
}

/**
 * 
 * @param {object} tokenData es la data del token
 * @param {String} room es el id de la sala a la que se debe conectar
 * @param {object} userdata contiene el nombre y apellido del alumno
 */
function sendMyAssistences(tokenData, room, userdata){
    console.log('Enviando asistencia');
    const boleta = $('#idStudent').val();
    socket.emit('assistences:send',{tokenData, boleta, room, name:userdata.nombre, last:userdata.app});
}