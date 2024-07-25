const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Enter a user!"],
		},
		property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property",
			required: [true, "Enter a property!"],
		},
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		application: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Application",
		},
		contract: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Contract",
		},
		type: {
			type: String,
			enum: ["Monthly Rental", "Deposit", "Other Fees"],
			required: [true, "Please enter the transaction type"],
		},
		amount: {
			type: Number,
			required: [true, "Please enter the amount of the transaction!"],
		},
		status: {
			type: String,
			enum: ["Pending", "Paid", "Overdue", "Cancelled"],
			default: "Pending",
			required: [true, "Please provide the status of the transaction!"],
		},
		dueDate: {
			type: Date,
			required: [true, "Please provide the due date of the transaction"],
		},
		paymentDate: {
			type: Date,
		},
		paymentIntentId: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

// Virtual property to check if the transaction is overdue
TransactionSchema.virtual("isOverdue").get(function () {
	return this.status === "Pending" && this.dueDate < new Date();
});

// Pre-save hook to update status to "Overdue" if applicable
TransactionSchema.pre("save", function (next) {
	if (this.isOverdue) {
		this.status = "Overdue";
	}
	next();
});

module.exports = mongoose.model("Transaction", TransactionSchema);
