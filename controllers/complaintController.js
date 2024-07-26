const Complaint = require("../models/ComplaintSchema");
const Contract = require("../models/ContractSchema");

const createComplaint = async (req, res, next) => {
	const { customer, title, description } = req.body;

	try {
		const contract = await Contract.findOne({
			user: customer,
			isActive: true,
			endDate: { $gt: new Date() },
		});
		if (!contract) {
			return res
				.status(404)
				.json({ message: "Contract not found for this customer" });
		}
		const complaintData = {
			customer,
			title,
			description,
			property: contract.property,
		};

		const newComplaint = await Complaint.create(complaintData);

		res.status(201).json({
			message: "Complaint Successfully Created!",
			data: { newComplaint },
		});
	} catch (err) {
		next(err);
	}
};
const getAllComplaints = async (req, res) => {
	try {
		const complaints = await Complaint.find()
			.populate("customer", "firstname lastname email")
			.populate("property", "name")
			.populate("admin", "firstname lastname email")
			.sort({ createdAt: -1 });

		res.status(200).json({ complaints });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const getComplaintById = async (req, res) => {};
const updateComplaint = async (req, res, next) => {
	const { id } = req.params;
	const { title, description, admin, status, resolutionDetails } = req.body;
	try {
		const complaint = await Complaint.findById(id);
		if (!complaint) {
			return res.status(404).json({ message: "Complaint not found" });
		}

		if (admin) {
			complaint.admin = admin;
			if (status === "In Handling") {
				complaint.status = "In Handling";
			} else if (status === "Handled") {
				complaint.status = "Handled";
				complaint.resolutionDetails = resolutionDetails;
			}
		} else {
			complaint.title = title;
			complaint.description = description;
		}
		await complaint.save();
		res.status(200).json({ message: "Complaint updated" });
	} catch (err) {
		next(err);
	}
};

const deleteComplaint = async (req, res) => {
	const { id } = req.params;
	try {
		const complaint = await Complaint.findById(id);
		if (!complaint) {
			return res.status(404).json({ message: "Complaint not found" });
		}
		await complaint.deleteOne();
		res.status(204).json({ message: "Complaint deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = {
	createComplaint,
	getAllComplaints,
	getComplaintById,
	updateComplaint,
	deleteComplaint,
};
