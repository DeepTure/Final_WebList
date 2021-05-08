//acciones de inicio
$('.second-action').hide();


$('#sendEmail').click(function(){
    const email = document.getElementById('email').value;
    //validamos si el correo es correcto

    //ahora debemos revisar que exista el correo y levantar el token
    alert(email);
});