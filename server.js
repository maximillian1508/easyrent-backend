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
const errorHandler = require("./middleware/errorHandler");

const port = process.env.PORT;
const app = express();

const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use(
	session({
		secret: process.env.SECRET,
		resave: true,
		saveUninitialized: false,
	}),
);

app.use("/auth", authRoute);
app.use("/users", userRoute);

app.use(errorHandler);

app.get("/", (req, res) => {
	res.json("EasyRent API!");
});

dbConnection()
	.then(
		server.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		}),
	)
	.catch((err) => {
		console.log(err);
	});
