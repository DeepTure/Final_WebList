//funciones de inicio
/*getStudents();*/

/*$('#addUser').click(function(){
    console.log('add user')
    //si es un alumno lo registramos en este modulo
    const rol = document.getElementById('arol').value;
    const id = document.getElementById('aid').value;
    const name = document.getElementById('aname').value;
    const lastf = document.getElementById('alastf').value;
    const lastm = document.getElementById('alastm').value;
    if(rol == 'Alumno'){
        //aquí va la validación
        if(true){
            $.ajax({
                url:'/addStudent',
                type:'post',
                data:{id, name, lastf, lastm},
                success:function(response){
                    console.log(response);
                    if(response.success){
                        alert('registrado con exito');
                        getStudents();
                        cleanInputs();
                    }
                },
                error:function(response){
                    console.log(response);
                }
            });
        }
    }else{
        console.log('other rol ',rol);
    }
});*/

function cleanInputs() {
    document.getElementById("arol").value = "";
    document.getElementById("aid").value = "";
    document.getElementById("aname").value = "";
    document.getElementById("alastf").value = "";
    document.getElementById("alastm").value = "";
}

//necesitamos comporbar que existe la cuenta del usuario antes o despues de hacer esta peticion
function getStudents() {
    $.ajax({
        url: "/getStudets",
        type: "post",
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
    code = `<tr class="title">
                <th>ID</th>
                <th>Nombre</th>
                <th>Ap_paterno</th>
                <th>Ap_materno</th>
                <th></th>
            </tr>`;

    students.forEach((student) => {
        code +=
            `<tr>
                    <td>` +
            student.id +
            `</td>
                    <td>` +
            student.name +
            `</td>
                    <td>` +
            student.lastf +
            `</td>
                    <td>` +
            student.lastm +
            `</td>
                    <td>
                        <article class="autoManageTogether">
                            <!-- Para fines de prueba, esta en a, pero puede ser cambiado a input -->
                            <a
                                href="/home/modify"
                                class="buttonInput tinyButton blue"
                                type="button"
                                name="modify"
                                value="Modificar"
                                >Modificar</a
                            >
                            <input
                                class="buttonInput tinyButton red"
                                type="button"
                                name="delete"
                                value="Eliminar"
                                onclick="deleteStudent(` +
            student.id +
            `)"
                            />
                        </article>
                    </td>
                </tr>`;
    });
    $("#tableUsers").html(code);
}

function deleteStudent(id) {
    console.log("delete ", id);
}
