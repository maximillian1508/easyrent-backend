const mongoose = require('mongoose');

const DB_URL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}`;

const connection = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('Database is connected');
    } catch (error) {
        console.log(error);
    }
};

module.exports = connection;
