const cron = require("node-cron");
const Contract = require("../models/ContractSchema");
const Transaction = require("../models/TransactionSchema");
const { sendPaymentReminder } = require("../config/nodemailerConfig");

// Function to generate monthly payments and send notifications
const generateMonthlyPayments = async () => {
	try {
		const activeContracts = await Contract.find({
			isActive: true,
			endDate: { $gt: new Date() },
		}).populate("user property");

		const emailPromises = activeContracts.map(async (contract) => {
			const dueDate = new Date(new Date().setDate(new Date().getDate() + 5));

			// Create a new transaction
			const newTransaction = new Transaction({
				user: contract.user._id,
				property: contract.property._id,
				roomId: contract.roomId,
				contract: contract._id,
				type: "Monthly Rental",
				amount: contract.rentAmount,
				status: "Pending",
				dueDate: dueDate,
			});

			await newTransaction.save();

			// Send email notification
			try {
				await sendPaymentReminder(
					contract.user.firstname,
					contract.user.email,
					contract.rentAmount,
					dueDate,
				);
				console.log(`Reminder email sent to ${contract.user.email}`);
			} catch (emailError) {
				console.error(
					`Error sending email to ${contract.user.email}:`,
					emailError,
				);
				// We're not rethrowing the error, so it won't affect other emails
			}
		});

		// Wait for all email sending operations to complete
		await Promise.allSettled(emailPromises);

		console.log("Monthly payments generated and notifications sent.");
	} catch (error) {
		console.error("Error generating monthly payments:", error);
	}
};

// Function to update contract statuses
const updateContractStatuses = async () => {
	try {
		const expiredContracts = await Contract.updateMany(
			{
				isActive: true,
				endDate: { $lte: new Date() },
			},
			{
				$set: { isActive: false },
			},
		);

		console.log(`${expiredContracts.modifiedCount} contracts deactivated.`);
	} catch (error) {
		console.error("Error updating contract statuses:", error);
	}
};

// Schedule the cron jobs
const scheduleCronJobs = () => {
	// Run at 12:00 AM on the first day of every month
	cron.schedule("0 0 1 * *", () => {
		console.log("Running monthly payment and contract update tasks");
		updateContractStatuses();
		generateMonthlyPayments();
	});
};

module.exports = {
	scheduleCronJobs,
	generateMonthlyPayments,
	updateContractStatuses,
};
