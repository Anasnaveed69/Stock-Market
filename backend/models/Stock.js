const { DataTypes, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const Stock = sequelize.define(
  "Stock",
  {
    StockID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    StockName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    TickerSymbol: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CurrentPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    OpeningPrice: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    ClosingPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    HighPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    LowPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    MarketCap: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    Sector: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Exchange: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'Timestamp'
    },
  },
  {
    tableName: "Stock_Table",
    timestamps: false,
  }
);

// Add custom methods to the Stock model
Stock.upsertStock = async (stockData) => {
  try {
    const [result] = await sequelize.query(
      `EXEC sp_UpsertStock 
        @StockID = :StockID OUTPUT,
        @StockName = :StockName,
        @TickerSymbol = :TickerSymbol,
        @CurrentPrice = :CurrentPrice,
        @OpeningPrice = :OpeningPrice,
        @ClosingPrice = :ClosingPrice,
        @HighPrice = :HighPrice,
        @LowPrice = :LowPrice,
        @MarketCap = :MarketCap,
        @Sector = :Sector,
        @Exchange = :Exchange`,
      {
        replacements: {
          StockID: null,
          StockName: stockData.stockName,
          TickerSymbol: stockData.tickerSymbol,
          CurrentPrice: stockData.currentPrice,
          OpeningPrice: stockData.openingPrice,
          ClosingPrice: stockData.closingPrice,
          HighPrice: stockData.highPrice,
          LowPrice: stockData.lowPrice,
          MarketCap: stockData.marketCap,
          Sector: stockData.sector,
          Exchange: stockData.exchange,
        },
        type: QueryTypes.RAW,
      }
    );

    const stockIdResult = await sequelize.query(
      'SELECT @StockID AS StockID',
      { type: QueryTypes.SELECT }
    );

    return stockIdResult[0].StockID;
  } catch (err) {
    console.error('Error in upsertStock:', err);
    throw err;
  }
};

Stock.insertApiLog = async (logData) => {
  try {
    const [result] = await sequelize.query(
      `EXEC sp_InsertApiLog 
        @Log_ID = :Log_ID OUTPUT,
        @End_Point_Indexes = :End_Point_Indexes,
        @Response_Data = :Response_Data,
        @Status_Code = :Status_Code`,
      {
        replacements: {
          Log_ID: null,
          End_Point_Indexes: logData.endpoint,
          Response_Data: JSON.stringify(logData.responseData),
          Status_Code: logData.statusCode,
        },
        type: QueryTypes.RAW,
      }
    );

    const logIdResult = await sequelize.query(
      'SELECT @Log_ID AS Log_ID',
      { type: QueryTypes.SELECT }
    );

    return logIdResult[0].Log_ID;
  } catch (err) {
    console.error('Error in insertApiLog:', err);
    throw err;
  }
};

Stock.getStockByTicker = async (tickerSymbol) => {
  try {
    const result = await sequelize.query(
      `EXEC sp_GetStockByTickerSymbol @TickerSymbol = :TickerSymbol`,
      {
        replacements: { TickerSymbol: tickerSymbol },
        type: QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    console.error('Error in getStockByTicker:', err);
    throw err;
  }
};

module.exports = Stock;