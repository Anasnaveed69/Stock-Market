const express = require('express');
const dotenv = require('dotenv');
const stockRoutes = require('./routes/stockRoutes');
const marketTrendRoutes = require('./routes/marketTrendRoutes');
const newsRoutes = require('./routes/newsRoutes');
const tradingSessionRoutes = require('./routes/tradingSessionRoutes');
const apiLogRoutes = require('./routes/apiLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const riskAnalysisRoutes = require('./routes/riskAnalysisRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const sequelize = require('./config/database');
const Stock = require('./models/Stock');
const News = require('./models/news');
const MarketTrend = require('./models/MarketTrend');
const TradingSession = require('./models/tradingSession');
const defineAssociations = require('./models/associations');

dotenv.config();

const app = express();
app.use(express.json());

// Define routes
app.use('/api/stocks', stockRoutes);
app.use('/api/market-trends', marketTrendRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/trading-sessions', tradingSessionRoutes);
app.use('/api/api-logs', apiLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/risk-analyses', riskAnalysisRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlists', wishlistRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const startServer = async () => {
    try {
        // Define associations before syncing models
        defineAssociations();

        // Sync models in order to ensure dependencies are created first
        await Stock.sync({ force: false });
        console.log('Stock model synced successfully.');
        await News.sync({ force: false });
        console.log('News model synced successfully.');
        await MarketTrend.sync({ force: false });
        console.log('MarketTrend model synced successfully.');
        await TradingSession.sync({ force: false });
        console.log('TradingSession model synced successfully.');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Unable to start server:', err);
        if (err.parent && err.parent.errors) {
            console.error('Underlying errors:', err.parent.errors);
        }
        process.exit(1);
    }
};

startServer();