var patron_nombre = /^[áéíóúÁÉÍÓÚña-zA-Z\s]{1,50}/;
var patron_ApellidoPM = /^[áéíóúÁÉÍÓÚña-zA-Z]{1,20}/;
var patron_numEmpleado = /^[0-9]{10}/;
var patron_boleta = /^[0-9]{10}/;
var patron_email =
    /^(^[\w+.]+@{1}[a-z]+(([.](com|web|org|gob|ipn)){1}([.](jp|es|mx))?){1}$){1}/;
var patron_contra = /^[0-9a-zA-Z$@$!%*?&]{8,100}$/;

function Nombres(nombre) {
    if (patron_nombre.test(nombre)) {
        return true;
    } else {
        console.log("Validación no aprobada del nombre");
        return false;
    }
}

function ApellidoPM(appm) {
    if (patron_ApellidoPM.test(appm)) {
        return true;
    } else {
        console.log("Validación no aprobada del apellido")
        return false;
    }
}

function numEmpleado(num) {
    if (patron_numEmpleado.test(num)) {
        return true;
    } else {
        console.log("Validación no aprobada del número de empleado")
        return false;
    }
}

function boleta(bol) {
    if (patron_boleta.test(bol)) {
        return true;
    } else {
        console.log("Validación no aprobada de la boleta")
        return false;
    }
}

function correo(email) {
    if (patron_email.test(email)) {
        return true;
    } else {
        console.log("Validación no aprobada en el email")
        return false;
    }
}

function contra(pass) {
    if (patron_contra.test(pass)) {
        return true;
    } else {
        console.log("Validación no aprobada de la contraseña")
        return false;
    }
}

module.exports = {
    Nombres,
    ApellidoPM,
    numEmpleado,
    boleta,
    correo,
    contra,
};
