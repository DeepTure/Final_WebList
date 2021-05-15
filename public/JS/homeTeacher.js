$('#showCode').hide();
getGroupsTeacher();

function getGroupsTeacher(){
    const id = $('#idTeacher').val();
    $.ajax({
        url:'/home/getGroups',
        type:'post',
        data:{id},
        success:function(response){
            console.log(response);
            showGroupsAndSubjects(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}

$('#generateCode').click(function(){
    $('#showCode').show();
    $('#settingsCode').hide();
    const time = $('#timeSetter').val();
    updateTime(time);
});

function showGroupsAndSubjects(gruposMaterias){
    const grupos = gruposMaterias.grupos;
    let codeGrupos = "";
    let groupsHystory = [];
    grupos.forEach((grupo)=>{
        if(!(grupo.id_grupo in groupsHystory)){
            codeGrupos += `<input
                class="buttonInput smallButton blue"
                type="button"
                value="`+grupo.id_grupo+`"
            />`;
            groupsHystory.push(grupo.id_grupo);
        }
    });
    $('#groups').html(codeGrupos);
}