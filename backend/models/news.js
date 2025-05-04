const { DataTypes, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const News = sequelize.define(
  "News",
  {
    News_ID: {
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
    Source: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    News_Title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Headline: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Publish_Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "Market_News",
    timestamps: false,
  }
);

News.upsertMarketNews = async (newsData) => {
  try {
    const [result] = await sequelize.query(
      `EXEC sp_UpsertMarketNews 
        @News_ID = :News_ID OUTPUT,
        @Stock_ID = :Stock_ID,
        @Source = :Source,
        @News_Title = :News_Title,
        @Headline = :Headline,
        @Publish_Date = :Publish_Date`,
      {
        replacements: {
          News_ID: null,
          Stock_ID: newsData.stockId,
          Source: newsData.source,
          News_Title: newsData.title,
          Headline: newsData.headline,
          Publish_Date: newsData.publishDate,
        },
        type: QueryTypes.RAW,
      }
    );

    const newsIdResult = await sequelize.query(
      'SELECT @News_ID AS News_ID',
      { type: QueryTypes.SELECT }
    );

    return newsIdResult[0].News_ID;
  } catch (err) {
    console.error('Error in upsertMarketNews:', err);
    throw err;
  }
};

module.exports = News;