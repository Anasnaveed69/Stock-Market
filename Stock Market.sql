CREATE DATABASE RSMA;
GO
USE RSMA;
GO

CREATE TABLE Stock_Table (
    StockID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    StockName VARCHAR(255) NOT NULL,
    TickerSymbol VARCHAR(255) NOT NULL,
    CurrentPrice DECIMAL(15, 2) NOT NULL,
    OpeningPrice DECIMAL(15, 2),
    ClosingPrice DECIMAL(15, 2) NOT NULL,
    HighPrice DECIMAL(15, 2) NOT NULL,
    LowPrice DECIMAL(15, 2) NOT NULL,
    MarketCap BIGINT NOT NULL,
    Sector VARCHAR(255) NOT NULL,
    Exchange VARCHAR(255) NOT NULL,
    Timestamp DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE User_Table (
    UserID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(255) NOT NULL,
    UserType VARCHAR(20) NOT NULL DEFAULT 'Trader',
    AccountBalance DECIMAL(15, 2) NOT NULL,
    Account_Creation_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Updation_In_Profile DATE NOT NULL
);
select * from Stock_Table
CREATE TABLE User_Portfolio (
    Portfolio_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    User_ID INT NOT NULL,
    Stock_ID INT NOT NULL,
    Owned_Shares INT NOT NULL,
    Total_Investment DECIMAL(15, 2) NOT NULL,
    Average_Purchase DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES User_Table(UserID),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);

CREATE TABLE Transaction_Table (
    Transaction_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    User_ID INT NOT NULL,
    Stock_ID INT NOT NULL,
    Transaction_Type VARCHAR(10) NOT NULL,
    Price_Per_Share DECIMAL(15, 2) NOT NULL,
    Total_Amount DECIMAL(15, 2) NOT NULL,
    Transaction_Date DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (User_ID) REFERENCES User_Table(UserID),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);


CREATE TABLE Wishlist (
    Wishlist_ID BIGINT NOT NULL PRIMARY KEY IDENTITY(1,1),
    User_ID INT NOT NULL,
    Stock_ID INT NOT NULL,
    Date DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (User_ID) REFERENCES User_Table(UserID),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);

CREATE TABLE Order_Table (
    Order_ID BIGINT NOT NULL PRIMARY KEY IDENTITY(1,1),
    User_ID INT NOT NULL,
    Stock_ID INT NOT NULL,
    Order_Type VARCHAR(20) NOT NULL,
    Order_Status VARCHAR(20) NOT NULL,
    Price_Limit DECIMAL(15, 2) NOT NULL,
    Order_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Shares INT NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES User_Table(UserID),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);

CREATE TABLE Market_News (
    News_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    Stock_ID INT NOT NULL,
    Source VARCHAR(255) NOT NULL,
    Publish_Date DATETIME NOT NULL DEFAULT GETDATE(),
    News_Title VARCHAR(255) NOT NULL,
    Headline VARCHAR(255) NOT NULL,
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);

CREATE TABLE Notification (
    Notification_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    User_ID INT NOT NULL,
    Status VARCHAR(10) NOT NULL,
    Notification_Type VARCHAR(50) NOT NULL,
    Message VARCHAR(255) NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES User_Table(UserID)
);

CREATE TABLE Admin_Table (
    Admin_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    Admin_Name VARCHAR(255) NOT NULL,
    Admin_Pass VARCHAR(255) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Creation_Date DATE NOT NULL
);

CREATE TABLE Trading_Session (
    Session_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    Exchange VARCHAR(255) NOT NULL,
    Starting_Time DATETIME NOT NULL,
    Closing_Time DATETIME NOT NULL
);

CREATE TABLE Risk_Analysis (
    Risk_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    User_ID INT NOT NULL,
    Stock_ID INT NOT NULL,
    Volatility DECIMAL(10, 4) NOT NULL,
    Sharpe_Ratio DECIMAL(10, 4) NOT NULL,
    Risk_Value VARCHAR(255) NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES User_Table(UserID),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);

CREATE TABLE Market_Trend (
    Trend_ID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    Stock_ID INT NOT NULL,
    Past_50_Days_Average DECIMAL(15, 2) NOT NULL,
    Relative_Strength_Index DECIMAL(10, 4) NOT NULL,
    Bollinger_Bands VARCHAR(255) NOT NULL,
    Updated_Time_Stamp DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Table(StockID)
);

CREATE TABLE API_Logs (
    Log_ID BIGINT NOT NULL PRIMARY KEY IDENTITY(1,1),
    End_Point_Indexes VARCHAR(255) NOT NULL,
    Response_Data TEXT NOT NULL,
    Status_Code INT NOT NULL,
    Time_Stamp DATETIME NOT NULL DEFAULT GETDATE()1
);
GO


SELECT * FROM Stock_Table;

SELECT * FROM User_Table;

SELECT * FROM User_Portfolio;

SELECT * FROM Transaction_Table;

SELECT * FROM Wishlist;

SELECT * FROM Order_Table;

SELECT * FROM Market_News;

SELECT * FROM Notification;

SELECT * FROM Admin_Table;

SELECT * FROM Trading_Session;

SELECT * FROM Risk_Analysis;

SELECT * FROM Market_Trend;

SELECT * FROM API_Logs;

CREATE PROCEDURE sp_UpsertStock
    @StockID INT OUTPUT,
    @StockName VARCHAR(255),
    @TickerSymbol VARCHAR(255),
    @CurrentPrice DECIMAL(15, 2),
    @OpeningPrice DECIMAL(15, 2),
    @ClosingPrice DECIMAL(15, 2),
    @HighPrice DECIMAL(15, 2),
    @LowPrice DECIMAL(15, 2),
    @MarketCap BIGINT,
    @Sector VARCHAR(255),
    @Exchange VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Stock_Table WHERE TickerSymbol = @TickerSymbol)
    BEGIN
        UPDATE Stock_Table
        SET StockName = @StockName,
            CurrentPrice = @CurrentPrice,
            OpeningPrice = @OpeningPrice,
            ClosingPrice = @ClosingPrice,
            HighPrice = @HighPrice,
            LowPrice = @LowPrice,
            MarketCap = @MarketCap,
            Sector = @Sector,
            Exchange = @Exchange,
            Timestamp = GETDATE()
        WHERE TickerSymbol = @TickerSymbol;

        SELECT @StockID = StockID FROM Stock_Table WHERE TickerSymbol = @TickerSymbol;
    END
    ELSE
    BEGIN
        INSERT INTO Stock_Table (StockName, TickerSymbol, CurrentPrice, OpeningPrice, ClosingPrice, HighPrice, LowPrice, MarketCap, Sector, Exchange)
        VALUES (@StockName, @TickerSymbol, @CurrentPrice, @OpeningPrice, @ClosingPrice, @HighPrice, @LowPrice, @MarketCap, @Sector, @Exchange);

        SET @StockID = SCOPE_IDENTITY();
    END
END;
GO
CREATE PROCEDURE sp_UpsertMarketTrend
    @Trend_ID INT OUTPUT,
    @Stock_ID INT,
    @Past_50_Days_Average DECIMAL(15, 2),
    @Relative_Strength_Index DECIMAL(10, 4),
    @Bollinger_Bands VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Market_Trend WHERE Stock_ID = @Stock_ID)
    BEGIN
        UPDATE Market_Trend
        SET Past_50_Days_Average = @Past_50_Days_Average,
            Relative_Strength_Index = @Relative_Strength_Index,
            Bollinger_Bands = @Bollinger_Bands,
            Updated_Time_Stamp = GETDATE()
        WHERE Stock_ID = @Stock_ID;

        SELECT @Trend_ID = Trend_ID FROM Market_Trend WHERE Stock_ID = @Stock_ID;
    END
    ELSE
    BEGIN
        INSERT INTO Market_Trend (Stock_ID, Past_50_Days_Average, Relative_Strength_Index, Bollinger_Bands)
        VALUES (@Stock_ID, @Past_50_Days_Average, @Relative_Strength_Index, @Bollinger_Bands);

        SET @Trend_ID = SCOPE_IDENTITY();
    END
END;
GO


CREATE PROCEDURE sp_InsertApiLog
    @Log_ID BIGINT OUTPUT,
    @End_Point_Indexes VARCHAR(255),
    @Response_Data TEXT,
    @Status_Code INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO API_Logs (End_Point_Indexes, Response_Data, Status_Code)
    VALUES (@End_Point_Indexes, @Response_Data, @Status_Code);

    SET @Log_ID = SCOPE_IDENTITY();
END;
GO

-- Procedure to insert or update market news
CREATE PROCEDURE sp_UpsertMarketNews
    @News_ID INT OUTPUT,
    @Stock_ID INT,
    @Source VARCHAR(255),
    @News_Title VARCHAR(255),
    @Headline VARCHAR(255),
    @Publish_Date DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Publish_Date IS NULL
        SET @Publish_Date = GETDATE();
        
    IF EXISTS (SELECT 1 FROM Market_News WHERE Stock_ID = @Stock_ID AND News_Title = @News_Title)
    BEGIN
        UPDATE Market_News
        SET Source = @Source,
            Headline = @Headline,
            Publish_Date = @Publish_Date
        WHERE Stock_ID = @Stock_ID AND News_Title = @News_Title;
        
        SELECT @News_ID = News_ID FROM Market_News WHERE Stock_ID = @Stock_ID AND News_Title = @News_Title;
    END
    ELSE
    BEGIN
        INSERT INTO Market_News (Stock_ID, Source, News_Title, Headline, Publish_Date)
        VALUES (@Stock_ID, @Source, @News_Title, @Headline, @Publish_Date);
        
        SET @News_ID = SCOPE_IDENTITY();
    END
END;
GO

-- Procedure to insert or update risk analysis
CREATE PROCEDURE sp_UpsertRiskAnalysis
    @Risk_ID INT OUTPUT,
    @User_ID INT,
    @Stock_ID INT,
    @Volatility DECIMAL(10, 4),
    @Sharpe_Ratio DECIMAL(10, 4),
    @Risk_Value VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM Risk_Analysis WHERE User_ID = @User_ID AND Stock_ID = @Stock_ID)
    BEGIN
        UPDATE Risk_Analysis
        SET Volatility = @Volatility,
            Sharpe_Ratio = @Sharpe_Ratio,
            Risk_Value = @Risk_Value
        WHERE User_ID = @User_ID AND Stock_ID = @Stock_ID;
        
        SELECT @Risk_ID = Risk_ID FROM Risk_Analysis WHERE User_ID = @User_ID AND Stock_ID = @Stock_ID;
    END
    ELSE
    BEGIN
        INSERT INTO Risk_Analysis (User_ID, Stock_ID, Volatility, Sharpe_Ratio, Risk_Value)
        VALUES (@User_ID, @Stock_ID, @Volatility, @Sharpe_Ratio, @Risk_Value);
        
        SET @Risk_ID = SCOPE_IDENTITY();
    END
END;
GO

-- Procedure to insert or update trading session
CREATE PROCEDURE sp_UpsertTradingSession
    @Session_ID INT OUTPUT,
    @Exchange VARCHAR(255),
    @Starting_Time DATETIME,
    @Closing_Time DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM Trading_Session WHERE Exchange = @Exchange)
    BEGIN
        UPDATE Trading_Session
        SET Starting_Time = @Starting_Time,
            Closing_Time = @Closing_Time
        WHERE Exchange = @Exchange;
        
        SELECT @Session_ID = Session_ID FROM Trading_Session WHERE Exchange = @Exchange;
    END
    ELSE
    BEGIN
        INSERT INTO Trading_Session (Exchange, Starting_Time, Closing_Time)
        VALUES (@Exchange, @Starting_Time, @Closing_Time);
        
        SET @Session_ID = SCOPE_IDENTITY();
    END
END;
GO

-- Procedure to get stock by ticker symbol
CREATE PROCEDURE sp_GetStockByTickerSymbol
    @TickerSymbol VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM Stock_Table WHERE TickerSymbol = @TickerSymbol;
END;
GO

-- Procedure to get all stocks
CREATE PROCEDURE sp_GetAllStocks
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM Stock_Table ORDER BY StockName;
END;
GO

-- Procedure to get market trends for a stock
CREATE PROCEDURE sp_GetMarketTrendByStockID
    @Stock_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM Market_Trend WHERE Stock_ID = @Stock_ID;
END;
GO

-- Procedure to get market news for a stock
CREATE PROCEDURE sp_GetMarketNewsByStockID
    @Stock_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM Market_News WHERE Stock_ID = @Stock_ID ORDER BY Publish_Date DESC;
END;
GO