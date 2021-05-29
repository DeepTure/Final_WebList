//variables de arranque
getSubjects();
verifyCodeSent();

function getSubjects(){
    const id = $('#idStudent').val();
    $.ajax({
        url:'/home/student/getGroups',
        type:'post',
        data:{id},
        success:function(response){
            console.log(response);
            showGroups(response);
        },
        error:function(response){
            console-log(response);
        }
    });
}

function showGroups(grupos){
    let code = '';
    grupos.forEach((grupo)=>{
        code += ' '+grupo.id_grupo;
    });
    $('#showGroups').html(code);
}

//cuando presione en registrar asistencia
$('#registerAttendance').click(function(){
    const code = $('#codeAttendance').val();
    const boleta = $('#idStudent').val();
    if(code && code.length==7){
        $.ajax({
            url:'/home/student/verifyCode',
            type:'post',
            data:{boleta, code},
            success:function(response){
                console.log(response)
                if(response.success){
                    console.log(response.tokenData);
                    sessionStorage.setItem('room',response.sala);
                    joinRoomSocket(response.sala);
                    //ahora mandamos a llamar una funcion del student socket
                    sendMyAssistences(response.tokenData, response.sala, response.userData);
                    sendAssistenceWaiting(boleta, response.creationTime);
                    $('#registerAttendance').hide();
                    toast('Peticion enviada', 'No cierre esta ventana');
                }else{
                    console.log(response);
                    if(response.many){
                        alert('Usted tiene muchos tokens activos');
                    }else{
                        alert('El codigo es incorrecto o ya caducó');
                    }
                }
            },
            error:function(response){
                console.log(response);
                alert('Ha ocurrido un error inesperado');
            }
        });
    }else{
        alert('codigo incorrecto');
    }
});

function sendAssistenceWaiting(boleta, creacion){
    $.ajax({
        url:'home/student/sendWaiting',
        type:'post',
        data:{boleta, creacion},
        success:function(response){
            console.log(response);
              return true;
        },
        error:function(response){
            console.log(response);
        }
    })
}

function verifyCodeSent(){
    const boleta = $('#idStudent').val();
    $.ajax({
        url:'/home/student/verifyCodeSent',
        type:'post',
        data:{boleta},
        success:function(response){
            console.log(response);
            if(response.waiting){
                sessionStorage.setItem('room',response.room);
                joinRoomSocket(response.room);
                $('#registerAttendance').hide();
                toast('Peticion pendiente', 'Debe esperar a su profesor');
            }
        },
        error:function(response){
            console.log(response);
        }
    });
}