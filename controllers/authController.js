const { sendConfirmationEmail } = require("../config/nodemailerConfig");
const User = require("../models/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const foundUser = await User.findOne({ email });

		if (!foundUser) {
			return res.status(404).json({ message: "User Not found." });
		}

		if (foundUser.status !== "active") {
			return res
				.status(401)
				.json({ message: "Pending Account. Please Verify Your Email." });
		}

		const match = await bcrypt.compare(password, foundUser.password);

		if (!match) return res.status(401).json({ message: "Wrong Password" });

		const accessToken = jwt.sign(
			{
				UserInfo: {
					userId: foundUser._id,
					userType: foundUser.userType,
					userName: `${foundUser.firstname} ${foundUser.lastname}`,
				},
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "15m" },
		);

		const refreshToken = jwt.sign(
			{ userId: foundUser.id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "7d" },
		);

		// Create secure cookie with refresh token
		res.cookie("jwt", refreshToken, {
			httpOnly: true, //accessible only by web server
			secure: false, //change this to true in deployment for https
			sameSite: "Lax", //cross-site cookie
			maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
		});

		// Send accessToken containing username and roles
		res.status(200).json({ accessToken });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const logout = (req, res) => {
	try {
		const cookies = req.cookies;
		console.log(cookies);
		if (!cookies?.jwt) {
			return res.status(204).end();
		}

		res.clearCookie("jwt", {
			httpOnly: true,
			sameSite: "Lax",
			secure: false,
		});

		res.status(200).json({ message: "Cookie Cleared" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
};

const refresh = async (req, res) => {
	const cookies = req.cookies;

	if (!cookies.jwt) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const refreshToken = cookies.jwt;

	try {
		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				if (err) {
					return res.status(403).json({ message: "Forbidden" });
				}
				const foundUser = await User.findById(decoded.userId);
				if (!foundUser) {
					return res.status(404).json({ message: "Unauthorized." });
				}

				const accessToken = jwt.sign(
					{
						UserInfo: {
							userId: foundUser._id,
							userType: foundUser.userType,
							userName: `${foundUser.firstname} ${foundUser.lastname}`,
						},
					},
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "15m" },
				);

				res.status(200).json({ accessToken });
			},
		);
	} catch (err) {
		res.status(500).json({ error: err.message });
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
			{ $set: { status: "active" }, $unset: { confirmationCode } },
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
	refresh,
};
