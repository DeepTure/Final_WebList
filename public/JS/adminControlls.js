const patron_almn = /^([0-9]{10}){1}$/;
const patron_prof = /^([0-9]{3}){1}$/;
const patron_letras = /^([a-zA-Z ])+$/;

$(document).ready(() => {
    $("#addUser").click((ev) => {
        let test = validar();
        if (test == true) {
            if ($("#arol option:selected").val() == "Profesor") {
                let materias = [];
                if ($("#amap").prop("checked") == true) {
                    materias.push("MAP");
                }
                if ($("#ass").prop("checked") == true) {
                    materias.push("SS");
                }
                if ($("#aisb").prop("checked") == true) {
                    materias.push("ISB");
                }
                if ($("#alptiiv").prop("checked") == true) {
                    materias.push("LPTIIV");
                }
                if ($("#api").prop("checked") == true) {
                    materias.push("PI");
                }
                let datos = JSON.stringify({
                    id_empleado: $("#aid").val(),
                    nombre: $("#aname").val(),
                    app: $("#alastf").val(),
                    apm: $("#alastm").val(),
                    materias: materias,
                });
                $.ajax({
                    url: "/addProfesor",
                    type: "POST",
                    data: {
                        datos: datos,
                    },
                    success: (res) => {
                        console.log("done");
                    },
                    error: (err) => {
                        console.log(err);
                    },
                });
            } else {
            }
        } else {
            alert(
                "Por favor revise que los campos sean correctos e intentelo de nuevo"
            );
        }
    });
});

function validar() {
    let check = 0;
    try {
        if ($("#arol option:selected").val() == "Alumno") {
            if (patron_almn.test($("#aid").val())) {
                check++;
            }
        } else if ($("#arol option:selected").val() == "Profesor") {
            if (patron_prof.test($("#aid").val())) {
                check++;
            }
        } else {
            alert("Error: A ocurrido un error inesperado. Intentelo mas tarde");
            return false;
        }
        if (
            patron_letras.test($("#aname").val()) &&
            patron_letras.test($("#alastf").val()) &&
            patron_letras.test($("#alastm").val())
        ) {
            check++;
        }
        if (
            $("#amap").prop("checked") == true ||
            $("#ass").prop("checked") == true ||
            $("#aisb").prop("checked") == true ||
            $("#alptiiv").prop("checked") == true ||
            $("#api").prop("checked") == true
        ) {
            check++;
        }
        if (check == 3) {
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        return false;
    }
}
