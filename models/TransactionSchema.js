const mongoose = require('mongoose');

const TransactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Enter a user!'],
        },
        type: {
            type: String,
            enum: ['Monthly Rental', 'Deposit'],
            required: [true, 'Please enter the transaction type'],
        },
        description: {
            type: String,
            required: [true, 'Please enter the transaction description'],
        },
        amount: {
            type: Number,
            required: [true, 'Please enter the amount of the transaction!'],
        },
        status: {
            type: String,
            enum: ['Waiting for Payment, Paid'],
            required: [true, 'Please provide the status of the transaction!'],
        },
        date: {
            type: Date,
            required: [true, 'Please provide the date of the transaction'],
        },
    },
);

module.exports = mongoose.model('Transaction', TransactionSchema);
