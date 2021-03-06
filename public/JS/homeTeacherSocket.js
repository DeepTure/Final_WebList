const socket = io();
let waitingList = [];

socket.on("assistence:recive", (tokenData) => {
    console.log("Asistencia recivida profesor");
    console.log(tokenData);
    if (!waitingList.includes(tokenData.boleta)) {
        const table = document.getElementById("attendanceRegistration");
        let code =
            `<tr id="${tokenData.boleta}"><td>` +
            tokenData.boleta +
            `</td>
            <td>${tokenData.name} ${tokenData.last}</td>
            <td>
                <article class="autoManageTogether">
                    <input
                        class="buttonInput tinyButton blue"
                        type="button"
                        value="Aceptar"
                        onclick="acceptAssistence(${tokenData.boleta})"
                    />
                    <input
                        class="buttonInput tinyButton red"
                        type="button"
                        name="decline"
                        value="Rechazar"
                        onclick="reject(${tokenData.boleta})"
                    />
                </article>
            </td></tr>`;

        table.insertAdjacentHTML("beforeend", code);
        waitingList.push(tokenData.boleta);
    } else {
        socket.emit("assistence:teacher:reject", {
            room: tokenData.room,
            boleta: tokenData.boleta,
        });
    }
});

socket.on("assistence:getTime", (room) => {
    const tokenTime = sessionStorage.getItem("nowTimeToken");
    socket.emit("assistence:setTime", { room, tokenTime });
});

//nos unimos a la sala
function joinRoomSocket(room) {
    waitingList = [];
    socket.emit("room:join", { room });
}

/**
 * Envia un mensaje al alumno informandole que su peticion fue rechada
 * @param {String} room es la sala a la que se debe conectar
 * @param {String} boleta es la boleta del alumno al que le debe llegar este mensaje
 */
function sendAssistencesReject(room, boleta) {
    socket.emit("assistence:teacher:reject", { room, boleta });
}

function sendAssistencesAccept(room, boleta) {
    socket.emit("assistence:teacher:accept", { room, boleta });
}

function sendAssistencesAcceptAll(room, students) {
    socket.emit("assistence:teacher:acceptAll", { room, students });
}

function sendAssistencesRejectAll(room, students) {
    socket.emit("assistence:teacher:rejectAll", { room, students });
}

function assistencesDeclined(room) {
    socket.emit("assistence:teacher:endCode", room);
}
