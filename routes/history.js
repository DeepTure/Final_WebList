const router = require("express").Router();
const db = require("../database/connection");
const crypto = require("crypto");

//Redireccionamiento al perfil
router.get('/home/historial',(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    res.redirect("/");
    
},(req,res)=>{
    let rol=req.user.rol;
    let id =req.user.id[1];
    res.render('history',{id,rol});
});


module.exports = router;