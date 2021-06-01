var grupoCiclo = [];

var absences = [];
var filteredAbsences = [];
var dates = [];
var subjects = [];
var students = [];

var filters = {
    subject: null,
    group: null,
    date: null,
};

//funciones a ejecutar cuando se carga la pagina
$(document).ready(() => {
    getAllAbsences();
});

//funcion para traer y preparar los registros
function getAllAbsences() {
    getAbsences()
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
                $("#agrp").html("<option>-- Grupo --</option>");
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
                        "No se encontraron inasistencias" +
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
$("#agrp").on("change", () => {
    if ($("#agrp option:selected").val() != "-- Grupo --") {
        filters.group = $("#agrp option:selected").val();
        setFilters();
    } else {
        filters.group = null;
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
            (filters.group === null
                ? true
                : absence.id_grupo == filters.group) &&
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
        groups = [];
        absences.forEach((absence) => {
            if (!groups.includes(absence.id_grupo)) {
                groups.push(absence.id_grupo);
            }
            if (!subjects.includes(absence.materia.toLowerCase())) {
                subjects.push(absence.materia.toLowerCase());
            }
            if (!dates.includes(absence.fecha.slice(0, 10))) {
                dates.push(absence.fecha.slice(0, 10));
            }
        });
        let htmlMat = "<option>-- Materia --</option>";
        let htmlGrp = "<option>-- Grupo --</option>";
        let htmlDate = "<option>-- Fecha --</option>";

        subjects.forEach((subject) => {
            htmlMat += "<option>" + `${subject}` + "</option>";
        });
        groups.forEach((group) => {
            htmlGrp += `<option>` + `${group}` + "</option>";
        });
        dates.forEach((date) => {
            htmlDate += "<option>" + `${date}` + "</option>";
        });
        $("#asub").html(htmlMat);
        $("#agrp").html(htmlGrp);
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
        "<th>Grupo</th>" +
        "<th>Fecha</th>" +
        "</tr>";
    absences.forEach((absence) => {
        html +=
            "<tr>" +
            `<td>${absence.boleta}</td>` +
            `<td>${absence.fullname}</td>` +
            `<td>${absence.materia.toLowerCase()}</td>` +
            `<td>${absence.id_grupo}</td>` +
            `<td>${new Date(absence.fecha).toString().slice(0, 24)}</td>`;
    });
    $("#titleData").text(`Tu historial`);
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
            "<th>Grupo</th>" +
            "<th>Fecha</th>" +
            "</tr>";
        filteredAbsences.forEach((filteredAbsence) => {
            html +=
                "<tr>" +
                `<td>${filteredAbsence.boleta}</td>` +
                `<td>${filteredAbsence.fullname}</td>` +
                `<td>${filteredAbsence.materia.toLowerCase()}</td>` +
                `<td>${filteredAbsence.id_grupo}</td>` +
                `<td>${new Date(filteredAbsence.fecha)
                    .toString()
                    .slice(0, 24)}</td>`;
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

//peticion para obtener todas las inasistencias
function getAbsences() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/getStudentAbsences",
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
