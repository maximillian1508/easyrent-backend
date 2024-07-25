const mongoose = require("mongoose");

const ApplicationSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Enter a user."],
		},
		property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property",
			required: [true, "Enter a property."],
		},
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		status: {
			type: String,
			enum: [
				"Waiting for Response",
				"Accepted",
				"Rejected",
				"Completed",
				"Cancelled",
			],
			default: "Waiting for Response",
		},
		startDate: {
			type: Date,
			required: [true, "Please enter start date."],
		},
		stayLength: {
			type: Number,
			enum: [3, 4, 6, 8, 12],
			required: [true, "Please select length of stay in months"],
		},
		endDate: {
			type: Date,
		},
		contract: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Contract",
		},
		depositTransaction: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Transaction",
		},
	},
	{
		timestamps: true,
	},
);

// Pre-save middleware to calculate checkOutDate
ApplicationSchema.pre("save", function (next) {
	if (this.startDate && this.stayLength) {
		const end = new Date(this.startDate);
		end.setMonth(end.getMonth() + this.stayLength);

		// Adjust for months with fewer days
		if (end.getDate() !== this.startDate.getDate()) {
			end.setDate(0); // Set to the last day of the previous month
		}

		this.endDate = end;
	}
	next();
});

module.exports = mongoose.model("Application", ApplicationSchema);
