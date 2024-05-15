const { sendConfirmationEmail } = require('../config/nodemailerConfig');

const login = async (req, res) => {
    try {
        sendConfirmationEmail();
        res.status(400).json({ message: 'Successfull' });
    } catch (err) {
        res.json({ error: err.message });
    }
};

const logout = async (req, res) => {
    try {
        sendConfirmationEmail();
        res.status(400).json({ message: 'Successfull' });
    } catch (err) {
        res.json({ error: err.message });
    }
};

const register = async (req, res) => {
    try {
        sendConfirmationEmail();
        res.status(400).json({ message: 'Successfull' });
    } catch (err) {
        res.json({ error: err.message });
    }
};

module.exports = { login, logout, register };
