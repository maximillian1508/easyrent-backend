const express = require("express");
const propertyController = require("../controllers/propertyController");
const verifyJWT = require("../middleware/verifyJWT");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router
	.route("/")
	.get(propertyController.getAllProperties)
	.post(
		verifyJWT,
		upload.array("images", 5),
		propertyController.createProperty,
	);

router.route("/featured").get(propertyController.getFeaturedProperties);

router
	.route("/:id")
	.get(propertyController.getPropertyById)
	.patch(propertyController.updateProperty)
	.delete(propertyController.deleteProperty);

module.exports = router;
