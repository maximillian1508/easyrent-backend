const mongoose = require("mongoose");

const ContractSchema = mongoose.Schema(
	{
		application: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Application",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property",
			required: true,
		},
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		rentAmount: {
			type: Number,
			required: true,
		},
		depositAmount: {
			type: Number,
			required: true,
		},
		contractFile: {
			type: String, // URL or path to the uploaded contract file
		},
		isActive: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Contract", ContractSchema);
