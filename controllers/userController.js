const jwt = require("jsonwebtoken");
const { sendConfirmationEmail } = require("../config/nodemailerConfig");
const User = require("../models/UserSchema");
const { capitalizeFirstLetter } = require("../utils/helper");

const createUser = async (req, res, next) => {
	const {
		firstname,
		lastname,
		email,
		phone,
		password,
		confirmPassword,
		userType,
		status,
	} = req.body;

	try {
		const token = jwt.sign({ email }, process.env.SECRET, {
			expiresIn: "1h",
		});

		const newUser = await User.create({
			firstname: capitalizeFirstLetter(firstname),
			lastname: capitalizeFirstLetter(lastname),
			email,
			phone,
			password,
			confirmPassword,
			userType,
			status,
			confirmationCode: token,
		});

		if (userType === "customer" && status === "pending") {
			sendConfirmationEmail(
				newUser.firstname,
				newUser.email,
				newUser.confirmationCode,
			);
		}

		res
			.status(201)
			.json({ message: "Account Successfully Created!", data: { newUser } });
	} catch (err) {
		next(err);
	}
};

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json({ users });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const updateUser = async (req, res, next) => {
	console.log(req.params);
	const { id } = req.params;
	const { firstname, lastname, email, phone, password, userType } = req.body;

	try {
		const user = await User.findOne({ _id: id });

		user.firstname = capitalizeFirstLetter(firstname);
		user.lastname = capitalizeFirstLetter(lastname);
		user.email = email;
		user.phone = phone;
		user.userType = userType;

		if (password && password.length >= 5) {
			user.password = password;
			user.$ignore("confirmPassword");
			// The pre-save middleware will hash the password
		} else {
			// If no new password is provided, tell Mongoose to ignore password fields
			user.$ignore("password");
			user.$ignore("confirmPassword");
		}

		const updatedUser = await user.save({ validateBeforeSave: true });
		res.status(200).json({ message: "Success", updatedUser: updatedUser });
	} catch (error) {
		next(error);
	}
};

const deleteUser = async (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ message: "User ID Required" });
	}

	try {
		// Does the user exist to delete?
		const user = await User.findById(id).exec();

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		await user.deleteOne();
		res.status(204).json({ message: "User deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		res.status(200).json({ user });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

module.exports = {
	createUser,
	getAllUsers,
	updateUser,
	deleteUser,
	getUserById,
};
