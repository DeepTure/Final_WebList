const actions = {};
const nodemailer = require("nodemailer");

//funciones de configuracion
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "jafetkevin575@gmail.com",
        pass: "clhjhxejirvnjfth",
    },
});

function sendGeneralError(title, message) {
    const mailOptions = {
        from: "System",
        to: 'moran.orozco.kevin@gmail.com',
        subject: "Reporte de soporte tecnico: "+title,
        text:
            "Buen día, se ha registrado el problema siguiente:" + message,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        try {
            if (err) {
                console.log("Error: " + err);
            } else {
                console.log("Email enviado");
            }
        } catch (error) {
            console.log("Error inesperado al enviar correo: " + error);
            console.log(error.message);
        }
    });
}

//funciones de envio
/*Título general del error.
Activo principal.
Descripción de la falla.
Evidencias de respaldo (imágenes, videos, etc).*/
actions.generalReport = (title, message)=>{
    sendGeneralError(title, message);
}

module.exports = actions;