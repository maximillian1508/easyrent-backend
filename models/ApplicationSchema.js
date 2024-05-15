const mongoose = require('mongoose');

const ApplicationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Enter a user.'],
        },
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: [true, 'Enter a property.'],
        },
        status: {
            type: String,
            enum: ['Waiting for Response', 'Accepted', 'Denied'],
            default: 'Waiting for Response',
        },
        date: {
            type: Date,
            rqeuired: [true, 'Please enter date of application'],
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Application', ApplicationSchema);
