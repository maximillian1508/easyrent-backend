const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please choose a user!'],
        },
        type: {
            type: String,
            required: [true, 'Please choose a notification type'],
            enum: ['Payment', 'Application', 'Confirmation'],
        },
        title: {
            type: String,
            required: [true, 'Please enter the notification title!'],
        },
        description: {
            type: String,
            required: [true, 'Please enter the notification description!'],
        },
        date: {
            type: Date,
            required: [true, 'Please enter a date!'],
        },
    },
);

module.exports = mongoose.model('Notification', NotificationSchema);
