const Transaction = require("../models/TransactionSchema");
const Contract = require("../models/ContractSchema");
const Application = require("../models/ApplicationSchema");
const Property = require("../models/PropertySchema");
const User = require("../models/UserSchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getAllTransactions = async (req, res) => {
	try {
		const transactions = await Transaction.find()
			.populate("user", "firstname lastname email")
			.populate({
				path: "property",
				select: "name address price depositAmount rooms",
				populate: {
					path: "rooms",
					match: { _id: "$roomId" },
				},
			})
			.sort({ createdAt: -1 });

		const formattedTransactions = transactions.map((transaction) => {
			const room = transaction.property.rooms.find(
				(r) => r._id.toString() === transaction.roomId.toString(),
			);
			return {
				...transaction.toObject(),
				roomName: room ? room.name : null,
				roomPrice: room ? room.price : null,
				roomDepositAmount: room ? room.depositAmount : null,
			};
		});

		res.status(200).json({ transactions: formattedTransactions });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const createPaymentIntent = async (req, res) => {
	const { amount, contractId } = req.body;
	try {
		// Find the existing transaction
		let transaction = await Transaction.findOne({
			contract: contractId,
			type: "Deposit",
			status: "Pending",
		});

		if (!transaction) {
			return res.status(404).json({ error: "Transaction not found" });
		}

		// If the transaction already has a payment intent, return it
		if (transaction.paymentIntentId) {
			const existingPaymentIntent = await stripe.paymentIntents.retrieve(
				transaction.paymentIntentId,
			);
			return res
				.status(200)
				.json({ clientSecret: existingPaymentIntent.client_secret });
		}

		// Create a new payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to sen and ensure it's an integer
			currency: "myr",
			metadata: { contractId },
		});

		// Update the transaction with the new payment intent ID
		transaction = await Transaction.findByIdAndUpdate(
			transaction._id,
			{ paymentIntentId: paymentIntent.id },
			{ new: true },
		);

		res.status(200).json({ clientSecret: paymentIntent.client_secret });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const processDeposit = async (req, res) => {
	const { paymentIntentId, contractId } = req.body;

	try {
		// Retrieve the PaymentIntent to get payment details
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status !== "succeeded") {
			return res.status(400).json({ error: "Payment was not successful" });
		}

		// Find the contract and update it
		const contract = await Contract.findByIdAndUpdate(
			contractId,
			{ isActive: true },
			{ new: true },
		);

		if (!contract) {
			return res.status(404).json({ error: "Contract not found" });
		}

		// Find the deposit transaction and update it
		const depositTransaction = await Transaction.findOneAndUpdate(
			{
				contract: contractId,
				type: "Deposit",
				status: "Pending",
				paymentIntentId: paymentIntentId,
			},
			{
				status: "Paid",
				paymentDate: new Date(),
			},
			{ new: true },
		);

		if (!depositTransaction) {
			return res.status(404).json({ error: "Deposit transaction not found" });
		}

		// Update the application status
		const application = await Application.findByIdAndUpdate(
			contract.application,
			{ status: "Completed" },
			{ new: true },
		);

		// Update the property based on whether it's a room or unit rental
		const property = await Property.findById(contract.property);
		if (!property) {
			return res.status(404).json({ error: "Property not found" });
		}

		// Update the user's rentalType
		const user = await User.findByIdAndUpdate(
			contract.user,
			{ rentalType: property.type === "Unit Rental" ? "unit" : "room" },
			{ new: true },
		);

		if (property.type === "Unit Rental") {
			property.currentTenant = contract.user;
			property.isAvailable = false;
		} else if (property.type === "Room Rental") {
			const room = property.rooms.id(application.roomId);
			if (room) {
				room.occupant = contract.user;
				room.isOccupied = true;
			}
		}

		await property.save();

		res.status(200).json({
			success: true,
			contract,
			depositTransaction,
			property,
			application,
			user,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getPaymentIntentStatus = async (req, res) => {
	const { paymentIntentId } = req.params;
	try {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		res.status(200).json({ status: paymentIntent.status });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getTransactionById = async (req, res) => {};
const deleteTransaction = async (req, res) => {};
const updateTransaction = async (req, res, next) => {};

const createTransaction = async (req, res, next) => {};

module.exports = {
	getAllTransactions,
	getTransactionById,
	deleteTransaction,
	updateTransaction,
	createTransaction,
	processDeposit,
	createPaymentIntent,
	getPaymentIntentStatus,
};
