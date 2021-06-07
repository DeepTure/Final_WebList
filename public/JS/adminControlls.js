const patron_almn = /^([0-9]{10}){1}$/;
const patron_prof = /^([0-9]{10}){1}$/;
const patron_letras = /^([áéíóúÁÉÍÓÚñÑa-zA-Z ]{1,45}){1}$/;

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
var groupsItems = [];

//Funciones de JQuery a ejecutar cuando se carge completamente la pagina
$(document).ready(() => {
    $("#otherDataAlumno").hide();
    $("#groupsList").hide();
    $("#msgBox").hide();

    updateTableProfessor();
    getGroups()
        .then((data) => {
            groups = data;
            $("#groupsList").show();
            createSubjBox();
            createGroupBox();
        })
        .catch((err) => {
            console.log(err);
            $("#msgBox").show();
            createSubjBox();
            createGroupBox();
        });
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
        toast("Advertencia", "No se pueden añadir mas grupos");
    }
});

//listener para elimnar caja para materia y grupo
$("#quitMat").click((ev) => {
    if (subjectsItems.length <= 1) {
        toast("Advertencia", "No se pueden eliminar mas materias");
    } else {
        $(`#${subjectsItems[subjectsItems.length - 1].section}`).remove();
        subjectsItems.pop();
    }
});

//listener para elimnar caja para grupo en inscriṕcion
$("#quitGrp").click((ev) => {
    if (groupsItems.length <= 1) {
        toast("Advertencia", "No se pueden eliminar mas grupos");
    } else {
        $(`#${groupsItems[groupsItems.length - 1].section}`).remove();
        groupsItems.pop();
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
                    toast(
                        "Advertencia",
                        "No repita materias con los mismos grupos"
                    );
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
                            toast("Informacion", res);
                            updateTableProfessor();
                            $("#bStudentEntities").attr(
                                "class",
                                "buttonInput smallButton blue"
                            );
                            $("#bProfessorEntities").attr(
                                "class",
                                "buttonInput smallButton red"
                            );
                        },
                        error: (err) => {
                            console.log(err);
                            toast(
                                "Advertencia",
                                "Algo a salido mal, intentelo mas tarde"
                            );
                        },
                    });
                } else {
                    toast(
                        "Advertencia",
                        "Por favor revise que los campos sean correctos e intentelo de nuevo"
                    );
                }
            } else {
                toast("Advertencia", "Aun no se han añadido materias");
            }
        } else {
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
                    toast("Advertencia", "No repita los mismos grupos");
                    return;
                }
                if (validar(dataToSend)) {
                    $.ajax({
                        url: "/addStudent",
                        type: "POST",
                        data: {
                            boleta: $("#aid").val(),
                            nombre: $("#aname").val(),
                            app: $("#alastf").val(),
                            apm: $("#alastm").val(),
                            grupos: JSON.stringify(dataToSend),
                            cicloE: generateCicloEscolar(),
                        },
                        success: (res) => {
                            toast("Informacion", res);
                            updateTableStudent();
                            $("#bProfessorEntities").attr(
                                "class",
                                "buttonInput smallButton blue"
                            );
                            $("#bStudentEntities").attr(
                                "class",
                                "buttonInput smallButton red"
                            );
                        },
                        error: (err) => {
                            console.log(err);
                            toast(
                                "Advertencia",
                                "Algo a salido mal, intentelo mas tarde"
                            );
                        },
                    });
                } else {
                    toast(
                        "Advertencia",
                        "Por favor revise que los campos sean correctos e intentelo de nuevo"
                    );
                }
            } else {
                toast("Advertencia", "Aun no se han añadido grupos");
            }
        }
    } catch (ex) {
        console.log(ex);
        toast(
            "Advertencia",
            "A ocurrido un error inesperado, intentelo de nuevo mas tarde"
        );
    }
});

//Obtener lista de profesores registrados
$("#bProfessorEntities").click((ev) => {
    updateTableProfessor();
    $("#bStudentEntities").attr("class", "buttonInput smallButton blue");
    $("#bProfessorEntities").attr("class", "buttonInput smallButton red");
});

//Obtener lista de alumnos registrados
$("#bStudentEntities").click((ev) => {
    updateTableStudent();
    $("#bProfessorEntities").attr("class", "buttonInput smallButton blue");
    $("#bStudentEntities").attr("class", "buttonInput smallButton red");
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
                toast("Advertencia", res);
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
                if (groupsItems.length == 0) {
                    $("#MatElement").empty();
                    createGroupBox();
                } else {
                    updateGroupBox();
                }
            },
            error: (err) => {
                console.log(err);
                toast("Advertencia", "Algo a salido mal, intentelo mas tarde");
            },
        });
    } else {
        toast("Advertencia", "Algo salio mal, intentelo mas tarde");
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
        toast("Advertencia", "Algo salio mal, intentelo mas tarde");
    }
});

//control para csv
$("#fastRegister").click((ev) => {
    ev.preventDefault();
    let formdata = new FormData();

    if ($("#fileCSV").prop("files").length == 1) {
        let file = $("#fileCSV").prop("files")[0];
        if (file.type == "text/csv") {
            formdata.append("table", file, "tablaUsuarios.csv");
            formdata.append("cicloE", generateCicloEscolar());
            toast("Procesando...", "No cierre esta ventana");
            $.ajax({
                enctype: "multipart/form-data",
                url: "/addUsersByCSV",
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                success: (res) => {
                    if (res.ok) {
                        toast(
                            "Listo",
                            "Se han procesado a los usuarios correctamente"
                        );
                        updateTableProfessor();
                        $("#bStudentEntities").attr(
                            "class",
                            "buttonInput smallButton blue"
                        );
                        $("#bProfessorEntities").attr(
                            "class",
                            "buttonInput smallButton red"
                        );
                    } else {
                        toast("Advertencia", res.msg);
                    }
                },
                error: (err) => {
                    console.log(err);
                    toast(
                        "Advertencia",
                        `Algo a salido mal, intentelo mas tarde`
                    );
                },
                complete: () => {
                    $("#fileCSV").val("");
                },
            });
        } else {
            $("#fileCSV").val("");
            toast("Advertencia", "Introduzca un archivo csv valido");
        }
    } else {
        toast("Advertencia", "Asegurese de haber subido sus archivos");
    }
});

//promesa para obtener los grupos que ya se han dado de alta
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

//promesa para obtener los grupos que no se han dado de alta
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

//promesa para obtener todos los profesores
function getAllProfessors() {
    return new Promise((resolve, reject) => {
        try {
            $.ajax({
                url: "/getProfesor",
                type: "POST",
                success: (res) => {
                    resolve(res);
                },
                error: (err) => {
                    reject(err);
                },
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

//promesa para obtener todos los alumnos
function getAllStudents() {
    return new Promise((resolve, reject) => {
        try {
            $.ajax({
                url: "/getStudent",
                type: "POST",
                success: (res) => {
                    resolve(res);
                },
                error: (err) => {
                    reject(err);
                },
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

//promesa para obtener informacion del profesor por id
function getProfessor(id_empleado, cicloE) {
    return new Promise((resolve, reject) => {
        try {
            $.ajax({
                url: "/getProfesorById",
                type: "POST",
                data: {
                    id_empleado,
                    cicloE,
                },
                success: (res) => {
                    resolve(res);
                },
                error: (err) => {
                    throw err;
                },
            });
        } catch (ex) {
            reject({ code: 0, msg: ex });
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
        readyGroups = tempGroups;
    } catch (ex) {
        console.log(ex);
        toast(
            "Advertencia",
            "Ocurrio un error al actualizar, Porfavor recarge la pagina o intentelo mas tarde"
        );
    }
}

//funcion para actualizar las cajas de grupo en inscripcion cuando se agrega un grupo
async function updateGroupBox() {
    try {
        let tempGroups = await getReadyGroups();
        if (groupsItems.length != 0 && tempGroups.length != 0) {
            let html = "";
            tempGroups.forEach((group) => {
                html +=
                    "<option " +
                    'class="smallInput centerText">' +
                    group +
                    "</option>";
            });
            groupsItems.forEach((item) => {
                $(`#${item.selectG}`).html(html);
            });
        }
        readyGroups = tempGroups;
    } catch (ex) {
        console.log(ex);
        toast(
            "Advertencia",
            "Ocurrio un error al actualizar, Porfavor recarge la pagina o intentelo mas tarde"
        );
    }
}

//funcion para actualizar tablas de profesor
async function updateTableProfessor() {
    try {
        $("#tableMsgBox").empty();
        let profesores = await getAllProfessors();
        if (profesores === null) {
            $("#tableUsers").empty();
            $("#tableMsgBox").html(
                "No se pudo obtener la informacion de los profesores, " +
                    "Intentelo mas tarde"
            );
        } else if (profesores.length == 0) {
            $("#tableUsers").empty();
            $("#tableMsgBox").html("No se encontraron profesores registrados");
        } else {
            let html =
                '<tr class="title">' +
                "<th>ID</th>" +
                "<th>Nombre</th>" +
                "<th>Materia</th>" +
                "<th>Ciclo escolar</th>" +
                "<th>Grupo asignado</th>" +
                "<th>Acciones</th>" +
                "</tr>";
            profesores.forEach((profesor) => {
                html +=
                    "<tr>" +
                    `<td>${profesor.id_empleado}</td>` +
                    `<td>${profesor.nombre} ${profesor.app} ${profesor.apm}</td>` +
                    `<td>${profesor.materia}</td>` +
                    `<td>${profesor.cicloE}</td>` +
                    `<td>${profesor.id_grupo}</td>` +
                    "<td>" +
                    `<article class="autoManageTogether">` +
                    '<form action="/homeModify" method="POST">' +
                    `<input name="id_empleado" value="${profesor.id_empleado}" type="hidden"/>` +
                    `<input name="cicloE" value="${profesor.cicloE}" type="hidden"/>` +
                    "<input " +
                    `class="buttonInput tinyButton blue" ` +
                    `type="submit" ` +
                    `name="modify" ` +
                    `value="Modificar"` +
                    "/>" +
                    "</form>" +
                    "<input " +
                    `class="buttonInput tinyButton red" ` +
                    `type="button" ` +
                    `name="delete" ` +
                    `value="Eliminar" ` +
                    `onclick="deleteByIdProfessor('${profesor.id_empleado}')"` +
                    "/>" +
                    "</article>" +
                    "</td>";
            });
            $("#tableUsers").html(html);
        }
    } catch (ex) {
        console.log(ex);
        $("#tableUsers").empty();
        $("#tableMsgBox").html(
            "No se pudo obtener la informacion de los profesores, " +
                "Intentelo mas tarde"
        );
    }
}

//funcion para actualizar tablas de alumnos
async function updateTableStudent() {
    try {
        $("#tableMsgBox").empty();
        let estudiantes = await getAllStudents();
        if (estudiantes === null) {
            $("#tableUsers").empty();
            $("#tableMsgBox").html(
                "No se pudo obtener la informacion de los alumnos, " +
                    "Intentelo mas tarde"
            );
        } else if (estudiantes.length == 0) {
            $("#tableUsers").empty();
            $("#tableMsgBox").html("No se encontraron alumnos registrados");
        } else {
            let html =
                '<tr class="title">' +
                "<th>ID</th>" +
                "<th>Nombre</th>" +
                "<th>Ciclo escolar</th>" +
                "<th>Grupo asignado</th>" +
                "<th>Acciones</th>" +
                "</tr>";
            estudiantes.forEach((profesor) => {
                html +=
                    "<tr>" +
                    `<td>${profesor.boleta}</td>` +
                    `<td>${profesor.nombre} ${profesor.app} ${profesor.apm}</td>` +
                    `<td>${profesor.cicloE}</td>` +
                    `<td>${profesor.id_grupo}</td>` +
                    "<td>" +
                    `<article class="autoManageTogether">` +
                    '<form action="/homeModify" method="POST">' +
                    `<input name="boleta" value="${profesor.boleta}" type="hidden"/>` +
                    `<input name="cicloE" value="${profesor.cicloE}" type="hidden"/>` +
                    "<input " +
                    `class="buttonInput tinyButton blue" ` +
                    `type="submit" ` +
                    `name="modify" ` +
                    `value="Modificar"` +
                    "/>" +
                    "</form>" +
                    "<input " +
                    `class="buttonInput tinyButton red" ` +
                    `type="button" ` +
                    `name="delete" ` +
                    `value="Eliminar" ` +
                    `onclick="deleteByIdStudent('${profesor.boleta}')"` +
                    "/>" +
                    "</article>" +
                    "</td>";
            });
            $("#tableUsers").html(html);
        }
    } catch (ex) {
        console.log(ex);
        $("#tableUsers").empty();
        $("#tableMsgBox").html(
            "No se pudo obtener la informacion de los alumnos, " +
                "Intentelo mas tarde"
        );
    }
}

//añadir caja para materia y grupo
async function createSubjBox() {
    try {
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

//añadir caja para grupo del alumno
async function createGroupBox() {
    try {
        let tempGroups = await getReadyGroups();
        if (tempGroups.length == 0) {
            $("#GrpElement").html(
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
            tempGroups.forEach((group) => {
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
            readyGroups = tempGroups;
        }
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

//funcion para cambiar a modo de modificacion profesor
function changeProfessorMode(id_empleado, cicloE) {
    try {
        getProfessor(id_empleado, cicloE)
            .then((data) => {
                if (data.code == 3) {
                    toast("Advertencia", "Algo salio mal, intentelo mas tarde");
                } else if (data.code == 4) {
                    let materiaGrupo = [];
                    data.msg.forEach((item) => {
                        materiaGrupo.push(item.materia, item.id_grupo);
                    });
                    $("#modeN").hide();
                    $("#Eaid").text(`${data.msg[0].id_profesor}`);
                    $("#Eaname").text(`${data.msg[0].nombre}`);
                    $("#Ealastf").text(`${data.msg[0].app}`);
                    $("#Ealastm").text(`${data.msg[0].apm}`);
                    $("#Erol").text(`Profesor`);
                    html +=
                        '<aside class="autoManageSpacedAlways">' +
                        "Clase(s) que imparte" +
                        "<br />" +
                        "</aside>" +
                        "<br />" +
                        '<aside class="autoManageSpacedAlways">' +
                        "<input" +
                        'class="buttonInput blue" ' +
                        'id="EaddMat" ' +
                        'type="button" ' +
                        'name="EaddM" ' +
                        'value="Añadir materia" ' +
                        "/>" +
                        "<br />" +
                        "<input" +
                        'class="buttonInput red" ' +
                        'id="EquitMat" ' +
                        'type="button" ' +
                        'name="EquitM" ' +
                        'value="Quitar materia" ' +
                        "/>" +
                        "</aside>" +
                        "<br />" +
                        '<section id="EMatElement"></section>';
                    $("#");
                }
            })
            .catch((error) => {
                console.log(error);
                toast("Advertencia", "Algo salio mal, intentelo mas tarde");
            });
    } catch (ex) {
        console.log(ex);
        toast("Advertencia", "Algo salio mal, intentelo mas tarde");
    }
}

//funcion para elimar profesor por id
function deleteByIdProfessor(id_empleado) {
    try {
        Swal.fire({
            title: "Confirmacion",
            text: "Desea eliminar este usuario?",
            showCancelButton: true,
            confirmButtonColor: "#007bff",
            cancelButtonColor: "#dc3545",
            confirmButtonText: `Si`,
            cancelButtonText: `No`,
            confirmButtonAriaLabel: "Si",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/deleteProfessorById",
                    type: "POST",
                    data: {
                        id_empleado,
                    },
                    success: (res) => {
                        popUp(res, "", "info");
                        updateTableProfessor();
                    },
                    error: (err) => {
                        console.log(err);
                        toast(
                            "Advertencia",
                            "Algo a salido mal, intentelo mas tarde"
                        );
                    },
                });
            }
        });
    } catch (ex) {
        console.log(ex);
        toast(
            "Advertencia",
            "Ocurrio un error inesperado, recarge la pagina o intentelo mas tarde"
        );
    }
}

//funcion para elimar profesor por id
function deleteByIdStudent(boleta) {
    try {
        let ask = confirm("¿Estas seguro que deseas eliminar ese usuario?");
        if (ask) {
            $.ajax({
                url: "/deleteStudentById",
                type: "POST",
                data: {
                    boleta,
                },
                success: (res) => {
                    toast("Advertencia", res);
                    updateTableStudent();
                },
                error: (err) => {
                    console.log(err);
                    toast(
                        "Advertencia",
                        "Algo a salido mal, intentelo mas tarde"
                    );
                },
            });
        }
    } catch (ex) {
        console.log(ex);
        toast(
            "Advertencia",
            "Ocurrio un error inesperado, recarge la pagina o intentelo mas tarde"
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
            if (data) {
                check++;
                data.forEach((dat) => {
                    if (!readyGroups.includes(dat.grupo)) {
                        check--;
                        return;
                    }
                });
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
            toast(
                "Advertencia",
                "Error: A ocurrido un error inesperado. Intentelo mas tarde"
            );
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
