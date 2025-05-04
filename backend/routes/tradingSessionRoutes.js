const express = require("express");
const StockController = require("../controllers/stockController");

const router = express.Router();

// Route to fetch and store trading session data
router.get("/fetch-session", StockController.fetchAndStoreTradingSession);

module.exports = router;