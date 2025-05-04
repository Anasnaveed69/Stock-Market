const { DataTypes, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const TradingSession = sequelize.define(
  "TradingSession",
  {
    Session_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Exchange: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Starting_Time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Closing_Time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "Trading_Session",
    timestamps: false,
  }
);

TradingSession.upsertTradingSession = async (sessionData) => {
  try {
    const [result] = await sequelize.query(
      `EXEC sp_UpsertTradingSession 
        @Session_ID = :Session_ID OUTPUT,
        @Exchange = :Exchange,
        @Starting_Time = :Starting_Time,
        @Closing_Time = :Closing_Time`,
      {
        replacements: {
          Session_ID: null,
          Exchange: sessionData.exchange,
          Starting_Time: sessionData.startTime,
          Closing_Time: sessionData.closeTime,
        },
        type: QueryTypes.RAW,
      }
    );

    const sessionIdResult = await sequelize.query(
      'SELECT @Session_ID AS Session_ID',
      { type: QueryTypes.SELECT }
    );

    return sessionIdResult[0].Session_ID;
  } catch (err) {
    console.error('Error in upsertTradingSession:', err);
    throw err;
  }
};

module.exports = TradingSession;