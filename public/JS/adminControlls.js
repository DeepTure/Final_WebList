const patron_almn = /^([0-9]{10}){1}$/;
const patron_prof = /^([0-9]{10}){1}$/;
const patron_letras = /^([a-zA-Z ])+$/;

//Funciones de JQuery
$(document).ready(() => {
    $("#otherDataAlumno").hide();

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
                        alert(res);
                    },
                    error: (err) => {
                        console.log(err);
                        alert("Algo a salido mal, intentelo mas tarde");
                    },
                });
            } else {
                /*let Year = new Date().getFullYear();
                let cicle = new Date().getMonth() <= 5 ? 1 : 2;

                let datos = JSON.stringify({
                    id_empleado: $("#aid").val(),
                    nombre: $("#aname").val(),
                    app: $("#alastf").val(),
                    apm: $("#alastm").val(),
                    id_CicloE: Year + "-" + cicle,
                    id_Grupo: $("#arol option:selected").val(),
                });*/
                alert("Esta opcion se encuentra en mantenimiento");
            }
        } else {
            alert(
                "Por favor revise que los campos sean correctos e intentelo de nuevo"
            );
        }
    });

    $("#bProfessorEntities").click((ev) => {
        $.ajax({
            url: "/getProfesor",
            type: "POST",
            success: (res) => {
                console.log(res);
            },
            error: (err) => {
                console.log(err);
                alert("Algo a salido mal, intentelo mas tarde");
            },
        });
    });
});

//Funcion para validar campos
function validar() {
    let check = 0;
    try {
        if ($("#arol option:selected").val() == "Alumno") {
            if (patron_almn.test($("#aid").val())) {
                check++;
            }
            if (
                $("#arol option:selected").val() == "6IV9" ||
                $("#arol option:selected").val() == "6IV7" ||
                $("#arol option:selected").val() == "6IV8"
            ) {
                check++;
            }
        } else if ($("#arol option:selected").val() == "Profesor") {
            if (patron_prof.test($("#aid").val())) {
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
        if (check == 3) {
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        return false;
    }
}

//cuando se haga click al select detecta si es profe para mostrar as materias
$("#arol").on("change", () => {
    if ($("#arol option:selected").val() === "Profesor") {
        $("#otherDataAlumno").hide();
        $("#otherDataProfesor").show();
    } else if ($("#arol option:selected").val() == "Alumno") {
        $("#otherDataProfesor").hide();
        $("#otherDataAlumno").show();
    } else {
        alert("Algo salio mal, intentelo mas tarde");
    }
});
