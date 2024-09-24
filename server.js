require("dotenv").config({ path: "./.env.development" });

const express = require("express");
const cors = require("cors");
const http = require("node:http");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const session = require("express-session");
const dbConnection = require("./config/databaseSetup");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const propertyRoute = require("./routes/propertyRoute");
const errorHandler = require("./middleware/errorHandler");
const applicationRoute = require("./routes/applicationRoute");
const contractRoute = require("./routes/contractRoute");
const transactionRoute = require("./routes/transactionRoute");
const complaintRoute = require("./routes/complaintRoute");
const { scheduleCronJobs }  = require("./utils/cronJobs");

const port = process.env.PORT;
const app = express();

const server = http.createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
	}),
);
app.use(helmet());

app.use(
	session({
		secret: process.env.SECRET,
		resave: true,
		saveUninitialized: false,
	}),
);

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/properties", propertyRoute);
app.use("/applications", applicationRoute);
app.use("/contracts", contractRoute);
app.use("/transactions", transactionRoute);
app.use("/complaints", complaintRoute);

app.use(errorHandler);

app.get("/", (req, res) => {
	res.json("EasyRent API!");
});

dbConnection()
	.then(
		server.listen(port, () => {
			console.log(`Server is running on port ${port}`);
			scheduleCronJobs();
		}),
	)
	.catch((err) => {
		console.log(err);
	});
