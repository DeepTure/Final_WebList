let activeType = "reg";

$("#digitalSign").click((ev) => {
    if (activeType == "reg") {
        $("#regularLogin").hide();
        $("#signLogin").show();
        $("#digitalSign").val("Usar logIn normal");
        activeType = "sign";
    } else if (activeType == "sign") {
        $("#regularLogin").show();
        $("#signLogin").hide();
        activeType = "reg";
        $("#digitalSign").val("Usar firma digital");
    }
});

$("#logIn").click((ev) => {
    formdata = new FormData();
    if (activeType == "reg") {
        $("#regularLog").submit();
    } else if (activeType == "sign") {
        if ($("#sign").prop("files").length == 1) {
            let file = $("#sign").prop("files")[0];
            if (file.name.toLowerCase().endsWith(".dat")) {
                formdata.append("sign", file, `${$("#usr").val()}.dat`);
                formdata.append("user", $("#usr").val());
                formdata.append("rol", $("#rol option:selected").val());
                toast("Procesando...", "No cierre esta ventana");
                $.ajax({
                    enctype: "multipart/form-data",
                    url: "/VerSign",
                    type: "POST",
                    data: formdata,
                    processData: false,
                    contentType: false,
                    success: (res) => {
                        if (res.check) {
                            $("#usrRolId").val(res.rol);
                            $("#pswId").val(res.data.pid);
                            $("#usrId").val(res.data.id);
                            $("#signLog").submit();
                        } else {
                            toast(
                                "Informacion",
                                "El usuario no corresponde a dicha firma"
                            );
                        }
                    },
                    error: (err) => {
                        console.log(err);
                        toast(
                            "Advertencia",
                            "A ocurrido un error inesperado, intentelo mas tarde"
                        );
                    },
                    complete: () => {
                        $("#sign").val("");
                    },
                });
            } else {
                $("#sign").val("");
                toast("Advertencia", "Introduzca un archivo .dat valido");
            }
        } else {
            toast("Advertencia", "Asegurese de haber subido sus archivos");
        }
    }
});
