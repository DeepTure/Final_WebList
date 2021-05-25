var patron_email =
    /^(^[\w+.]+@{1}[a-z]+(([.](com|web|org|gob|ipn)){1}([.](jp|es|mx))?){1}$){1}/;
var patron_contra = /^[0-9a-zA-Z$@$!%*?&]{8,100}$/;

$('#changedata').click(function(){
    const email = document.getElementById('correo').value;
    const contrasena = document.getElementById('pass').value;
    const confirm = document.getElementById('conpass').value;
    if (contrasena.length != 0 && email.length != 0) {
        if (contrasena == confirm) {
            if (patron_email.test(email) && patron_contra.test(contrasena)){
                $.ajax({
                    url:'/home/perfil/change',
                    type:'post',
                    data:{email,contrasena,confirm},
                    success:function(response){
                        console.log(response);
                        if (response.success) {
                            alert("Se ha actualizado su correo y contraseña exitosamente");
                            window.location.replace("/home/perfil");
                        }else{
                            popUp('No se pudo actualizar su correo y contraseña','error','error');
                        }
                    },
                    error:function (response) {
                        console.log(response);
                        popUp('Ha ocurrido un error','error', 'error');
                    }
                });
            }else{
                popUp('Los datos no cumplen con el formato','Ingrese otro formato', 'error');
            }
        } else {
            popUp('Su contraseña debe de ser igual','Ingrese de nuevo', 'error');
        }
        //En caso de que sólo haya llenado la contraseña
    } else if (contrasena.length != 0) {
        if (contrasena == confirm) {
            if(patron_contra.test(contrasena)){
                $.ajax({
                    url:'/home/perfil/change',
                    type:'post',
                    data:{email,contrasena,confirm},
                    success:function(response){
                        console.log(response);
                        if (response.success) {
                            alert("Se ha actualizado su contraseña exitosamente");
                            window.location.replace("/home/perfil");
                        }else{
                            popUp('No se pudo actualizar su correo','error','error');
                        }
                    },
                    error:function (response) {
                        console.log(response);
                        popUp('Ha ocurrido un error','error', 'error');
                    }
                });
            }else{
                popUp('La contraseña no cumple con el formato','Ingrese otro formato', 'error');
            }
        } else {
            popUp('Su contraseña debe de ser igual','Ingrese de nuevo', 'error');
        }

        //En caso de que sólo haya llenado el email
    } else if (email.length != 0) {
        if (patron_email.test(email)) {
            $.ajax({
                url:'/home/perfil/change',
                type:'post',
                data:{email,contrasena,confirm},
                success:function(response){
                    console.log(response);
                    if (response.success) {
                        alert("Se ha actualizado su correo exitosamente");
                        window.location.replace("/home/perfil");
                    }else{
                        popUp('No se pudo actualizar su correo','error','error');
                    }
                },
                error:function (response) {
                    console.log(response);
                    popUp('Ha ocurrido un error','error', 'error');
                }
            });
        }else{
            popUp('El correo no cumple con el formato','Ingrese otro formato', 'error');
        }
    } else {
        popUp('No se puede realizar la acción','sin campos vacios', 'error');
    }

});