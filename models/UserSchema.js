const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: [true, 'Enter a First name.'],
        },
        lastname: {
            type: String,
            required: [true, 'Enter a Last name.'],
        },
        email: {
            type: String,
            required: [true, 'Enter an Email address.'],
            unique: true,
            // match: [/@(ifrc)\.[a-zA-Z0-9_.+-]/, "Please use ifrc email"],
        },
        phone: {
            type: Number,
            required: [true, 'Enter a Phone number.'],
            unique: [true, 'Phone number is taken.'],
        },
        password: {
            type: String,
            required: [true, 'Enter a Password.'],
            minLength: [5, 'Password should be at least 5 characters.'],
        },
        confirm_password: {
            type: String,
            required: [true, 'Retype your password.'],
            validate: {
                validator(el) {
                    return el === this.password;
                },
                message: "Passwords don't match. ",
            },
        },
        user_type: {
            type: String,
            required: [true, 'Enter a user type'],
            enum: ['customer, staff, admin'],
            default: 'customer',
        },
        status: {
            type: String,
            enum: ['Pending', 'Active'],
            default: 'Pending',
        },
        confirmation_code: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmpassword = undefined;
    next();
});

module.exports = mongoose.model('User', userSchema);
