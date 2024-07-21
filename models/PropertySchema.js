const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Enter the room name."],
	},
	price: {
		type: Number,
		required: [true, "Enter the room price."],
	},
	depositAmount: {
		type: Number,
		required: [true, "Enter the deposit amount."],
	},
	description: {
		type: String,
	},
	isOccupied: {
		type: Boolean,
		default: false,
	},
	occupant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const PropertySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Enter the property name."],
		},
		type: {
			type: String,
			enum: ["Unit Rental", "Room Rental"],
			required: [true, "Please enter a property type"],
		},
		address: {
			type: String,
			required: [true, "Please enter a property address"],
		},
		price: {
			type: Number,
			required: [
				function () {
					return this.type === "Unit Rental";
				},
				"Please enter a price for the property.",
			],
		},
		depositAmount: {
			type: Number,
			required: [
				function () {
					return this.type === "Unit Rental";
				},
				"Please enter a deposit amount for the property.",
			],
		},
		description: {
			type: String,
			required: [true, "Please enter a property description"],
		},
		rooms: [RoomSchema],
		images: [String],
		isAvailable: {
			type: Boolean,
			default: true,
		},
		currentTenant: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

// Virtual for total rooms
PropertySchema.virtual("totalRooms").get(function () {
	return this.rooms.length;
});

// Virtual for available rooms
PropertySchema.virtual("availableRooms").get(function () {
	return this.rooms.filter((room) => !room.isOccupied).length;
});

// Method to check if the property is fully occupied
PropertySchema.methods.isFullyOccupied = function () {
	if (this.type === "Unit Rental") {
		return !this.isAvailable;
	} else {
		return this.availableRooms === 0;
	}
};

module.exports = mongoose.model("Property", PropertySchema);
