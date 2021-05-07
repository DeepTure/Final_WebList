const router = require("express").Router();

//Redireccionamiento al perfil
router.get('/home/help',(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    res.redirect("/");
    
},(req,res)=>{
    let direccion ="/home";
    return res.render("help",{direccion});
});

router.get('/home/historial/help',(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    res.redirect("/");
    
},(req,res)=>{
    let direccion ="/home/historial";
    return res.render("help",{direccion});
});

router.get('/home/modify/help',(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    res.redirect("/");
    
},(req,res)=>{
    let direccion ="/home";
    return res.render("help",{direccion});
});


router.get("/help", (req, res) => {
    let direccion ="/";
    return res.render("help",{direccion});
});

router.get("/helpuno", (req, res) => {
    return res.render("help1");
});

module.exports = router;