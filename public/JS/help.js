$('#contactSupportActive').hide();

$('#toContactButton').click(()=>{
    $('#contactSupportActive').show();
    $('#contactSupport').hide();
});

$('#sendEmailSupport').click(()=>{
    const email = $('#emailUser').val();
    const message = $('#message').val();
    const vemail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if(!email || !message){
        alert('No puede enviar campos vacios');
    }else{
        if(vemail.test(email)){
            //ahora enviamos el mensaje
            $.ajax({
                url:'/help/sendEmail',
                type:'post',
                data:{email, message},
                success:function(response){
                    console.log(response);
                    if(response == "ok"){
                        alert('se ha enviado satisfactoriamente');
                        clerInputsEmailContact(true);
                    }else{
                        alert('Ha ocurrido un error inesperado');
                    }
                },
                error:function(response){
                    console.log(response);
                    alert('error inesperado')
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
    if(changeView){
        $('#contactSupportActive').hide();
        $('#contactSupport').show();
    }
}