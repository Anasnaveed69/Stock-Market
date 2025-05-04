const Stock = require("./Stock");
const News = require("./news");
const MarketTrend = require("./MarketTrend");

const defineAssociations = () => {
  // Stock to News (one-to-many)
  Stock.hasMany(News, { foreignKey: "Stock_ID", sourceKey: "StockID" });
  News.belongsTo(Stock, { foreignKey: "Stock_ID", targetKey: "StockID" });

  // Stock to MarketTrend (one-to-many)
  Stock.hasMany(MarketTrend, { foreignKey: "Stock_ID", sourceKey: "StockID" });
  MarketTrend.belongsTo(Stock, { foreignKey: "Stock_ID", targetKey: "StockID" });
};

module.exports = defineAssociations;