//variables de arranque
getSubjects();

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
                    //ahora mandamos a llamar una funcion del student socket
                    //IMPORTANTE, hasta el momento de este mensaje aun falta la sala y comprobar la duración
                    sendMyAssistences(response.tokenData);
                }else{
                    console.log(response);
                    alert('El codigo es incorrecto');
                }
            },
            error:function(response){
                console.log(response);
                alert('Ah ocurrido un error inesperado');
            }
        });
    }else{
        alert('codigo incorrecto');
    }
});