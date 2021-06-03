//Global variables
let programas = 0;

$("#showCode").hide();
$("#subjects").hide();
$("#copyMessage").hide();
$("#generateCode").hide();
$("#settingsCode").hide();
getGroupsTeacher();
verifyTokenSaved();

function getGroupsTeacher() {
    const id = $("#idTeacher").val();
    $.ajax({
        url: "/home/getGroups",
        type: "post",
        data: { id },
        success: function (response) {
            console.log(response);
            showGroupsAndSubjects(response);
        },
        error: function (response) {
            console.log(response);
        },
    });
}

$("#generateCode").click(function () {
    const duration = $("#timeSetter").val();
    const matter = $("#selectSubjects").val();
    const generation = sessionStorage.getItem("generation");
    const group = sessionStorage.getItem("group");
    const program = sessionStorage.getItem("program");
    const idEmpleado = $("#idTeacher").val();

    $.ajax({
        url: "/home/addToken",
        type: "post",
        data: { duration, matter, generation, group, program, idEmpleado },
        success: function (response) {
            console.log(response);
            try {
                if (
                    response.responseT.protocol41 == true &&
                    response.responseS.protocol41 == true
                ) {
                    sessionStorage.setItem("idToken", response.idToken);
                    showToken(response.code, new Date(response.expire));
                    joinRoomSocket(response.room);
                    sessionStorage.setItem("room", response.room);
                    sessionStorage.setItem("program", response.program);
                    toast("Codigo generado", "No cierre esta ventana");
                    console.log("New Token");
                } else {
                    alert("Un error inesperado a ocurrido");
                }
            } catch (e) {
                console.log(e);
                alert("Un error inesperado a ocurrido");
            }
        },
        error: function (response) {
            console.log(response);
        },
    });
});

/**
 *
 * @param {grupos y materias del profesor} gruposMaterias
 * aun falta que muestre las materias cuando elija el grupo
 */
function showGroupsAndSubjects(gruposMaterias) {
    let grupos = [];
    if (gruposMaterias.grupos.length > 1) {
        gruposMaterias.grupos.forEach((grupo) => {
            grupos.push(grupo[0]);
        });
    } else {
        grupos = gruposMaterias.grupos;
    }
    programas = gruposMaterias.programas;
    let codeGrupos = "";
    let groupsHystory = [];
    grupos.forEach((grupo, i) => {
        if (!(grupo.id_grupo in groupsHystory)) {
            codeGrupos +=
                `<input
                class="buttonInput smallButton blue"
                type="button"
                onclick="selectedGroupForSubjects('` +
                grupo.id_generacion +
                `', '` +
                grupo.id_grupo +
                `', '` +
                programas[i].id_programa +
                `')"
                value="` +
                grupo.id_grupo +
                `"
            />`;
            groupsHystory.push(grupo.id_grupo);
        }
    });
    $("#groups").html(codeGrupos);
}

function selectedGroupForSubjects(generacion, grupo, programa) {
    let code = "";
    sessionStorage.setItem("generation", generacion);
    sessionStorage.setItem("group", grupo);
    sessionStorage.setItem("program", programa);
    programas.forEach((programa) => {
        if (generacion === programa.id_generacion) {
            code += "<option>" + programa.materia + "</option>";
        } else {
            console.log(
                "No entra: " + generacion + " ? " + programa.id_generacion
            );
        }
    });
    $("#selectSubjects").html(code);
    $("#subjects").show();
    $("#generateCode").show();
    $("#settingsCode").show();
}

function showToken(code, duration) {
    sessionStorage.setItem("tokenActive", "true");
    sessionStorage.setItem("code", code);
    sessionStorage.setItem("duration", duration);
    $("#showCode").show();
    $("#settingsCode").hide();
    $("#subjects").hide();
    $("#groups").hide();
    $("#generateCode").hide();
    $(".groupsSection").hide();
    $("#inputShowCode").val(code);
    prepareTimer(duration);
    startTimer();

    let button = document.querySelector("#clipButton");
    let input = document.querySelector("#inputShowCode");
    button.addEventListener("click", function () {
        input.focus();
        document.execCommand("selectAll");
        document.execCommand("copy");
        $("#copyMessage").show();
        $("#copyMessage").hide(500);
    });
}

function verifyTokenSaved() {
    const id = $("#idTeacher").val();
    $.ajax({
        url: "/home/verifyToken",
        type: "post",
        data: { id },
        success: function (response) {
            console.log(response);
            //verificamos que este activo y que el tamaño sea correcto
            if (response.length != 0 && !response.isNotActive) {
                if (!response.noToken) {
                    //tiene un token activo
                    let code = "";
                    if (sessionStorage.getItem("tokenActive") == "true") {
                        code = sessionStorage.getItem("code");
                    } else {
                        code = "Codigo activo";
                    }
                    //comprobamos si ya caduco // esta condicion nunca se debería cumplir
                    if (new Date(response.minutesRemaining).getTime() <= 0) {
                        alert("Ha caducado");
                        sessionStorage.setItem("tokenActive", "false");
                    } else {
                        joinRoomSocket(response.room);
                        sessionStorage.setItem("room", response.room);
                        sessionStorage.setItem("idToken", response.idToken);
                        sessionStorage.setItem("program", response.program);
                        getStudentWaiting(response.idToken, response.program);
                        showToken(code, new Date(response.minutesRemaining));
                    }
                } else {
                    console.log("No hay un token");
                    if (response.long > 1) {
                        alert("Tiene multiples tokens activos");
                    }
                }
            } else {
                sessionStorage.setItem("tokenActive", "false");
                popUp("Codigo caducado", "Su codigo ha caducado", "info");
                assistencesDeclined(response.room);
            }
        },
        error: function (response) {
            console.log(response);
        },
    });
}

/**
 * Rechaza la asistencia de un alumno
 * @param {String} boleta boleta del usuario
 */
function reject(boleta) {
    const idToken = sessionStorage.getItem("idToken");
    const room = sessionStorage.getItem("room");
    const id_generacion = sessionStorage.getItem("generation");
    const program = sessionStorage.getItem("program");
    $.ajax({
        url: "/home/profesor/asistencia/reject",
        type: "post",
        data: { boleta, idToken, id_generacion, program },
        success: function (response) {
            console.log(response);
            if (!response.protocol41) {
                alert("No se pudo rechazar");
            } else {
                $("#" + boleta).hide(150);
                $("#" + boleta).remove();
                sendAssistencesReject(room, boleta);
            }
        },
        error: function (response) {
            console.log(response);
        },
    });
}

function acceptAssistence(boleta) {
    const idToken = sessionStorage.getItem("idToken");
    const id_generacion = sessionStorage.getItem("generation");
    const program = sessionStorage.getItem("program");
    const room = sessionStorage.getItem("room");
    $.ajax({
        url: "/home/profesor/asistencia/accept",
        type: "post",
        data: { boleta, idToken, id_generacion, program },
        success: function (response) {
            console.log(response);
            $("#" + boleta).hide(150);
            $("#" + boleta).remove();
            sendAssistencesAccept(room, boleta);
        },
        error: function (response) {
            console.log(response);
        },
    });
}

function acceptAll() {
    const idToken = sessionStorage.getItem("idToken");
    const program = sessionStorage.getItem("program");
    const room = sessionStorage.getItem("room");
    $.ajax({
        url: "/home/profesor/asistencia/acceptAll",
        type: "post",
        data: { idToken, program },
        success: function (response) {
            console.log(response);
            const code = `<tr class="title">
            <th>boleta</th>
            <th>Nombre</th>
            <th>
                <input
                    class="buttonInput tinyButtonLW green"
                    type="button"
                    name="acceptAll"
                    value="Aceptar todo"
                    onclick="acceptAll()"
                />
            </th>
        </tr>`;
            $("#attendanceRegistration").html(code);
            sendAssistencesAcceptAll(room, response.boletas);
        },
        error: function (response) {
            console.log(response);
        },
    });
}

function rejectAll() {
    const idToken = sessionStorage.getItem("idToken");
    const program = sessionStorage.getItem("program");
    const room = sessionStorage.getItem("room");
    const code = `<tr class="title">
            <th>boleta</th>
            <th>Nombre</th>
            <th>
                <input
                    class="buttonInput tinyButtonLW green"
                    type="button"
                    name="acceptAll"
                    value="Aceptar todo"
                    onclick="acceptAll()"
                />
            </th>
        </tr>`;
    $.ajax({
        url: "/home/profesor/asistencia/rejectAll",
        type: "post",
        data: { idToken, program },
        success: function (response) {
            console.log(response);
            sendAssistencesRejectAll(room, response.boletas);
            $("#attendanceRegistration").html(code);
        },
        error: function (response) {
            console.log(response);
        },
    });
}

function deleteTokenSaved() {
    const idToken = sessionStorage.getItem("idToken");
    const program = sessionStorage.getItem("program");
    $.ajax({
        url: "/home/profesor/token/delete",
        type: "post",
        data: { idToken, program },
        success: function (response) {
            console.log(response);
            if (
                response.deletedS.affectedRows == 1 &&
                response.deletedT.affectedRows == 1
            ) {
                toast("Codigo caducado", "su codigo ha caducado");
            }
        },
        error: function (response) {
            console.log(response);
        },
    });
}

function getStudentWaiting(idToken, program) {
    $.ajax({
        url: "/home/profesor/asistencia/studentsWaiting",
        type: "post",
        data: { idToken, program },
        success: function (response) {
            console.log(response);
            showStudents(response);
        },
        error: function (response) {
            console.log(response);
        },
    });
}

function showStudents(students) {
    const boletas = students.boletas;
    const table = document.getElementById("attendanceRegistration");
    boletas.forEach((boleta, i) => {
        let code =
            `<tr id="${boleta.boleta}"><td>` +
            boleta.boleta +
            `</td>
        <td>${students.names[i].nombre} ${students.names[i].app}</td>
        <td>
            <article class="autoManageTogether">
                <input
                    class="buttonInput tinyButton blue"
                    type="button"
                    value="Aceptar"
                    onclick="acceptAssistence(${boleta.boleta})"
                />
                <input
                    class="buttonInput tinyButton red"
                    type="button"
                    name="decline"
                    value="Rechazar"
                    onclick="reject(${boleta.boleta})"
                />
            </article>
        </td</tr>`;

        table.insertAdjacentHTML("beforeend", code);
    });
}
