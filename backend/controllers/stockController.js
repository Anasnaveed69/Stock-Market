const axios = require('axios');
const Stock = require('../models/Stock');
const News = require('../models/news');
const MarketTrend = require('../models/MarketTrend');
const TradingSession = require('../models/tradingSession');

class StockController {
    // Existing methods for API data fetching and storage
    static async fetchAndStoreStockData(req, res) {
        try {
            const { symbol } = req.query;
            if (!symbol) {
                return res.status(400).json({ error: 'Ticker symbol is required' });
            }

            const apiResponse = await axios.get('https://www.alphavantage.co/query', {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol,
                    apikey: process.env.ALPHA_VANTAGE_API_KEY
                }
            });

            const quoteData = apiResponse.data['Global Quote'];
            if (!quoteData) {
                return res.status(404).json({ error: 'Stock data not found' });
            }

            const stockData = {
                stockName: symbol,
                tickerSymbol: symbol,
                currentPrice: parseFloat(quoteData['05. price']),
                openingPrice: parseFloat(quoteData['02. open']),
                closingPrice: parseFloat(quoteData['08. previous close']),
                highPrice: parseFloat(quoteData['03. high']),
                lowPrice: parseFloat(quoteData['04. low']),
                marketCap: 0,
                sector: 'Unknown',
                exchange: 'NYSE'
            };

            const stockId = await Stock.upsertStock(stockData);

            await Stock.insertApiLog({
                endpoint: 'GLOBAL_QUOTE',
                responseData: apiResponse.data,
                statusCode: apiResponse.status
            });

            res.json({ success: true, stockId });
        } catch (err) {
            console.error('Error in fetchAndStoreStockData:', err);
            res.status(500).json({ error: 'Failed to fetch and store stock data' });
        }
    }

    static async fetchAndStoreMarketNews(req, res) {
        try {
            const { stockId, symbol } = req.query;
            if (!stockId || !symbol) {
                return res.status(400).json({ error: 'Stock ID and symbol are required' });
            }

            const apiResponse = await axios.get('https://www.alphavantage.co/query', {
                params: {
                    function: 'NEWS_SENTIMENT',
                    tickers: symbol,
                    apikey: process.env.ALPHA_VANTAGE_API_KEY
                }
            });

            const newsItems = apiResponse.data.feed || [];
            if (!newsItems.length) {
                return res.status(404).json({ error: 'No news found' });
            }

            const newsData = {
                stockId,
                source: newsItems[0].source || 'Unknown',
                title: newsItems[0].title || 'No Title',
                headline: newsItems[0].summary || 'No Summary',
                publishDate: new Date(newsItems[0].time_published || Date.now())
            };

            const newsId = await News.upsertMarketNews(newsData);

            await Stock.insertApiLog({
                endpoint: 'NEWS_SENTIMENT',
                responseData: apiResponse.data,
                statusCode: apiResponse.status
            });

            res.json({ success: true, newsId });
        } catch (err) {
            console.error('Error in fetchAndStoreMarketNews:', err);
            res.status(500).json({ error: 'Failed to fetch and store market news' });
        }
    }

    static async fetchAndStoreMarketTrend(req, res) {
        try {
            const { stockId, symbol } = req.query;
            if (!stockId || !symbol) {
                return res.status(400).json({ error: 'Stock ID and symbol are required' });
            }

            const apiResponse = await axios.get('https://www.alphavantage.co/query', {
                params: {
                    function: 'RSI',
                    symbol,
                    interval: 'daily',
                    time_period: 14,
                    series_type: 'close',
                    apikey: process.env.ALPHA_VANTAGE_API_KEY
                }
            });

            const rsiData = apiResponse.data['Technical Analysis: RSI'];
            if (!rsiData) {
                return res.status(404).json({ error: 'Trend data not found' });
            }

            const latestRsi = Object.values(rsiData)[0]?.RSI || '0';
            const trendData = {
                stockId,
                past50DaysAverage: 0,
                rsi: parseFloat(latestRsi),
                bollingerBands: 'N/A'
            };

            const trendId = await MarketTrend.upsertMarketTrend(trendData);

            await Stock.insertApiLog({
                endpoint: 'RSI',
                responseData: apiResponse.data,
                statusCode: apiResponse.status
            });

            res.json({ success: true, trendId });
        } catch (err) {
            console.error('Error in fetchAndStoreMarketTrend:', err);
            res.status(500).json({ error: 'Failed to fetch and store market trend' });
        }
    }

    static async fetchAndStoreTradingSession(req, res) {
        try {
            const { exchange } = req.query;
            if (!exchange) {
                return res.status(400).json({ error: 'Exchange is required' });
            }

            const sessionData = {
                exchange,
                startTime: new Date(),
                closeTime: new Date(Date.now() + 8 * 60 * 60 * 1000)
            };

            const sessionId = await TradingSession.upsertTradingSession(sessionData);

            await Stock.insertApiLog({
                endpoint: 'TRADING_SESSION',
                responseData: sessionData,
                statusCode: 200
            });

            res.json({ success: true, sessionId });
        } catch (err) {
            console.error('Error in fetchAndStoreTradingSession:', err);
            res.status(500).json({ error: 'Failed to fetch and store trading session' });
        }
    }

    // New methods required by stockRoutes.js
    static async getAllStocks(req, res) {
        try {
            const stocks = await Stock.findAll();
            res.json(stocks);
        } catch (err) {
            console.error('Error in getAllStocks:', err);
            res.status(500).json({ error: 'Failed to fetch all stocks' });
        }
    }

    static async getStockById(req, res) {
        try {
            const { id } = req.params;
            const stock = await Stock.findByPk(id);
            if (!stock) {
                return res.status(404).json({ error: 'Stock not found' });
            }
            res.json(stock);
        } catch (err) {
            console.error('Error in getStockById:', err);
            res.status(500).json({ error: 'Failed to fetch stock by ID' });
        }
    }

    static async getStockBySymbol(req, res) {
        try {
            const { symbol } = req.params;
            const stock = await Stock.getStockByTicker(symbol);
            if (!stock) {
                return res.status(404).json({ error: 'Stock not found' });
            }
            res.json(stock);
        } catch (err) {
            console.error('Error in getStockBySymbol:', err);
            res.status(500).json({ error: 'Failed to fetch stock by symbol' });
        }
    }

    static async getStocksBySector(req, res) {
        try {
            const { sector } = req.params;
            const stocks = await Stock.findAll({
                where: { Sector: sector }
            });
            res.json(stocks);
        } catch (err) {
            console.error('Error in getStocksBySector:', err);
            res.status(500).json({ error: 'Failed to fetch stocks by sector' });
        }
    }

    static async searchStocks(req, res) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const stocks = await Stock.findAll({
                where: {
                    [Stock.sequelize.Op.or]: [
                        { StockName: { [Stock.sequelize.Op.like]: `%${query}%` } },
                        { TickerSymbol: { [Stock.sequelize.Op.like]: `%${query}%` } }
                    ]
                }
            });

            res.json(stocks);
        } catch (err) {
            console.error('Error in searchStocks:', err);
            res.status(500).json({ error: 'Failed to search stocks' });
        }
    }

    static async getStockWithTrend(req, res) {
        try {
            const { id } = req.params;
            const stock = await Stock.findByPk(id, {
                include: [
                    {
                        model: MarketTrend,
                        as: 'MarketTrends' // Ensure this matches the association alias if defined
                    }
                ]
            });

            if (!stock) {
                return res.status(404).json({ error: 'Stock not found' });
            }

            res.json(stock);
        } catch (err) {
            console.error('Error in getStockWithTrend:', err);
            res.status(500).json({ error: 'Failed to fetch stock with trend data' });
        }
    }
}

module.exports = StockController;