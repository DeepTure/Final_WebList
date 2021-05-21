const socket = io();

socket.on('assistences:recive', (tokenData)=>{
    console.log('Recibe sistencia');
    console.log(tokenData);
    const table = document.getElementById('attendanceRegistration');
    let code = `<td>`+(tokenData.boleta)+`</td>
        <td>Sultano de Tal</td>
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

//nos unimos a la sala
function joinRoomSocket(room){
    socket.emit('room:join',{room});
}