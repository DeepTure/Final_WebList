//acciones de inicio
$('.second-action').hide();


$('#sendEmail').click(function(){
    const email = document.getElementById('email').value;
    const username = document.getElementById('user').value;
    const rol = document.getElementById('rol').value;
    //validamos si el correo es correcto
    let vemail = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/i;
    let vusername = /[a-zA-Z0-9]{1,10}/;
    //ahora debemos revisar que exista el correo y levantar el token
    if(vemail.test(email) && vusername.test(username)){
        $.ajax({
            url:'/recovery/comprobateEmail',
            type:'post',
            data:{email, username, rol},
            success:function(response){
                console.log(response);
                if(response.success){
                    sendCode(email, response.idUser, rol);
                    popUp('Se Ha enviado un codigo a su correo','se envió con exito', 'success');
                }else{
                    popUp('Los datos son erroneos','probablemente no se encontró su correo', 'error');
                }
            },
            error:function(response){
                console.log(response);
                popUp('Ha ocurrido un error','probablemente no se encontró su correo', 'error');
            }
        });
    }else{
        popUp('Los datos no cumplen con el formato','Ingrese otro formato', 'error');
    }
});

function sendCode(email, idUser, rol){
    $('.second-action').show();
    $('.first-action').hide();
    document.getElementById('usernamesav').value = idUser
    document.getElementById('rolsav').value = rol
    console.log(idUser,rol,email)
    sessionStorage.setItem('rolsave', rol);
    sessionStorage.setItem('idUser', idUser);
    $.ajax({
        url:'/recovery/comprobateEmail/sendEmail',
        type:'post',
        data:{email, idUser, rol},
        success:function(response){
            console.log(response);
        },
        error:function(response){
            popUp('Ha ocurrido un error','esto es un error inesperado', 'error');
            console.log(response);
        }
    });
}
