const axios = require("axios")
const cron = require("node-cron")
const Stock = require("../models/Stock")
const ApiLog = require("../models/ApiLog")
const MarketTrend = require("../models/MarketTrend")

// Function to fetch stock data from external API
/*async function fetchStockDataFromAPI(symbol) {
  try {
    // Replace with your actual API endpoint and key
    const apiKey = process.env.STOCK_API_KEY
    const url = `https://api.example.com/stocks/${symbol}?apikey=${apiKey}`

    const response = await axios.get(url)

    // Log API response
    await ApiLog.create({
      End_Point_Indexes: url,
      Response_Data: JSON.stringify(response.data),
      Status_Code: response.status,
      Time_Stamp: new Date(),
    })

    return response.data
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)

    // Log API error
    await ApiLog.create({
      End_Point_Indexes: `https://api.example.com/stocks/${symbol}`,
      Response_Data: JSON.stringify(error.response?.data || error.message),
      Status_Code: error.response?.status || 500,
      Time_Stamp: new Date(),
    })

    throw error
  }
}*/
// Function to fetch stock data from external API
async function fetchStockDataFromAPI(symbol) {
  try {
    // For testing, return mock data instead of making actual API calls
    console.log(`Mock fetching data for ${symbol}`);
    
    // Mock data
    const mockData = {
      symbol: symbol,
      name: `${symbol} Inc.`,
      price: Math.random() * 1000 + 100,
      open: Math.random() * 1000 + 90,
      previousClose: Math.random() * 1000 + 95,
      high: Math.random() * 1000 + 110,
      low: Math.random() * 1000 + 85,
      marketCap: Math.random() * 1000000000000,
      sector: ["Technology", "Healthcare", "Finance", "Energy"][Math.floor(Math.random() * 4)],
      exchange: ["NASDAQ", "NYSE"][Math.floor(Math.random() * 2)],
      movingAverage50: Math.random() * 1000 + 90,
      rsi: Math.random() * 100,
      bollingerUpper: Math.random() * 1000 + 120,
      bollingerMiddle: Math.random() * 1000 + 100,
      bollingerLower: Math.random() * 1000 + 80,
    };

    // Log API response (mock)
    await ApiLog.create({
      End_Point_Indexes: `Mock API call for ${symbol}`,
      Response_Data: JSON.stringify(mockData),
      Status_Code: 200,
      Time_Stamp: new Date(),
    });
    
    return mockData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    
    // Log API error
    await ApiLog.create({
      End_Point_Indexes: `https://api.example.com/stocks/${symbol}`,
      Response_Data: JSON.stringify(error.response?.data || error.message),
      Status_Code: error.response?.status || 500,
      Time_Stamp: new Date(),
    });
    
    throw error;
  }
}

// Function to save stock data to database
async function saveStockData(stockData) {
  try {
    // Check if stock already exists
    const existingStock = await Stock.findOne({
      where: { TickerSymbol: stockData.symbol },
    })

    const stockInfo = {
      StockName: stockData.name,
      TickerSymbol: stockData.symbol,
      CurrentPrice: stockData.price,
      OpeningPrice: stockData.open,
      ClosingPrice: stockData.previousClose,
      HighPrice: stockData.high,
      LowPrice: stockData.low,
      MarketCap: stockData.marketCap,
      Sector: stockData.sector,
      Exchange: stockData.exchange,
      Timestamp: new Date(),
    }

    let stock
    if (existingStock) {
      // Update existing stock
      await existingStock.update(stockInfo)
      stock = existingStock
    } else {
      // Create new stock
      stock = await Stock.create(stockInfo)
    }

    // Update market trend data
    await updateMarketTrend(stock.StockID, stockData)

    return stock
  } catch (error) {
    console.error("Error saving stock data:", error)
    throw error
  }
}

// Function to update market trend data
async function updateMarketTrend(stockId, stockData) {
  try {
    const trendData = {
      Stock_ID: stockId,
      Past_50_Days_Average: stockData.movingAverage50,
      Relative_Strength_Index: stockData.rsi,
      Bollinger_Bands: JSON.stringify({
        upper: stockData.bollingerUpper,
        middle: stockData.bollingerMiddle,
        lower: stockData.bollingerLower,
      }),
      Updated_Time_Stamp: new Date(),
    }

    // Check if trend data already exists
    const existingTrend = await MarketTrend.findOne({
      where: { Stock_ID: stockId },
    })

    if (existingTrend) {
      await existingTrend.update(trendData)
    } else {
      await MarketTrend.create(trendData)
    }
  } catch (error) {
    console.error("Error updating market trend data:", error)
    throw error
  }
}

// Function to fetch and save data for multiple stocks
async function fetchAndSaveStockData() {
  try {
    // List of stock symbols to fetch
    const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA","BTC" ,"ETH"]

    for (const symbol of symbols) {
      try {
        const stockData = await fetchStockDataFromAPI(symbol)
        await saveStockData(stockData)
        console.log(`Successfully updated data for ${symbol}`)
      } catch (error) {
        console.error(`Failed to update data for ${symbol}:`, error)
        // Continue with next symbol even if one fails
      }
    }
  } catch (error) {
    console.error("Error in stock data fetch and save process:", error)
  }
}

// Schedule stock data fetch (every hour during trading hours)
function scheduleStockDataFetch() {
  // Run every hour from 9 AM to 5 PM on weekdays
  cron.schedule("0 9-17 * * 1-5", fetchAndSaveStockData)

  // Also run once at server start
  fetchAndSaveStockData()
}

module.exports = {
  fetchStockDataFromAPI,
  saveStockData,
  fetchAndSaveStockData,
  scheduleStockDataFetch,
}
