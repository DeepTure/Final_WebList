const model = {};
const db = require("../database/connection");
const jwt = require("jsonwebtoken");

model.verifyCode = (code, id)=>{
    //Necesitamos primero su generacion y luego su prohgrama para obtener el id_token
    db.query('SELECT id_generacion FROM minscripcion WHERE boleta = ?',[id],(err, idg)=>{
        if(err)return err;
        console.log('Entra al primer query ',idg);
        //ahora buscamos sus programas pero puede tener varias generaciones
        const querys = processQuerysProgramsByGeneration(idg);
        db.query(querys, (err, programs)=>{
            if(err)return err;
            console.log('Entra al segundo query ', programs);
            const querys = processQuerysTokenByPrograms(programs);
            db.query(querys, (err, tokenBd)=>{
                if(err)return err;
                console.log('Entra al ultimo query ',tokenBd.length);
                if(tokenBd.length != 0){
                    const token = tokenBd.id_token;
                    jwt.verify(token, code, (err, res)=>{
                        if(err){
                            return false;
                        }else{
                            return true;
                        }
                    });
                }else{
                    console.log('retoirna false')
                    return false;
                }
            });
        })
    });
};

function processQuerysProgramsByGeneration(ids){
    let querys = '';
    ids.forEach((id)=>{
        querys += 'SELECT * FROM mprograma WHERE id_generacion = "'+id.id_generacion+'";';
    });
    return querys;
}

function processQuerysTokenByPrograms(programs){
    let querys = '';
    programs.forEach((program)=>{
        querys += 'SELECT * FROM etokenlista WHERE id_programa = "'+program.id_programa+'";';
    });
    return querys;
}

module.exports = model;