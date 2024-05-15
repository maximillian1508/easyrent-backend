const mongoose = require('mongoose');

const PropertySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Enter the property name.'],
        },
        type: {
            type: String,
            enum: ['House Unit', 'Apartment Unit', 'Room'],
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
            required: [true, 'Please enter a property price'],
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
