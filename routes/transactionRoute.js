const express = require("express");
const transactionController = require("../controllers/transactionController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router.route("/").get(verifyJWT, transactionController.getAllTransactions);

router
	.route("/:id")
	.get(verifyJWT, transactionController.getTransactionById)
	.patch(verifyJWT, transactionController.updateTransaction)
	.delete(verifyJWT, transactionController.deleteTransaction);

router.post(
	"/create-payment-intent",
	verifyJWT,
	transactionController.createPaymentIntent,
);
router.post(
	"/process-deposit",
	verifyJWT,
	transactionController.processDeposit,
);
router.get(
	"/payment-intent-status/:paymentIntentId",
	transactionController.getPaymentIntentStatus,
);

module.exports = router;
