$('#addUser').click(function(){
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
                },
                error:function(response){
                    console.log(response);
                }
            });
        }
    }else{
        console.log('other rol ',rol);
    }
});