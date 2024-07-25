const express = require("express");
const applicationController = require("../controllers/applicationController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router
	.route("/")
	.get(verifyJWT, applicationController.getAllApplications)
	.post(verifyJWT, applicationController.createApplication);

router
	.route("/:id")
	.get(verifyJWT, applicationController.getApplicationById)
	.patch(verifyJWT, applicationController.updateApplication)
	.delete(verifyJWT, applicationController.deleteApplication);

router
	.route("/user-rental-status/:userId")
	.get(applicationController.checkUserRentalStatus);

module.exports = router;
