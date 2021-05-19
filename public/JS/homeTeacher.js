//Global variables
let programas = 0;

$('#showCode').hide();
$('#subjects').hide();
$('#copyMessage').hide();
$('#generateCode').hide();
$('#settingsCode').hide();
getGroupsTeacher();

//comprobamos si tiene un token activo si es que no ha cerrado sesion
if(sessionStorage.getItem('tokenActive')){
    if(sessionStorage.getItem('tokenActive')=='true'){
        showToken(sessionStorage.getItem('code'), sessionStorage.getItem('duration'));
    }else{
        verifyTokenSaved()
    }
}else{
    verifyTokenSaved()
}


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
    const duration = $('#timeSetter').val();
    const matter = $('#selectSubjects').val();
    const generation = sessionStorage.getItem('generation');
    const group = sessionStorage.getItem('group');
    const program = sessionStorage.getItem('program');
    const idEmpleado = $('#idTeacher').val();
    
    $.ajax({
        url:'/home/addToken',
        type:'post',
        data:{duration, matter, generation, group, program, idEmpleado},
        success:function(response){
            console.log(response);
            if(response.responseT.protocol41==true && response.responseS.protocol41==true){
                showToken(response.code, duration);
            }else{
                alert('Un error inesperado a ocurrido')
            }
        },
        error:function(response){
            console.log(response);
        }
    });
});

/**
 * 
 * @param {grupos y materias del profesor} gruposMaterias
 * aun falta que muestre las materias cuando elija el grupo 
 */
function showGroupsAndSubjects(gruposMaterias){
    const grupos = gruposMaterias.grupos;
    programas = gruposMaterias.programas;
    let codeGrupos = "";
    let groupsHystory = [];
    grupos.forEach((grupo, i)=>{
        if(!(grupo.id_grupo in groupsHystory)){
            codeGrupos += `<input
                class="buttonInput smallButton blue"
                type="button"
                onclick="selectedGroupForSubjects('`+grupo.id_generacion+`', '`+grupo.id_grupo+`', '`+programas[i].id_programa+`')"
                value="`+grupo.id_grupo+`"
            />`;
            groupsHystory.push(grupo.id_grupo);
        }
    });
    $('#groups').html(codeGrupos);
}

function selectedGroupForSubjects(generacion, grupo, programa){
    let code  = '';
    sessionStorage.setItem("generation", generacion);
    sessionStorage.setItem("group", grupo);
    sessionStorage.setItem("program", programa);
    programas.forEach((programa)=>{
        if(generacion === programa.id_generacion){
            code += '<option>'+programa.materia+'</option>';
        }else{
            console.log('No entra: '+generacion+' ? '+programa.id_generacion)
        }
    }); 
    $('#selectSubjects').html(code);
    $('#subjects').show();
    $('#generateCode').show();
    $('#settingsCode').show();
}

function showToken(code, duration){
    sessionStorage.setItem('tokenActive', 'true');
    sessionStorage.setItem('code', code);
    sessionStorage.setItem('duration', duration);
    $('#showCode').show();
    $('#settingsCode').hide();
    $('#subjects').hide();
    $('#groups').hide();
    $('#generateCode').hide();
    $('.groupsSection').hide();
    $('#inputShowCode').val(code);
    updateTime(duration);

    let button = document.querySelector('#clipButton');
    let input = document.querySelector('#inputShowCode');
    button.addEventListener('click', function(){
        input.focus();
        document.execCommand('selectAll');
        document.execCommand('copy');
        $('#copyMessage').show();
        $('#copyMessage').hide(500);
    });
}

function verifyTokenSaved(){
    const id = $('#idTeacher').val();
    $.ajax({
        url:'/home/verifyToken',
        type:'post',
        data:{id},
        success:function(response){
            console.log(response);
            if(response.length != 0){
                //tiene un token activo
                showToken('Token activo', (response.duracion+''));
            }
        },
        error:function(response){
            console.log(response);
        }
    });
}