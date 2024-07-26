const express = require("express");
const complaintController = require("../controllers/complaintController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router
	.route("/")
	.get(verifyJWT, complaintController.getAllComplaints)
	.post(complaintController.createComplaint);

router
	.route("/:id")
	.get(verifyJWT, complaintController.getComplaintById)
	.patch(verifyJWT, complaintController.updateComplaint)
	.delete(verifyJWT, complaintController.deleteComplaint);

module.exports = router;
