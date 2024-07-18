//const { logEvents } = require("./logger");

const handleValidationError = (err) => {
	const errors = [];
	const errorFields = {};

	for (const key of Object.keys(err.errors)) {
		const error = err.errors[key];
		const errorObj = { field: key, message: error.message };
		errors.push(errorObj);
		errorFields[key] = error.message;
	}

	return { errors, errorFields };
};

const handleDuplicateKeyError = (err) => {
	const field = Object.keys(err.keyValue)[0];
	const error = `An account with that ${field} already exists.`;
	return {
		errors: [{ field, message: error }],
		errorFields: { [field]: error },
	};
};

const errorHandler = (err, req, res, next) => {
	/*
	logEvents(
		`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
		"errLog.log",
	);*/
	console.log(err.stack);

	let status = res.statusCode ? res.statusCode : 500; // server error
	let errorResponse = { message: err.message, isError: true };

	try {
		if (err.name === "ValidationError") {
			status = 400;
			const validationErrors = handleValidationError(err);
			errorResponse = {
				...errorResponse,
				message: "Validation failed",
				...validationErrors,
			};
		} else if (err.code && err.code === 11000) {
			status = 409;
			const duplicateErrors = handleDuplicateKeyError(err);
			errorResponse = {
				...errorResponse,
				message: "Duplicate key error",
				...duplicateErrors,
			};
		}
	} catch (error) {
		status = 500;
		errorResponse.message = "An unknown error occurred.";
	}

	res.status(status).json(errorResponse);
};

module.exports = errorHandler;
