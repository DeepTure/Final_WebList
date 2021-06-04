const model = {};
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "jafetkevin575@gmail.com",
        pass: "clhjhxejirvnjfth",
    },
});

model.sendEmail = (req, res)=>{
    const data = req.body;
    try{
        sendEmailMessage(data.email, data.message, data.zone, data.title);
        return res.send('ok');
    }catch(err){
        console.log(err);
        return res.send('error');
    }
};

function sendEmailMessage(email, message, zone, title) {
    const messageToSend = `Titulo: ${title}\n
    Activo: ${zone}\n
    Email: ${email}\n
    Descripción: ${message}`;
    const mailOptions = {
        from: "System",
        to: 'moran.orozco.kevin@gmail.com',
        subject: "Petición de ayuda",
        text: messageToSend
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

module.exports = model;