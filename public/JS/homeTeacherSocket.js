const socket = io();

socket.on('assistence:recive', (tokenData)=>{
    console.log('Asistencia recivida profesor');
    console.log('Recibe sistencia');
    console.log(tokenData);
    const table = document.getElementById('attendanceRegistration');
    let code = `<td>`+(tokenData.boleta)+`</td>
        <td>${tokenData.name} ${tokenData.last}</td>
        <td>
            <article class="autoManageTogether">
                <input
                    class="buttonInput tinyButton blue"
                    type="button"
                    name="accept"
                    value="Aceptar"
                />
                <input
                    class="buttonInput tinyButton red"
                    type="button"
                    name="decline"
                    value="Rechazar"
                />
            </article>
        </td>`;

        table.insertAdjacentHTML('beforeend', code);
});

socket.on('assistence:getTime',(room)=>{
    const tokenTime = sessionStorage.getItem('nowTimeToken');
    socket.emit('assistence:setTime',{room, tokenTime});
});

//nos unimos a la sala
function joinRoomSocket(room){
    socket.emit('room:join',{room});
}