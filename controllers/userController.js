const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../config/nodemailerConfig');
const User = require('../models/UserSchema');
const { capitalizeFirstLetter } = require('../utils/helper');

const createUser = async (req, res, next) => {
    const {
        firstname,
        lastname,
        email,
        phone,
        password,
        confirmPassword,
        userType,
        status,
    } = req.body;

    try {
        const token = jwt.sign({ email }, process.env.SECRET, {
            expiresIn: '1h',
        });

        const newUser = await User.create({
            firstname: capitalizeFirstLetter(firstname),
            lastname: capitalizeFirstLetter(lastname),
            email,
            phone,
            password,
            confirmPassword,
            userType,
            status,
            confirmationCode: token,
        });

        if (userType === 'customer' && status === 'pending') {
            sendConfirmationEmail(newUser.firstname, newUser.email, newUser.confirmationCode);
        }

        res.status(201).json({ message: 'Account Successfully Created!', data: { newUser } });
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async () => {

};

const updateUser = async () => {

};

const deleteUser = async () => {

};

module.exports = {
    createUser, getAllUsers, updateUser, deleteUser,
};
