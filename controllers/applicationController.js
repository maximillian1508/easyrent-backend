const Application = require("../models/ApplicationSchema");
const Contract = require("../models/ContractSchema");
const Transaction = require("../models/TransactionSchema");
const Property = require("../models/PropertySchema");
const cloudinary = require("../config/cloudinary");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const {
	sendAcceptanceEmail,
	sendRejectionEmail,
} = require("../config/nodemailerConfig");
const fs = require("node:fs");

const createApplication = async (req, res, next) => {
	const { user, property, room, startDate, stayLength } = req.body;
	try {
		const applicationData = {
			user,
			property,
			startDate,
			stayLength,
		};

		// Only add room if it's provided and not an empty string
		if (room && room.trim() !== "") {
			applicationData.roomId = room;
		}

		const newApplication = await Application.create(applicationData);
		res.status(201).json({
			message: "Application Successfully Created!",
			data: { newApplication },
		});
	} catch (err) {
		next(err);
	}
};

const getAllApplications = async (req, res) => {
	try {
		const applications = await Application.find()
			.populate("user", "firstname lastname email")
			.populate({
				path: "property",
				select: "name address price depositAmount rooms",
				populate: {
					path: "rooms",
				},
			})
			.sort({ createdAt: -1 });

		const formattedApplications = applications.map((app) => {
			if (!app.property || !app.property.rooms) {
				return {
					...app.toObject(),
					roomName: null,
					roomPrice: null,
					roomDepositAmount: null,
				};
			}

			const room = app.roomId ? app.property.rooms.find(
				(r) => r._id.toString() === app.roomId.toString(),
			) : null;
			
			return {
				...app.toObject(),
				roomName: room ? room.name : null,
				roomPrice: room ? room.price : null,
				roomDepositAmount: room ? room.depositAmount : null,
			};
		});

		res.status(200).json({ applications: formattedApplications });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getApplicationById = async (req, res) => {};
const deleteApplication = async (req, res) => {};

const updateApplication = async (req, res, next) => {
	const { id } = req.params;
	const { status } = req.body;

	try {
		const application = await Application.findById(id);
		if (!application) {
			return res.status(404).json({ message: "Application not found" });
		}

		if (status === "Accepted") {
			await acceptApplication(application);
		} else if (status === "Rejected") {
			await rejectApplication(application);
		} else {
			application.status = status;
			await application.save();
		}

		res
			.status(200)
			.json({ message: "Application updated successfully", application });
	} catch (err) {
		next(err);
	}
};

const acceptApplication = async (application) => {
	// Update the current application
	application.status = "Accepted";
	await application.save();

	// Reject other applications for the same room/property with "Waiting for Response" status
	await Application.updateMany(
		{
			_id: { $ne: application._id },
			$or: [
				{ roomId: application.roomId },
				{ property: application.property, roomId: { $exists: false } },
			],
			status: "Waiting for Response",
		},
		{ status: "Rejected" },
	);

	// Reject other applications from the same user with "Waiting for Response" status
	await Application.updateMany(
		{
			_id: { $ne: application._id },
			user: application.user,
			status: "Waiting for Response",
		},
		{ status: "Rejected" },
	);

	// Fetch the full application data with populated fields
	const populatedApplication = await Application.findById(application._id)
		.populate("user", "firstname lastname email")
		.populate({
			path: "property",
			select: "name address price depositAmount rooms",
			populate: {
				path: "rooms",
				match: { _id: application.roomId },
			},
		});

	// Determine if it's a room rental or unit rental
	const isRoomRental =
		populatedApplication.roomId &&
		populatedApplication.property.rooms.length > 0;

	// Set the appropriate rent and deposit amounts
	let rentAmount;
	let depositAmount;
	let roomName;
	if (isRoomRental) {
		const room = populatedApplication.property.rooms.find(
			(room) => room._id.toString() === populatedApplication.roomId.toString(),
		);
		if (!room) {
			throw new Error("Room not found in the property");
		}
		rentAmount = room.price;
		depositAmount = room.depositAmount;
		roomName = room.name;
	} else {
		rentAmount = populatedApplication.property.price;
		depositAmount = populatedApplication.property.depositAmount;
	}

	const pdfUrl = await createAndUploadRentalAgreement({
		agreementDate: new Date().toLocaleDateString(),
		tenantName: `${populatedApplication.user.firstname} ${populatedApplication.user.lastname}`,
		propertyAddress: populatedApplication.property.address,
		propertyName: populatedApplication.property.name,
		leaseTerm: `${populatedApplication.stayLength} months`,
		leaseStart: populatedApplication.startDate.toLocaleDateString(),
		leaseEnd: populatedApplication.endDate.toLocaleDateString(),
		monthlyRent: `RM${rentAmount}`,
		depositAmount: `RM${depositAmount}`,
		isRoomRental: isRoomRental,
		roomName: isRoomRental ? roomName : null,
	});

	// Create a new contract
	const contractData = {
		application: populatedApplication._id,
		user: populatedApplication.user._id,
		property: populatedApplication.property._id,
		startDate: populatedApplication.startDate,
		endDate: populatedApplication.endDate,
		rentAmount: rentAmount,
		depositAmount: depositAmount,
		contractFile: pdfUrl,
	};

	// Only add roomId if it's a room rental
	if (isRoomRental) {
		contractData.roomId = populatedApplication.roomId;
	}

	const contract = new Contract(contractData);
	await contract.save();

	const depositTransaction = new Transaction({
		user: populatedApplication.user._id,
		property: populatedApplication.property._id,
		roomId: isRoomRental ? populatedApplication.roomId : undefined,
		application: populatedApplication._id,
		contract: contract._id,
		type: "Deposit",
		amount: depositAmount,
		status: "Pending",
		dueDate: new Date(populatedApplication.startDate), // Due on move-in date
	});
	await depositTransaction.save();

	// Update application with deposit transaction reference
	populatedApplication.depositTransaction = depositTransaction._id;

	// Update the application with the contract reference
	populatedApplication.contract = contract._id;
	await populatedApplication.save();

	sendAcceptanceEmail(
		populatedApplication.user.firstname,
		populatedApplication.user.email,
		populatedApplication.property.name,
		populatedApplication.startDate,
		populatedApplication.endDate,
		rentAmount,
	);
};

const rejectApplication = async (application) => {
	application.status = "Rejected";
	await application.save();

	const populatedApplication = await Application.findById(application._id)
		.populate("user", "firstname email")
		.populate("property", "name");

	// Send rejection email
	sendRejectionEmail(
		populatedApplication.user.firstname,
		populatedApplication.user.email,
		populatedApplication.property.name,
	);
};

async function createAndUploadRentalAgreement(data) {
	const pdfDoc = await PDFDocument.create();
	const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	const timesRomanBoldFont = await pdfDoc.embedFont(
		StandardFonts.TimesRomanBold,
	);

	const page = pdfDoc.addPage();
	const { width, height } = page.getSize();

	const drawText = (text, x, y, size = 12, font = timesRomanFont) => {
		page.drawText(text, { x, y, size, font });
	};

	const drawBoldText = (text, x, y, size = 12) => {
		drawText(text, x, y, size, timesRomanBoldFont);
	};

	// Title
	drawBoldText("RESIDENTIAL LEASE AGREEMENT", 50, height - 50, 18);

	// Agreement intro
	let currentY = height - 80;
	drawText(
		`This Residential Lease Agreement ("Agreement") is made on ${data.agreementDate} between:`,
		50,
		currentY,
	);
	currentY -= 30;
	drawText(`Landlord: Easyrent ("Landlord")`, 50, currentY);
	currentY -= 20;
	drawText(`Tenant: ${data.tenantName} ("Tenant")`, 50, currentY);
	currentY -= 30;

	// Property details
	drawBoldText("1. PROPERTY", 50, currentY);
	currentY -= 20;
	drawText(
		`The Landlord agrees to rent to the Tenant the ${data.isRoomRental ? "room" : "property"} located at:`,
		50,
		currentY,
	);
	currentY -= 20;
	drawText(
		`${data.propertyName}, ${data.propertyAddress} ${data.isRoomRental ? `(${data.roomName})` : ""} ("Premises")`,
		70,
		currentY,
	);
	currentY -= 30;

	// Term
	drawBoldText("2. TERM", 50, currentY);
	currentY -= 20;
	drawText(
		`The term of this Agreement shall be for ${data.leaseTerm}, beginning on ${data.leaseStart} and ending on ${data.leaseEnd}.`,
		50,
		currentY,
	);
	currentY -= 30;

	// Rent
	drawBoldText("3. RENT", 50, currentY);
	currentY -= 20;
	drawText(
		`The Tenant agrees to pay ${data.monthlyRent} per month as rent, payable on the first day of each month.`,
		50,
		currentY,
	);
	currentY -= 30;

	// Security Deposit
	drawBoldText("4. DEPOSIT", 50, currentY);
	currentY -= 20;
	drawText(
		`The Tenant shall pay a deposit of ${data.depositAmount} to be held by the Landlord.`,
		50,
		currentY,
	);
	currentY -= 30;

	// Add more sections as needed...

	// Signatures
	currentY = 100;
	drawText("TENANT:", 300, currentY);
	currentY -= 40;
	drawText("______________________", 300, currentY);
	currentY -= 20;
	drawText("Date: ________________", 300, currentY);

	// Save the PDF to a buffer
	const pdfBytes = await pdfDoc.save();

	// Write the PDF to a temporary file
	const tempFilePath = `/tmp/rental_agreement_${Date.now()}.pdf`;
	fs.writeFileSync(tempFilePath, pdfBytes);

	// Upload to Cloudinary
	const result = await cloudinary.uploader.upload(tempFilePath, {
		folder: "rental_agreements",
		use_filename: true,
		unique_filename: true,
	});

	// Delete the temporary file
	fs.unlinkSync(tempFilePath);

	return result.secure_url;
}

const checkUserRentalStatus = async (req, res) => {
	const userId = req.params.userId;

	try {
		// Check for active contracts
		const activeContract = await Contract.findOne({
			user: userId,
			isActive: true,
		});

		// Check for accepted applications
		const acceptedApplication = await Application.findOne({
			user: userId,
			status: "Accepted",
		});

		const canApply = !activeContract && !acceptedApplication;

		res.json({ canApply });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error checking user status", error: error.message });
	}
};

const checkActiveApplication = async (req, res) => {
	try {
		const { userId, propertyId, roomId } = req.query;

		// First, fetch the property to determine its type
		const property = await Property.findById(propertyId);
		if (!property) {
			return res.status(404).json({ message: "Property not found" });
		}

		let query;
		if (property.type === "Unit Rental") {
			// For unit rentals, check for any active application on the property
			query = {
				user: userId,
				property: propertyId,
				status: "Waiting for Response",
			};
		} else if (property.type === "Room Rental") {
			// For room rentals, check for any active application on the specific room
			if (!roomId) {
				return res
					.status(400)
					.json({ message: "Room ID is required for room rentals" });
			}
			query = {
				user: userId,
				property: propertyId,
				roomId: roomId,
				status: "Waiting for Response",
			};
		} else {
			return res.status(400).json({ message: "Invalid property type" });
		}

		const application = await Application.findOne(query);
		const canApply = !application;

		res.json({ canApply });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error checking user status", error: error.message });
	}
};

module.exports = {
	createApplication,
	getAllApplications,
	getApplicationById,
	updateApplication,
	deleteApplication,
	checkUserRentalStatus,
	checkActiveApplication,
};
