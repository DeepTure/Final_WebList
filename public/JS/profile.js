var patron_email =
    /^(^[\w+.]+@{1}[a-z]+(([.](com|web|org|gob|ipn)){1}([.](jp|es|mx))?){1}$){1}/;
var patron_contra = /^[0-9a-zA-Z$@$!%*?&]{8,100}$/;

$("#changedata").click(function () {
    const email = document.getElementById("correo").value;
    const contrasena = document.getElementById("pass").value;
    const confirm = document.getElementById("conpass").value;
    if (contrasena.length != 0 && email.length != 0) {
        if (contrasena == confirm) {
            if (patron_email.test(email) && patron_contra.test(contrasena)) {
                $.ajax({
                    url: "/home/perfil/change",
                    type: "post",
                    data: { email, contrasena, confirm },
                    success: function (response) {
                        console.log(response);
                        if (response.success) {
                            alert(
                                "Se ha actualizado su correo y contraseña exitosamente"
                            );
                            window.location.replace("/home/perfil");
                        } else {
                            popUp(
                                "No se pudo actualizar su correo y contraseña",
                                "error",
                                "error"
                            );
                        }
                    },
                    error: function (response) {
                        console.log(response);
                        popUp("Ha ocurrido un error", "error", "error");
                    },
                });
            } else {
                popUp(
                    "Los datos no cumplen con el formato",
                    "Ingrese otro formato",
                    "error"
                );
            }
        } else {
            popUp(
                "Su contraseña debe de ser igual",
                "Ingrese de nuevo",
                "error"
            );
        }
        //En caso de que sólo haya llenado la contraseña
    } else if (contrasena.length != 0) {
        if (contrasena == confirm) {
            if (patron_contra.test(contrasena)) {
                $.ajax({
                    url: "/home/perfil/change",
                    type: "post",
                    data: { email, contrasena, confirm },
                    success: function (response) {
                        console.log(response);
                        if (response.success) {
                            alert(
                                "Se ha actualizado su contraseña exitosamente"
                            );
                            window.location.replace("/home/perfil");
                        } else {
                            popUp(
                                "No se pudo actualizar su correo",
                                "error",
                                "error"
                            );
                        }
                    },
                    error: function (response) {
                        console.log(response);
                        popUp("Ha ocurrido un error", "error", "error");
                    },
                });
            } else {
                popUp(
                    "La contraseña no cumple con el formato",
                    "Ingrese otro formato",
                    "error"
                );
            }
        } else {
            popUp(
                "Su contraseña debe de ser igual",
                "Ingrese de nuevo",
                "error"
            );
        }

        //En caso de que sólo haya llenado el email
    } else if (email.length != 0) {
        if (patron_email.test(email)) {
            $.ajax({
                url: "/home/perfil/change",
                type: "post",
                data: { email, contrasena, confirm },
                success: function (response) {
                    console.log(response);
                    if (response.success) {
                        alert("Se ha actualizado su correo exitosamente");
                        window.location.replace("/home/perfil");
                    } else {
                        popUp(
                            "No se pudo actualizar su correo",
                            "error",
                            "error"
                        );
                    }
                },
                error: function (response) {
                    console.log(response);
                    popUp("Ha ocurrido un error", "error", "error");
                },
            });
        } else {
            popUp(
                "El correo no cumple con el formato",
                "Ingrese otro formato",
                "error"
            );
        }
    } else {
        popUp("No se puede realizar la acción", "sin campos vacios", "error");
    }
});

$("#digSign").click((ev) => {
    $("#digSign").prop("disabled", true);
    toast("Procesando...", "No cierre esta ventana");
    $.ajax({
        url: "/genSign",
        type: "post",
        success: (res) => {
            let a = document.createElement("a");

            let sign = new Blob([new Uint8Array(res.sign.data)], {
                type: "text/plain",
            });

            let signUrl = window.URL.createObjectURL(sign);

            a.href = signUrl;
            a.download = res.usr + ".dat";
            a.click();

            window.URL.revokeObjectURL(signUrl);

            $("#digSign").prop("disabled", false);
            toast("Listo", "Guarde su firma digital");
        },
        error: (err) => {
            console.log(err);
            toast("Advertencia", "Ocurrio un error, intentelo mas tarde");
            $("#digSign").prop("disabled", false);
        },
    });
});
