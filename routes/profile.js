const router = require("express").Router();
const db = require("../database/connection");
const crypto = require("crypto");

//Redireccionamiento al perfil
router.get('/home/perfil',(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    res.redirect("/");
    
},(req,res)=>{
    let rol=req.user.rol;
    let id =req.user.id[1];
    //Realiza una consulta para demostrar sus datos en la vista mediante el idMUsuario
    db.query("select * from CUsuario where idMUsuario = ?",[req.user.id[0]],(err,usuario) =>{
        if(err){
            console.log(err);
        }else{
            res.render('perfil',{id,usuario});
        }
    });
});

//Metodo que modifica los datos
router.post(
    "/home/perfil/change",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect("/");
    },
    (req, res) => {
        
        var contrasena=req.body.password
        var confirm= req.body.confirmPassword
        var correo = req.body.email
        //En caso de que haya llenado los espacios de contraseña y correo
        if (contrasena.length != 0 && correo.length != 0){
            if(contrasena == confirm){
                const hash = crypto.createHash("sha256");
                hash.update(contrasena);
                var asegurado = hash.digest("hex");
                db.query("update CUsuario set contrasena = ?, email = ? where idMUsuario = ?",
                [asegurado,correo,req.user.id[0]],
                (err, result)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect('/home/perfil');
                    }
                });
            }else{
                res.redirect('/home/perfil');
            }
        //En caso de que sólo haya llenado la contraseña
        }else if(contrasena.length != 0){
            if(contrasena == confirm){
                const hash = crypto.createHash("sha256");
                hash.update(contrasena);
                var asegurado = hash.digest("hex");
                db.query("update CUsuario set contrasena = ? where idMUsuario = ?",
                [asegurado,req.user.id[0]],
                (err, result)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect('/home/perfil');
                    }
                });
            }else{
                res.redirect('/home/perfil');
            }
            
        //En caso de que sólo haya llenado el email
        }else if(correo.length != 0){   
            
            db.query("update CUsuario set email = ? where idMUsuario = ?",
                [correo,req.user.id[0]],
                (err, result)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect('/home/perfil');
                    }
                });
        }else{
            res.redirect('/home/perfil');
        }
    }
);

module.exports = router;