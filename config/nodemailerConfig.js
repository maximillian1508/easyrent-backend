const nodemailer = require('nodemailer');

const user = 'maxionyxboox@gmail.com';
const pass = 'nsxtsgpxyaxfjalr'; // Uses google's app specific password

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user,
        pass,
    },
});

const sendConfirmationEmail = () => {
    transport.sendMail({
        from: transport,
        to: 'maximillian1508@gmail.com',
        subject: 'hello',
        text: 'hello',
    });
};

module.exports = { sendConfirmationEmail };
