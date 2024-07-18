const { sendConfirmationEmail } = require("../config/nodemailerConfig");
const User = require("../models/UserSchema");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
	try {
		sendConfirmationEmail();
		res.status(400).json({ message: "Successfull" });
	} catch (err) {
		res.json({ error: err.message });
	}
};

const logout = async (req, res) => {
	try {
		sendConfirmationEmail();
		res.status(400).json({ message: "Successfull" });
	} catch (err) {
		res.json({ error: err.message });
	}
};

const resendVerificationEmail = async (req, res) => {
	let searchField = {};
	const { email, confirmationCode } = req.body;

	if (email) {
		searchField = { name: "email", value: email };
	} else if (confirmationCode) {
		searchField = {
			name: "confirmationCode",
			value: confirmationCode,
		};
	}

	try {
		const user = await User.findOne({ [searchField.name]: searchField.value });

		if (!user) {
			return res.status(404).json({ message: "User Not found." });
		}

		if (user.status === "Active") {
			return res.status(304).json({ message: "User already verified." });
		}

		const token = jwt.sign({ email: user.email }, process.env.SECRET, {
			expiresIn: "1h",
		});

		await User.updateOne({ _id: user._id }, { confirmationCode: token }).then(
			(result) => {
				if (result.modifiedCount === 0) {
					return res.status(304).json({ message: "No changes made." });
				}
			},
		);

		sendConfirmationEmail(user.firstname, user.email, token);

		return res.status(200).json("Success");
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: err.message });
	}
};

const verifyUser = async (req, res) => {
	const confirmationCode = req.params.confirmationCode;
	jwt.verify(confirmationCode, process.env.SECRET, async (err) => {
		if (err) {
			if (err.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Confirmation Code Expired!" });
			}
			return res.status(500).json({ message: err.name });
		}
		await User.updateOne(
			{ confirmationCode },
			{ $set: { status: "Active" }, $unset: { confirmationCode } },
		)
			.then((result) => {
				if (result.matchedCount === 0) {
					return res.status(404).json({ message: "User Not found." });
				}

				if (result.modifiedCount > 0) {
					return res.status(204).json("Success");
				}

				return res.status(304).json({ message: "No changes made." });
			})
			.catch((err) => {
				console.log(err);
				return res.status(500).json({ message: err.message });
			});
	});
};

const checkEmailVerification = async (req, res) => {
	const email = req.params.email;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User Not found." });
		}
		return res.status(200).json({ user });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: err.message });
	}
};

module.exports = {
	login,
	logout,
	resendVerificationEmail,
	verifyUser,
	checkEmailVerification,
};
