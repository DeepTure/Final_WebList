//acciones de inicio
$('.second-action').hide();


$('#sendEmail').click(function(){
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const rol = document.getElementById('rol').value;
    //validamos si el correo es correcto

    //ahora debemos revisar que exista el correo y levantar el token
    if(true){
        $.ajax({
            url:'/recovery/comprobateEmail',
            type:'post',
            data:{email, username, rol},
            success:function(response){
                console.log(response);
                if(response){
                    sendCode(email, username);
                    alert('se ha enviado un codigo a su correo')
                }else{
                    alert('no se encontró su correo')
                }
            },
            error:function(response){
                console.log(response);
                alert(response);
            }
        });
    }else{

    }
});

function sendCode(email, username){
    $('.second-action').show();
    $('.first-action').hide();
    $.ajax({
        url:'/recovery/comprobateEmail/sendEmail',
        type:'post',
        data:{email, username},
        success:function(response){
            console.log(response);
        },
        error:function(response){
            alert('Hubo un error');
            console.log(response);
        }
    });
}