const mongoose = require('mongoose');

const PropertySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Enter the property name.'],
        },
        type: {
            type: String,
            enum: ['Unit Rental', 'Room Rental'],
            required: [true, 'Please enter a property type'],
        },
        address: {
            type: String,
            required: [true, 'Please enter a property address'],
        },
        renter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        price: {
            type: Number,
        },
        description: {
            type: String,
            required: [true, 'Please enter a property description'],
        },
        rooms: {
            type: Array,
        },
        image: {
            type: Array,
        },
    },
);

module.exports = mongoose.model('Property', PropertySchema);
