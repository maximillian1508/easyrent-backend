const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS; // Uses google's app specific password

const transport = nodemailer.createTransport({
	host: "smtp.gmail.com",
	auth: {
		user,
		pass,
	},
});

const sendConfirmationEmail = (firstname, email, confirmationCode) => {
	transport.sendMail({
		from: { name: "EasyRent", address: user },
		to: email,
		subject: "[EasyRent] Account Confirmation",
		html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
          <div style="text-align:center;margin-bottom:20px">
            <img src="https://res.cloudinary.com/dnnonbql9/image/upload/v1721229708/er-horizontal_ronky4.png" alt="EasyRent" style="width:175px;">
          </div>
          <h1>Email Confirmation</h1>
          <h2 style="font-weight:400;">Hello ${firstname}, </h2>
          <p>Thank you for creating an Easyrent account. Please confirm your email address by clicking the button below</p>
          <div style="text-align:center">
		  	<a href=http://localhost/register-confirmation/${confirmationCode} style="box-sizing:border-box;text-decoration:none;background-color:#33415c;border:solid 1px #007bff;border-radius:4px;color:#ffffff;font-size:16px;font-weight:bold;margin:0;padding:9px 25px;display:inline-block;letter-spacing:1px">Click here</a>
          </div>
		</div>
      `,
	});
};

module.exports = { sendConfirmationEmail };
