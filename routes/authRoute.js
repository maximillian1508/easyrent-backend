const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/login").post(authController.login);

router.route("/logout").get(authController.logout);

router.route("/verify-user/:confirmationCode").get(authController.verifyUser);

router
	.route("/resend-verification-email")
	.post(authController.resendVerificationEmail);

router
	.route("/check-email-verification/:email")
	.get(authController.checkEmailVerification);

module.exports = router;
