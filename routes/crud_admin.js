const router = require("express").Router();


router.get('/home/modify',(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    res.redirect("/");
    
},(req,res)=>{
    return res.render("modify");
});


module.exports = router;