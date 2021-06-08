var grupoCiclo = [];

var absences = [];
var filteredAbsences = [];
var dates = [];
var subjects = [];
var students = [];

var filters = {
    subject: null,
    student: null,
    date: null,
};

//funciones a ejecutar cuando se carga la pagina
$(document).ready(() => {
    setAllGroups();
});

//funcion para traer y preparar los registros
$("#bringReg").click((ev) => {
    if (grupoCiclo.includes($("#agroup option:selected").val())) {
        prepareAll();
    }
});

function prepareAll() {
    getAbsences(
        $("#agroup option:selected").val().slice(0, 4),
        $("#agroup option:selected").val().slice(5)
    )
        .then((data) => {
            if (data.length > 0) {
                absences = data;
                filteredAbsences = [];
                $("#msgBox").empty();
                $("#regsData").show();
                setAllParams();
                setAllAbsences();
                createChart();
            } else {
                $("#asub").html("<option>-- Materia --</option>");
                $("#astu").html("<option>-- Todos los alumnos --</option>");
                $("#adate").html("<option>-- Fecha --</option>");
                $("#regsData").hide();
                $("#msgBox").html(
                    "<p " +
                        'class="' +
                        "titleFont " +
                        "centerText " +
                        "addLeftMarginAlt " +
                        'addTopMarginAlt" ' +
                        ">" +
                        "No se encontraron inasistencias pertenecientes a esa generacion" +
                        "</p>" +
                        "<br />"
                );
            }
        })
        .catch((ex) => {
            console.log(ex);
        });
}

//filtro materias
$("#asub").on("change", () => {
    if ($("#asub option:selected").val() != "-- Materia --") {
        filters.subject = $("#asub option:selected").val();
        setFilters();
    } else {
        filters.subject = null;
        setFilters();
    }
});

//filtro materias
$("#astu").on("change", () => {
    if ($("#astu option:selected").val() != "-- Todos los alumnos --") {
        filters.student = $("#astu option:selected").val();
        setFilters();
    } else {
        filters.student = null;
        setFilters();
    }
});

//filtro materias
$("#adate").on("change", () => {
    if ($("#adate option:selected").val() != "-- Fecha --") {
        filters.date = $("#adate option:selected").val();
        setFilters();
    } else {
        filters.date = null;
        setFilters();
    }
});

//funcion para implementar los filtros
function setFilters() {
    filteredAbsences = [];
    absences.forEach((absence) => {
        if (
            (filters.date === null
                ? true
                : absence.fecha.slice(0, 10) == filters.date) &&
            (filters.student === null
                ? true
                : absence.boleta == filters.student) &&
            (filters.subject === null
                ? true
                : absence.materia.toLowerCase() == filters.subject)
        ) {
            filteredAbsences.push(absence);
        }
    });
    updateAllAbsences();
}

//funcion para preparar selectors
function setAllParams() {
    try {
        dates = [];
        subjects = [];
        students = [];
        let tempStudents = [];

        absences.forEach((absence) => {
            if (
                !tempStudents.includes(`${absence.fullname}${absence.boleta}`)
            ) {
                tempStudents.push(`${absence.fullname}${absence.boleta}`);
                students.push({
                    fullname: absence.fullname,
                    boleta: absence.boleta,
                });
            }
            if (!subjects.includes(absence.materia.toLowerCase())) {
                subjects.push(absence.materia.toLowerCase());
            }
            if (!dates.includes(absence.fecha.slice(0, 10))) {
                dates.push(absence.fecha.slice(0, 10));
            }
        });
        let htmlMat = "<option>-- Materia --</option>";
        let htmlStu = "<option>-- Todos los alumnos --</option>";
        let htmlDate = "<option>-- Fecha --</option>";

        subjects.forEach((subject) => {
            htmlMat += "<option>" + `${subject}` + "</option>";
        });
        students.forEach((student) => {
            htmlStu +=
                `<option value="${student.boleta}">` +
                `${student.fullname}` +
                "</option>";
        });
        dates.forEach((date) => {
            htmlDate += "<option>" + `${date}` + "</option>";
        });
        $("#asub").html(htmlMat);
        $("#astu").html(htmlStu);
        $("#adate").html(htmlDate);
    } catch (ex) {
        console.error(ex);
    }
}

//prepara la tabla para mostrar los datos
function setAllAbsences() {
    let html =
        '<tr class="title">' +
        "<th>Boleta</th>" +
        "<th>Nombre completo</th>" +
        "<th>Materia</th>" +
        "<th>Fecha</th>" +
        "<th>Acciones</th>" +
        "</tr>";
    absences.forEach((absence) => {
        html +=
            "<tr>" +
            `<td>${absence.boleta}</td>` +
            `<td>${absence.fullname}</td>` +
            `<td>${absence.materia.toLowerCase()}</td>` +
            `<td>${absence.fecha.replace(/[TZ]+/, " ").slice(0, 19)}</td>` +
            "<td>" +
            `<article class="autoManageTogether">` +
            "<input " +
            `class="buttonInput tinyButton red" ` +
            `type="button" ` +
            `name="delete" ` +
            `value="Eliminar" ` +
            `onclick="deleteById('${absence.id_inasistencia}')"` +
            "/>" +
            "</article>" +
            "</td>";
    });
    $("#titleData").text(
        `Historial de faltas del grupo ${absences[0].id_grupo} en el ciclo ${absences[0].cicloE}`
    );
    $("#tableAbs").html(html);
}

//actualiza la tabla para mostrar los datos
function updateAllAbsences() {
    if (filteredAbsences.length > 0) {
        let html =
            "<table " +
            'class="addLeftMarginAlt" ' +
            'cellspacing="0" ' +
            'cellpadding="0" ' +
            'id="tableAbs" ' +
            ">" +
            '<tr class="title">' +
            "<th>Boleta</th>" +
            "<th>Nombre completo</th>" +
            "<th>Materia</th>" +
            "<th>Fecha</th>" +
            "<th>Acciones</th>" +
            "</tr>";
        filteredAbsences.forEach((filteredAbsence) => {
            html +=
                "<tr>" +
                `<td>${filteredAbsence.boleta}</td>` +
                `<td>${filteredAbsence.fullname}</td>` +
                `<td>${filteredAbsence.materia.toLowerCase()}</td>` +
                `<td>${filteredAbsence.fecha
                    .replace(/[TZ]+/, " ")
                    .slice(0, 19)}</td>` +
                "<td>" +
                `<article class="autoManageTogether">` +
                "<input " +
                `class="buttonInput tinyButton red" ` +
                `type="button" ` +
                `name="delete" ` +
                `value="Eliminar" ` +
                `onclick="deleteById('${filteredAbsence.id_inasistencia}')"` +
                "/>" +
                "</article>" +
                "</td>";
        });
        html += "</table>";
        $("#tableAbs").html(html);
    } else {
        $("#tableAbs").html(
            "<p " +
                'class="' +
                "titleFont " +
                "centerText " +
                "addLeftMarginAlt " +
                'addTopMarginAlt" ' +
                ">" +
                "No se encontraron inasistencias con dichos filtros" +
                "</p>" +
                "<br />"
        );
    }
}

//funcion para eliminar una falta
function deleteById(id_inasistencia) {
    try {
        Swal.fire({
            title: "Confirmacion",
            text: "Desea eliminar esta inasistencia?",
            showCancelButton: true,
            confirmButtonColor: "#007bff",
            cancelButtonColor: "#dc3545",
            confirmButtonText: `Si`,
            cancelButtonText: `No`,
            confirmButtonAriaLabel: "Si",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/home/profesor/asistencia/deleteAttendance",
                    type: "POST",
                    data: {
                        id_inasistencia,
                    },
                    success: (res) => {
                        popUp(res, "", "info");
                        if (
                            grupoCiclo.includes(
                                $("#agroup option:selected").val()
                            )
                        ) {
                            prepareAll();
                        }
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

//funcion para crear las graficas
function createChart() {
    let labels = [];
    let data = [];

    absences.forEach((absence) => {
        if (!labels.includes(absence.materia)) {
            labels.push(absence.materia);
            data.push(1);
        } else {
            data[labels.indexOf(absence.materia)]++;
        }
    });
    $("#chartContainer").empty();
    $("#chartContainer").html('<canvas id="sampleChart"></canvas>');
    var ctx = document.getElementById("sampleChart").getContext("2d");
    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "No. de faltas",
                    data,
                    backgroundColor: ["#800040"],
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

//funcion para preparar todos los grupos
function setAllGroups() {
    getAllGroups()
        .then((data) => {
            if (data.length > 0) {
                let tempGrupoCiclo = [];
                html = "";
                data.forEach((grupo) => {
                    html +=
                        "<option " +
                        'class="smallInput centerText" ' +
                        `value="${grupo.id_grupo} ${grupo.cicloE}" ` +
                        ">" +
                        grupo.id_grupo +
                        " - " +
                        grupo.cicloE +
                        "</option>";
                    tempGrupoCiclo.push(`${grupo.id_grupo} ${grupo.cicloE}`);
                });
                grupoCiclo = tempGrupoCiclo;
                $("#agroup").html(html);
            } else {
                throw new Error("No groups returned");
            }
        })
        .catch((ex) => {
            console.error(ex);
            $("#groupsList").html(
                "<p " +
                    'class="' +
                    "titleFont " +
                    "centerText " +
                    "addLeftMarginAlt " +
                    'addTopMarginAlt" ' +
                    ">" +
                    "Ocurrio un error inesperado, por favor recarge la pagina o intentelo mas tarde" +
                    "</p>" +
                    "<br />"
            );
        });
}

//peticion para obtener todas las inasistencias
function getAbsences(id_grupo, cicloE) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/getAbsencesP",
            type: "POST",
            data: {
                id_grupo,
                cicloE,
            },
            success: (res) => {
                resolve(res);
            },
            error: (err) => {
                reject(err);
            },
        });
    });
}

//peticion para obtener todos los grupos
function getAllGroups() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/getProfessorRegGroups",
            type: "POST",
            success: (res) => {
                resolve(res);
            },
            error: (err) => {
                reject(err);
            },
        });
    });
}
