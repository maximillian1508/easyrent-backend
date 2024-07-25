const mongoose = require("mongoose");

const ComplaintSchema = mongoose.Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Enter a customer."],
		},
		admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property",
			required: [true, "Enter a property."],
		},
		title: {
			type: String,
			required: [true, "Enter a complaint title."],
		},
		description: {
			type: String,
			required: [true, "Enter a complaint description."],
		},
		status: {
			type: String,
			enum: ["Waiting for Response", "In Handling", "Handled"],
			default: "Waiting for Response",
			required: [true, "Please enter the complaint's status"],
		},
		resolutionDetails: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
