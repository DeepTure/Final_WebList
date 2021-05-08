const model = {};

model.recovery = (req, res) =>{
    //Redireccionamiento al perfil
    return res.render("recover");
};

module.exports = model;