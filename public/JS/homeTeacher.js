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