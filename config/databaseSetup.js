const mongoose = require("mongoose");

const DB_URL = process.env.MONGO_URL;

const connection = async () => {
	try {
		await mongoose.connect(DB_URL, { dbName: "easyrent" });
		console.log("Database is connected");
	} catch (error) {
		console.log(error);
	}
};

module.exports = connection;
