//el nombre del archivo solo es por comodidad
//no influje en las funciones del mismo

//router
const router = require("express").Router();

//variable de la bd
//por si necesitan realizar alguna consulta en este lugar
const db = require("../database/connection");

//router simple
router.get("/", (req, res) => {
    return res.render("login", { err: req.flash("error") });
});


/*
IMPORTANTE
si quieren evitar errores y simplificar codigo
usen el 'return' antes de cualquier funcion de res
asi el router deja de trabajar con el resto del codigo 
y se evitan conflictos de cabezeras ya enviadas
*/

/*
los siguientes son ejemplo de como pueden usar las url para pasar datos
y acceder a los routers
su uso es completamente opcional
*/

//router con parametros
/*
router.get("/info:dato", (req, res) => {
    return res.send(req.params.dato);
    
    el nombre del paramentro comienza a partir de los dos puntos (:)
    tambien se puede utilizar como
    '/info:dato' o '/info/:dato'
    si mandamos a llamar a la ruta '/info:dato'
    despues de 'info' todo lo demas se convierte en el parametro
    exceptuando el caracter slash '/' el cual ya cambia la ruta por completo
    
});
*/
//router con una query en url
/*
router.get("/datos", (req, res) => {
    return res.send(req.query.dato);
    
    La query es un poco mas compleja que el parametro pero
    funciona casi de la misma forma solo que la url es distinta
    el usario llama a una ruta '/datos?dato=maria'
    aqui el query se va a llamar 'dato' y va a contener a 'maria'
    se pueden anidar mutiples queries de la siguiente manera
    /datos?nombre=maria&apellido=cordoba
    el caracter '&' diferencia entre cada query
    
});
*/

/*
Cuando accedan a datos como
'req.body' 'req.params' o 'req.query'
asegurence que antes SI existan los datos
esto se puede hacer con un
if(req.dato){

}
*/

module.exports = router;