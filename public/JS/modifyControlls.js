const patron_almn = /^([0-9]{10}){1}$/;
const patron_prof = /^([0-9]{10}){1}$/;
const patron_letras = /^([a-zA-Z ]{1,45}){1}$/;

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

var preData = {};

var subjectsItems = [];
var groupsItems = [];

//Funciones a ejecutar cuando se termina de cargar la pagina
$(document).ready(() => {
    if ($("#arol").text() == "Profesor") {
        preData = JSON.parse($("#unknownData").val());
        $("#unknownData").remove();

        preData.readyGroups.forEach((group) => {
            readyGroups.push(group.id_grupo);
        });
        preData.materiaGrupo.forEach((mg) => {
            subjects.forEach((sub) => {
                if (sub.materia.toUpperCase() == mg.materia) {
                    mg.materia = sub.code;
                    return;
                }
            });
        });
        restoreBoxes();
    } else if ($("#arol").text() == "Alumno") {
        preData = JSON.parse($("#unknownData").val());
        $("#unknownData").remove();

        preData.readyGroups.forEach((group) => {
            readyGroups.push(group.id_grupo);
        });
        restoreBoxes();
    } else {
        window.location.replace("/home");
    }
});

//añadir usuario
$("#updUser").click((ev) => {
    /*if (test == true) {*/
    try {
        if ($("#arol").text() == "Profesor") {
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
                    let finalData = speedUpP(dataToSend);
                    $.ajax({
                        url: "/modifyProfesor",
                        type: "POST",
                        data: {
                            id_empleado: preData.id_empleado,
                            id_usuario: preData.id_usuario,
                            nombre: $("#aname").val(),
                            app: $("#alastf").val(),
                            apm: $("#alastm").val(),
                            materiasD: JSON.stringify(finalData.toDelete),
                            materiasA: JSON.stringify(finalData.toAdd),
                            cicloE: preData.cicloE,
                        },
                        success: (res) => {
                            if (res.code == 0) {
                                alert(res.msg);
                            } else {
                                alert(res.msg);
                                window.location.replace("/home");
                            }
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
        } else if ($("#arol").text() == "Alumno") {
            if (groupsItems.length != 0) {
                let dataToSend = [];
                let check = true;
                let tempData = [];
                groupsItems.forEach((item) => {
                    if (
                        tempData.includes(
                            `${$(`#${item.selectG} option:selected`).val()}`
                        )
                    ) {
                        check = false;
                        return;
                    }
                    dataToSend.push({
                        grupo: $(`#${item.selectG} option:selected`).val(),
                    });
                    tempData.push(
                        `${$(`#${item.selectG} option:selected`).val()}`
                    );
                });

                if (!check) {
                    alert("No repita materias con los mismos grupos");
                    return;
                }
                if (validar(dataToSend)) {
                    let finalData = speedUpA(dataToSend);
                    $.ajax({
                        url: "/modifyStudent",
                        type: "POST",
                        data: {
                            boleta: preData.boleta,
                            id_usuario: preData.id_usuario,
                            nombre: $("#aname").val(),
                            app: $("#alastf").val(),
                            apm: $("#alastm").val(),
                            gruposD: JSON.stringify(finalData.toDelete),
                            gruposA: JSON.stringify(finalData.toAdd),
                            cicloE: preData.cicloE,
                        },
                        success: (res) => {
                            if (res.code == 0) {
                                alert(res.msg);
                            } else {
                                alert(res.msg);
                                window.location.replace("/home");
                            }
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
            alert(
                "A ocurrido un error inesperado, intentelo de nuevo mas tarde"
            );
            window.location.replace("/home");
        }
    } catch (ex) {
        console.log(ex);
        alert("A ocurrido un error inesperado, intentelo de nuevo mas tarde");
    }
});

//listener para añadir caja para materia y grupo
$("#addMat").click((ev) => {
    createSubjBox();
});

//listener para añadir caja para grupo en inscriṕcion
$("#addGrp").click((ev) => {
    if (groupsItems.length < readyGroups.length) {
        createGroupBox();
    } else {
        alert("No se pueden añadir mas grupos");
    }
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

//listener para elimnar caja para grupo en inscriṕcion
$("#quitGrp").click((ev) => {
    if (groupsItems.length <= 1) {
        alert("No se pueden eliminar mas grupos");
    } else {
        $(`#${groupsItems[groupsItems.length - 1].section}`).remove();
        groupsItems.pop();
    }
});

//funcion para restaurar cajas de materia grupoval
function restoreBoxes() {
    try {
        if (preData.rol == "Profesor") {
            preData.materiaGrupo.forEach((item) => {
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
                        `value="${subject.code}" ` +
                        `${item.materia == subject.code ? "selected" : ""}` +
                        ">" +
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
                readyGroups.forEach((group) => {
                    html +=
                        "<option " +
                        'class="smallInput centerText" ' +
                        `${item.id_grupo == group ? "selected" : ""}` +
                        ">" +
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
            });
        } else if (preData.rol == "Alumno") {
            preData.grupos.forEach((item) => {
                let counter = groupsItems.length + 1;
                html =
                    `<section id="boxG${counter}"` +
                    "<br>" +
                    "<aside " +
                    "class=" +
                    '"autoManageSpacedAlways ' +
                    'addLeftMarginAlt "' +
                    `id="boxgrp${counter}"` +
                    ">" +
                    "<br>" +
                    "<select " +
                    'class="smallInput centerText" ' +
                    `id="agroup${counter}"` +
                    `name="group${counter}"` +
                    ">";
                readyGroups.forEach((group) => {
                    html +=
                        "<option " +
                        'class="smallInput centerText" ' +
                        `${item.id_grupo == group ? "selected" : ""}` +
                        ">" +
                        group +
                        "</option>";
                });
                html += "</select>" + "</aside>" + "<br>" + "</section>";
                $("#GrpElement").append(html);
                groupsItems.push({
                    section: `boxG${counter}`,
                    selectG: `agroup${counter}`,
                });
            });
        } else {
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

//añadir caja para materia y grupo
async function createSubjBox() {
    try {
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
        readyGroups.forEach((group) => {
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

//añadir caja para grupo del alumno
async function createGroupBox() {
    try {
        let counter = groupsItems.length + 1;
        html =
            `<section id="boxG${counter}"` +
            "<br>" +
            "<aside " +
            "class=" +
            '"autoManageSpacedAlways ' +
            'addLeftMarginAlt "' +
            `id="boxgrp${counter}"` +
            ">" +
            "<br>" +
            "<select " +
            'class="smallInput centerText" ' +
            `id="agroup${counter}"` +
            `name="group${counter}"` +
            ">";
        readyGroups.forEach((group) => {
            html +=
                "<option " +
                'class="smallInput centerText">' +
                group +
                "</option>";
        });
        html += "</select>" + "</aside>" + "<br>" + "</section>";
        $("#GrpElement").append(html);
        groupsItems.push({
            section: `boxG${counter}`,
            selectG: `agroup${counter}`,
        });
    } catch (ex) {
        console.log(ex);
        $("#GrpElement").html(
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

//Funcion para validar campos
function validar(data) {
    let check = 0;
    try {
        if ($("#arol").text() == "Alumno") {
            if (patron_almn.test($("#aid").text())) {
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
            if (preData.boleta == $("#aid").text()) {
                check++;
            }
        } else if ($("#arol").text() == "Profesor") {
            if (patron_prof.test($("#aid").text())) {
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
            if (preData.id_empleado == $("#aid").text()) {
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
        if (preData.rol == $("#arol").text()) {
            check++;
        }
        if (check == 5) {
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        return false;
    }
}

//Funcion para evitar mandar datos de mas
function speedUpP(dataToSend) {
    let toDelete = [];
    let toAdd = [];

    let check = true;
    dataToSend.forEach((data) => {
        check = true;
        preData.materiaGrupo.forEach((preData) => {
            if (
                data.materia == preData.materia &&
                data.grupo == preData.id_grupo
            ) {
                check = false;
                return;
            }
        });
        if (check) {
            toAdd.push({ materia: data.materia, grupo: data.grupo });
        }
    });

    check = true;
    preData.materiaGrupo.forEach((preData) => {
        check = true;
        dataToSend.forEach((data) => {
            if (
                data.materia == preData.materia &&
                data.grupo == preData.id_grupo
            ) {
                check = false;
                return;
            }
        });
        if (check) {
            toDelete.push({
                materia: preData.materia,
                grupo: preData.id_grupo,
            });
        }
    });

    return { toAdd, toDelete };
}

//Funcion para evitar mandar datos de mas
function speedUpA(dataToSend) {
    let toDelete = [];
    let toAdd = [];

    let check = true;
    dataToSend.forEach((data) => {
        check = true;
        preData.grupos.forEach((preData) => {
            if (data.grupo == preData.id_grupo) {
                check = false;
                return;
            }
        });
        if (check) {
            toAdd.push({ grupo: data.grupo });
        }
    });

    check = true;
    preData.grupos.forEach((preData) => {
        check = true;
        dataToSend.forEach((data) => {
            if (data.grupo == preData.id_grupo) {
                check = false;
                return;
            }
        });
        if (check) {
            toDelete.push({
                grupo: preData.id_grupo,
            });
        }
    });

    return { toAdd, toDelete };
}
