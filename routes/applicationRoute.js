const express = require("express");
const applicationController = require("../controllers/applicationController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router
	.route("/user-rental-status/:userId")
	.get(applicationController.checkUserRentalStatus);

router
	.route("/active-application")
	.get(applicationController.checkActiveApplication);

router
	.route("/")
	.get(verifyJWT, applicationController.getAllApplications)
	.post(verifyJWT, applicationController.createApplication);

router
	.route("/:id")
	.get(verifyJWT, applicationController.getApplicationById)
	.patch(verifyJWT, applicationController.updateApplication)
	.delete(verifyJWT, applicationController.deleteApplication);

module.exports = router;
