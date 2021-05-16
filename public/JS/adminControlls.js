const patron_almn = /^([0-9]{10}){1}$/;
const patron_prof = /^([0-9]{10}){1}$/;
const patron_letras = /^([a-zA-Z ])+$/;

var groups = [];
var readyGroups = [];

var subjects = [
    { materia: "Ingenieria de software basica", code: "ISB" },
    { materia: "Soporte de software", code: "SS" },
    {
        materia: "Lab. de proyectos de tecnologias de la informacion IV",
        code: "LPTIIV",
    },
    { materia: "Proyecto integrador", code: "PI" },
];

var subjectsItems = [];

//Funciones de JQuery a ejecutar cuando se carge completamente la pagina
$(document).ready(() => {
    $("#otherDataAlumno").hide();
    $("#groupsList").hide();
    $("#msgBox").hide();

    getGroups()
        .then((data) => {
            groups = data;
            $("#groupsList").show();
            createSubjBox();
        })
        .catch((err) => {
            console.log(err);
            $("#msgBox").show();
            createSubjBox();
        });
});

//listener para añadir caja para materia y grupo
$("#addMat").click((ev) => {
    createSubjBox();
});

//listener para elimnar caja para materia y grupo
$("#quitMat").click((ev) => {
    if (subjectsItems.length <= 1) {
        alert("No se pueden eliminar mas materias");
    } else {
        $(`#${subjectsItems[subjectsItems.length - 1].section}`).remove();
        subjectsItems.pop();
    }
});

//añadir usuario
$("#addUser").click((ev) => {
    /*if (test == true) {*/
    try {
        if ($("#arol option:selected").val() == "Profesor") {
            if (subjectsItems.length != 0) {
                let dataToSend = [];
                let check = true;
                let tempData = [];
                subjectsItems.forEach((item) => {
                    if (
                        tempData.includes(
                            `${$(`#${item.selectM} option:selected`).val()}${$(
                                `#${item.selectG} option:selected`
                            ).val()}`
                        )
                    ) {
                        check = false;
                        return;
                    }
                    dataToSend.push({
                        materia: $(`#${item.selectM} option:selected`).val(),
                        grupo: $(`#${item.selectG} option:selected`).val(),
                    });
                    tempData.push(
                        `${$(`#${item.selectM} option:selected`).val()}${$(
                            `#${item.selectG} option:selected`
                        ).val()}`
                    );
                });

                if (!check) {
                    alert("No repita materias con los mismos grupos");
                    return;
                }
                if (validar(dataToSend)) {
                    $.ajax({
                        url: "/addProfesor",
                        type: "POST",
                        data: {
                            id_empleado: $("#aid").val(),
                            nombre: $("#aname").val(),
                            app: $("#alastf").val(),
                            apm: $("#alastm").val(),
                            materias: JSON.stringify(dataToSend),
                            cicloE: generateCicloEscolar(),
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
                    alert(
                        "Por favor revise que los campos sean correctos e intentelo de nuevo"
                    );
                }
            } else {
                alert("Aun no se han añadido materias");
            }
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
    } catch (ex) {
        console.log(ex);
        alert("A ocurrido un error inesperado, intentelo de nuevo mas tarde");
    }
});

//Obtener lista de profesores registrados
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

//funcion para añadir grupo
$("#upGroup").click((ev) => {
    let id_grupo = $("#agroup option:selected").val();
    if (existGroup({ id_grupo })) {
        let cicloE = generateCicloEscolar();
        $.ajax({
            url: "/upGroup",
            type: "POST",
            data: {
                id_grupo,
                cicloE,
            },
            success: (res) => {
                alert(res);
                getGroups()
                    .then((data) => {
                        groups = data;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                if (subjectsItems.length == 0) {
                    $("#MatElement").empty();
                    createSubjBox();
                } else {
                    updateSubjBox();
                }
            },
            error: (err) => {
                console.log(err);
                alert("Algo a salido mal, intentelo mas tarde");
            },
        });
    } else {
        alert("Algo salio mal, intentelo mas tarde");
    }
});

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

//funcion para obtener los grupos que ya se han dado de alta
function getReadyGroups() {
    return new Promise((resolve, reject) => {
        try {
            $.ajax({
                url: "/getUpGroups",
                type: "POST",
                data: {
                    cicloE: generateCicloEscolar(),
                },
                success: (res) => {
                    let data = [];
                    res.forEach((r) => {
                        data.push(r.id_grupo);
                    });
                    resolve(data);
                },
                error: (err) => {
                    reject(err);
                },
            });
        } catch (ex) {
            reject(reject);
        }
    });
}

//funcion para obtener los grupos que no se han dado de alta
function getGroups() {
    return new Promise((resolve, reject) => {
        try {
            $.ajax({
                url: "/getGroups",
                type: "POST",
                data: {
                    cicloE: generateCicloEscolar(),
                },
                success: (res) => {
                    if (res === null) {
                        $("#pmsg").html(
                            "No se pudo obtener la informacion de los grupos, " +
                                "Intentelo mas tarde"
                        );
                        reject(false);
                    } else if (res.length == 0) {
                        $("#pmsg").html(
                            "No hay mas grupos por dar de alta este semestre"
                        );
                        reject(false);
                    } else {
                        let html = "";
                        res.forEach((grupo) => {
                            html +=
                                '<option class="smallInput centerText">' +
                                grupo.id_grupo +
                                "</option>";
                        });
                        $("#agroup").html(html);

                        resolve(res);
                    }
                },
                error: (err) => {
                    $("#pmsg").html("Algo a salido mal, intentelo mas tarde");
                    reject(err);
                },
            });
        } catch (ex) {
            $("#pmsg").html(
                "No se pudo obtener la informacion de los grupos, " +
                    "Intentelo mas tarde"
            );
            reject(ex);
        }
    });
}

//funcion para actualizar las cajas de materia grupo cuando se agrega un grupo
async function updateSubjBox() {
    try {
        let tempGroups = await getReadyGroups();
        if (subjectsItems.length != 0 && tempGroups.length != 0) {
            let html = "";
            tempGroups.forEach((group) => {
                html +=
                    "<option " +
                    'class="smallInput centerText">' +
                    group +
                    "</option>";
            });
            subjectsItems.forEach((item) => {
                $(`#${item.selectG}`).html(html);
            });
        }
    } catch (ex) {
        console.log(ex);
        alert(
            "Ocurrio un error al actualizar, Porfavor recarge la pagina o intentelo mas tarde"
        );
    }
}

//añadir caja para materia y grupo
async function createSubjBox() {
    try {
        if (groups.length == 0) {
            throw "No hay grupos para ingresar";
        }
        let tempGroups = await getReadyGroups();

        if (tempGroups.length == 0) {
            $("#MatElement").html(
                '<aside class="autoManageSpacedAlways">' +
                    "<p " +
                    'class="' +
                    "titleFont " +
                    "centerText " +
                    "addLeftMarginAlt " +
                    'addTopMarginAlt" ' +
                    ">" +
                    "No hay grupos dados de alta en este semestre" +
                    "</p>" +
                    "<br />" +
                    "</aside>"
            );
        } else {
            let counter = subjectsItems.length + 1;
            html =
                `<section id="boxM${counter}"` +
                "<br>" +
                "<aside " +
                "class=" +
                '"autoManageSpacedAlways ' +
                'addLeftMarginAlt "' +
                `id="boxmat${counter}"` +
                ">" +
                "<select " +
                'class="smallInput centerText" ' +
                `id="amat${counter}"` +
                `name="mat${counter}"` +
                ">";
            subjects.forEach((subject) => {
                html +=
                    "<option " +
                    'class="smallInput centerText" ' +
                    `value="${subject.code}">` +
                    subject.materia +
                    "</option>";
            });
            html +=
                "</select>" +
                "<br>" +
                "<select " +
                'class="smallInput centerText" ' +
                `id="amatgroup${counter}"` +
                `name="matgroup${counter}"` +
                ">";
            tempGroups.forEach((group) => {
                html +=
                    "<option " +
                    'class="smallInput centerText">' +
                    group +
                    "</option>";
            });
            html += "</select>" + "</aside>" + "<br>" + "</section>";
            $("#MatElement").append(html);
            subjectsItems.push({
                section: `boxM${counter}`,
                selectM: `amat${counter}`,
                selectG: `amatgroup${counter}`,
            });
            readyGroups = tempGroups;
        }
    } catch (ex) {
        console.log(ex);
        $("#MatElement").html(
            '<aside class="autoManageSpacedAlways">' +
                "<p " +
                'class="' +
                "titleFont " +
                "centerText " +
                "addLeftMarginAlt " +
                'addTopMarginAlt" ' +
                ">" +
                "Ocurrio un error inesperado, por favor recarge la pagina o intentelo mas tarde" +
                "</p>" +
                "<br />" +
                "</aside>"
        );
    }
}

//valida si el grupo esta en la lista original
function existGroup(groupToUp) {
    let check = false;

    groups.forEach((group) => {
        if (group.id_grupo == groupToUp.id_grupo) {
            check = true;
            return;
        }
    });

    return check;
}

//Funcion para validar campos
function validar(data) {
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
            if (data) {
                check++;
                data.forEach((dat) => {
                    if (!readyGroups.includes(dat.grupo)) {
                        check--;
                        return;
                    }
                });
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

//generador para dato ciclo escolar
function generateCicloEscolar() {
    let Year = new Date().getFullYear();
    let cicle = new Date().getMonth() <= 5 ? 1 : 2;

    return Year + "-" + cicle;
}
