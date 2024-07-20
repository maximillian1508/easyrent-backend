const express = require("express");
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router
	.route("/")
	.get(verifyJWT, userController.getAllUsers)
	.post(userController.createUser);

router
	.route("/:id")
	.get(verifyJWT, userController.getUserById)
	.patch(verifyJWT, userController.updateUser)
	.delete(verifyJWT, userController.deleteUser);

module.exports = router;
