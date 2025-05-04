const express = require("express");
const StockController = require("../controllers/stockController");

const router = express.Router();

// GET all stocks
router.get("/", StockController.getAllStocks);

// GET stock by ID
router.get("/id/:id", StockController.getStockById);

// GET stock by symbol
router.get("/symbol/:symbol", StockController.getStockBySymbol);

// GET stocks by sector
router.get("/sector/:sector", StockController.getStocksBySector);

// GET search stocks
router.get("/search", StockController.searchStocks);

// GET stock with market trend data
router.get("/trend/:id", StockController.getStockWithTrend);

// API data fetching routes
router.get("/fetch-stock", StockController.fetchAndStoreStockData);
router.get("/fetch-news", StockController.fetchAndStoreMarketNews);
router.get("/fetch-trend", StockController.fetchAndStoreMarketTrend);
router.get("/fetch-session", StockController.fetchAndStoreTradingSession);

module.exports = router;