const mongoose = require('mongoose');

const ComplaintSchema = mongoose.Schema(
    {
        renter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Enter a renter.'],
        },
        handler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Enter a handler.'],
        },
        title: {
            type: String,
            required: [true, 'Enter a complaint title.'],
        },
        description: {
            type: String,
            required: [true, 'Enter a complaint description.'],
        },
        status: {
            type: String,
            enum: ['Waiting for Response', 'In Handling', 'Handled'],
            default: 'Waiting for Response',
            required: [true, "Please enter the complaint's status"],
        },
        date: {
            type: Date,
            required: [true, 'Please enter a date!'],
        },
    },
);

module.exports = mongoose.model('Complaint', ComplaintSchema);
