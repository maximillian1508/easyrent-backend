const express = require("express");
const contractController = require("../controllers/contractController");
const verifyJWT = require("../middleware/verifyJWT");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.route("/").get(verifyJWT, contractController.getAllContracts);

router
	.route("/:id")
	.get(verifyJWT, contractController.getContractById)
	.patch(verifyJWT, contractController.updateContract)
	.delete(verifyJWT, contractController.deleteContract);

router.post(
	"/upload-signed-contract/:id",
	verifyJWT,
	upload.single("signedContract"),
	contractController.uploadSignedContract,
);

module.exports = router;
