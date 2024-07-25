const Contract = require("../models/ContractSchema");
const cloudinary = require("../config/cloudinary");
const fs = require("node:fs");

const getAllContracts = async (req, res) => {
	try {
		const contracts = await Contract.find()
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

		const formattedContracts = contracts.map((contract) => {
			const room = contract.property.rooms.find(
				(r) => r._id.toString() === contract.roomId.toString(),
			);
			return {
				...contract.toObject(),
				roomName: room ? room.name : null,
				roomPrice: room ? room.price : null,
				roomDepositAmount: room ? room.depositAmount : null,
			};
		});

		res.status(200).json({ contracts: formattedContracts });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getContractById = async (req, res) => {};
const deleteContract = async (req, res) => {};
const updateContract = async (req, res, next) => {};

const uploadSignedContract = async (req, res) => {
	try {
		const { id } = req.params; // Contract ID

		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: "signed_contracts",
		});

		// Remove the file from local storage
		fs.unlinkSync(req.file.path);

		// Update the contract with the new file URL
		const updatedContract = await Contract.findByIdAndUpdate(
			id,
			{ contractFile: result.secure_url },
			{ new: true },
		);

		if (!updatedContract) {
			return res.status(404).json({ error: "Contract not found" });
		}

		res
			.status(200)
			.json({ fileUrl: result.secure_url, contract: updatedContract });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

module.exports = {
	getAllContracts,
	getContractById,
	deleteContract,
	updateContract,
	uploadSignedContract,
};
