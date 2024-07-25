const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	type: {
		type: String,
		required: [true, "Please choose a notification type"],
		enum: ["Payment", "Application", "Confirmation", "Complaint", "System"],
	},
	title: {
		type: String,
		required: [true, "Please enter the notification title!"],
	},
	description: {
		type: String,
		required: [true, "Please enter the notification description!"],
	},
	date: {
		type: Date,
		required: [true, "Please enter a date!"],
	},
	isGlobal: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model("Notification", NotificationSchema);
