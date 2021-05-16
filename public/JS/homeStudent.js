getSubjects();

function getSubjects(){
    const id = $('#idStudent').val();
    $.ajax({
        url:'/home/student/getGroups',
        type:'post',
        data:{id},
        success:function(response){
            console.log(response);
            showGroups(response);
        },
        error:function(response){
            console-log(response);
        }
    });
}

function showGroups(grupos){
    let code = '';
    grupos.forEach((grupo)=>{
        code += ' '+grupo.id_grupo;
    });
    $('#showGroups').html(code);
}