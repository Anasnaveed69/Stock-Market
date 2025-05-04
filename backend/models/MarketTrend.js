const { DataTypes, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const MarketTrend = sequelize.define(
  "MarketTrend",
  {
    Trend_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Stock_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Stock_Table",
        key: "StockID",
      },
    },
    Past_50_Days_Average: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    Relative_Strength_Index: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    Bollinger_Bands: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Updated_Time_Stamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Market_Trend",
    timestamps: false,
  }
);

// Add custom method to upsert market trend using stored procedure
MarketTrend.upsertMarketTrend = async (trendData) => {
  try {
    const [result] = await sequelize.query(
      `EXEC sp_UpsertMarketTrend 
        @Trend_ID = :Trend_ID OUTPUT,
        @Stock_ID = :Stock_ID,
        @Past_50_Days_Average = :Past_50_Days_Average,
        @Relative_Strength_Index = :Relative_Strength_Index,
        @Bollinger_Bands = :Bollinger_Bands`,
      {
        replacements: {
          Trend_ID: null,
          Stock_ID: trendData.stockId,
          Past_50_Days_Average: trendData.past50DaysAverage,
          Relative_Strength_Index: trendData.rsi,
          Bollinger_Bands: trendData.bollingerBands,
        },
        type: QueryTypes.RAW,
      }
    );

    const trendIdResult = await sequelize.query(
      'SELECT @Trend_ID AS Trend_ID',
      { type: QueryTypes.SELECT }
    );

    return trendIdResult[0].Trend_ID;
  } catch (err) {
    console.error('Error in upsertMarketTrend:', err);
    throw err;
  }
};

module.exports = MarketTrend;