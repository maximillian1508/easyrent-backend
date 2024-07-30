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
		  	<a href=https://easyrentofficial.me/register-confirmation/${confirmationCode} style="box-sizing:border-box;text-decoration:none;background-color:#33415c;border:solid 1px #007bff;border-radius:4px;color:#ffffff;font-size:16px;font-weight:bold;margin:0;padding:9px 25px;display:inline-block;letter-spacing:1px">Click here</a>
          </div>
		</div>
      `,
	});
};

const sendPaymentReminder = (firstname, email, amount, dueDate) => {
	return new Promise((resolve, reject) => {
		const formattedDueDate = dueDate.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		transport.sendMail(
			{
				from: { name: "EasyRent", address: user },
				to: email,
				subject: "EasyRent: Monthly Rent Payment Reminder",
				html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
              <div style="text-align:center;margin-bottom:20px">
                <img src="https://res.cloudinary.com/dnnonbql9/image/upload/v1721229708/er-horizontal_ronky4.png" alt="EasyRent" style="width:175px;">
              </div>
              <h1>Monthly Rent Payment Reminder</h1>
              <h2 style="font-weight:400;">Hello ${firstname}, </h2>
              <p>This is a friendly reminder that your monthly rent payment of RM${amount} is due on ${formattedDueDate}.</p>
              <p>Please ensure timely payment to avoid any late fees.</p>
              <p>Thank you for choosing EasyRent!</p>
              <div style="text-align:center;margin-top:20px">
                <p>If you have any questions, please don't hesitate to contact us.</p>
              </div>
            </div>
          `,
			},
			(error, info) => {
				if (error) {
					reject(error);
				} else {
					resolve(info);
				}
			},
		);
	});
};

const sendAcceptanceEmail = (
	firstname,
	email,
	propertyName,
	startDate,
	endDate,
	rentAmount,
) => {
	const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const formattedEndDate = new Date(endDate).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	transport.sendMail({
		from: { name: "EasyRent", address: user },
		to: email,
		subject: "EasyRent: Your Application Has Been Accepted!",
		html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
          <div style="text-align:center;margin-bottom:20px">
            <img src="https://res.cloudinary.com/dnnonbql9/image/upload/v1721229708/er-horizontal_ronky4.png" alt="EasyRent" style="width:175px;">
          </div>
          <h1>Application Accepted</h1>
          <h2 style="font-weight:400;">Hello ${firstname}, </h2>
          <p>We are pleased to inform you that your application for ${propertyName} has been accepted!</p>
          <p>Here are the details of your rental:</p>
          <ul>
            <li>Start Date: ${formattedStartDate}</li>
            <li>End Date: ${formattedEndDate}</li>
            <li>Monthly Rent: RM${rentAmount}</li>
          </ul>
          <p>Please log in to your EasyRent account to review and sign the rental agreement.</p>
          <p>We look forward to welcoming you to your new home!</p>
          <div style="text-align:center;margin-top:20px">
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      `,
	});
};

const sendRejectionEmail = (firstname, email, propertyName) => {
	transport.sendMail({
		from: { name: "EasyRent", address: user },
		to: email,
		subject: "EasyRent: Update on Your Application",
		html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
          <div style="text-align:center;margin-bottom:20px">
            <img src="https://res.cloudinary.com/dnnonbql9/image/upload/v1721229708/er-horizontal_ronky4.png" alt="EasyRent" style="width:175px;">
          </div>
          <h1>Application Status Update</h1>
          <h2 style="font-weight:400;">Hello ${firstname}, </h2>
          <p>We appreciate your interest in renting ${propertyName}. After careful consideration, we regret to inform you that your application has not been accepted at this time.</p>
          <p>This decision doesn't reflect on you personally, and we encourage you to explore other properties available on EasyRent that might better suit your needs.</p>
          <p>Thank you for your understanding, and we wish you the best in your housing search.</p>
          <div style="text-align:center;margin-top:20px">
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      `,
	});
};

module.exports = {
	sendConfirmationEmail,
	sendPaymentReminder,
	sendAcceptanceEmail,
	sendRejectionEmail,
};
