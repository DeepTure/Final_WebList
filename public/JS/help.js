$('#contactSupportActive').hide();

$('#toContactButton').click(()=>{
    $('#contactSupportActive').show();
    $('#contactSupport').hide();
});

$('#sendEmailSupport').click(()=>{
    const email = $('#emailUser').val();
    const message = $('#message').val();
    const zone = $('#zone').val();
    const title = $('#title').val();
    const vemail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if(!email || !message || !zone || !title){
        alert('No puede enviar campos vacios');
    }else{
        if(vemail.test(email)){
            //ahora enviamos el mensaje
            $.ajax({
                url:'/help/sendEmail',
                type:'post',
                data:{email, message, zone, title},
                success:function(response){
                    console.log(response);
                    if(response == "ok"){
                        popUp('Se ha enviado su mensaje','espere su respuesta', 'success');
                        clerInputsEmailContact(true);
                    }else{
                        popUp('Ha ocurrido un error inesperado','Ha ocurrido un error', 'error');
                    }
                },
                error:function(response){
                    console.log(response);
                    popUp('Ha ocurrido un error inesperado','Ha ocurrido un error', 'error');
                }
            });
        }else{
            alert('el correo es invalido')
        }
    }
});

function clerInputsEmailContact(changeView){
    $('#emailUser').val('');
    $('#message').val('');
    $('#zone').val('');
    $('#title').val('')
    if(changeView){
        $('#contactSupportActive').hide();
        $('#contactSupport').show();
    }
}