const Property = require("../models/PropertySchema");
const { capitalizeFirstLetter } = require("../utils/helper");
const cloudinary = require("../config/cloudinary");

const createProperty = async (req, res, next) => {
	const { name, type, address, description, rooms, price, depositAmount } =
		req.body;

	try {
		// Handle image uploads
		let imageUrls = [];
		if (req.files && req.files.length > 0) {
			const uploadPromises = req.files.map((file) =>
				cloudinary.uploader.upload(file.path, { folder: "property_images" }),
			);
			const uploadResults = await Promise.all(uploadPromises);
			imageUrls = uploadResults.map((result) => result.secure_url);
		}

		// Prepare the property object
		// biome-ignore lint/style/useConst: <explanation>
		let propertyData = {
			name: capitalizeFirstLetter(name),
			type,
			address,
			description,
			images: imageUrls,
		};

		// Add type-specific fields
		if (type === "Unit Rental") {
			propertyData.price = price;
			propertyData.depositAmount = depositAmount;
		} else if (type === "Room Rental") {
			let parsedRooms;
			try {
				parsedRooms = JSON.parse(rooms);
			} catch (error) {
				return res.status(400).json({ message: "Invalid rooms data" });
			}

			if (!Array.isArray(parsedRooms) || parsedRooms.length === 0) {
				return res
					.status(400)
					.json({ message: "At least one room is required for Room Rental" });
			}

			propertyData.rooms = parsedRooms.map((room) => ({
				name: room.name,
				price: room.price,
				depositAmount: room.depositAmount,
				description: room.description,
			}));
		}

		// Create the new property
		const newProperty = await Property.create(propertyData);

		res.status(201).json({
			message: "Property Successfully Created!",
			data: { newProperty },
		});
	} catch (err) {
		next(err);
	}
};

const getAllProperties = async (req, res) => {
	try {
		const properties = await Property.find();
		res.status(200).json({ properties });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getFeaturedProperties = async (req, res) => {
	try {
		console.log("getting properties");
		/*
		const properties = await Property.find({
			isAvailable: true,
		}).limit(9);
		*/
		const properties = await Property.aggregate([
			{ $match: { isAvailable: true } },
			{ $limit: 9 },
			{
				$addFields: {
					priceRange: {
						$cond: {
							if: { $eq: ["$type", "Room Rental"] },
							then: {
								$concat: [
									{ $toString: { $min: "$rooms.price" } },
									" - ",
									{ $toString: { $max: "$rooms.price" } },
								],
							},
							else: null,
						},
					},
				},
			},
		]);
		console.log(`props: ${properties}`);
		return res.status(200).json({ properties });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const updateProperty = async (req, res, next) => {};

const deleteProperty = async (req, res) => {};

const getPropertyById = async (req, res) => {};

module.exports = {
	createProperty,
	getAllProperties,
	updateProperty,
	deleteProperty,
	getPropertyById,
	getFeaturedProperties,
};
