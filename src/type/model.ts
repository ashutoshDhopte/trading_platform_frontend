
export class User{
    constructor(
        public UserID: number,
        public Username: string,
        public Email: string,
        public CashBalanceDollars: number,
        public CreatedAt: string,
        public UpdatedAt: string,
        public NotificationsOn: boolean,
    ) {}
}

export class Stock{
    constructor(
        public StockID: number,
        public Ticker: string,
        public Name: string,
        public OpeningPriceDollars: number,
        public CurrentPriceDollars: number,
        public ChangedPriceDollars: number,
        public ChangedPercent: number,
        public UpdatedAt: string
    ) {}
}

export class Holding{
    constructor(
        public HoldingID: number,
        public StockTicker: string,
        public Quantity: number,
        public AverageCostPerShareDollars: number,
        public TotalValueDollars: number,
        public PnLDollars: number, 
	    public PnLPercent: number, 
        public UpdatedAt: string
    ) {}
}

export class Dashboard{
    constructor(
        public User: User,
        public Stocks: Stock[],
        public Holdings: Holding[],
        public StockWatchlist: StockWatchlist[],
        public TotalHoldingValueDollars: number,
        public PortfolioValueDollars: number,
        public TotalPnLDollars: number,
        public TotalReturnPercent: number
    ) {}
}

export interface ApiResponse {
    Success: boolean;
    Data?: unknown; // Can be User, Dashboard, or string for error messages
    ErrorMessage?: string; // Error message if the transaction fails            
}

export interface Order {  
    OrderID: number;
    StockTicker: string;
    StockName: string;
    TradeType: string;
    OrderStatus: string;
    Quantity: number;
    PricePerShareDollars: number;
    TotalOrderValueDollars: number;
    CreatedAt: string;
    Notes: string;
}

export interface StockWatchlist {
    StockWatchlistID: number;
    UserId: number;
    StockId: number;
    StockTicker: string
    StockName: string;
    TargetPriceDollars: number;
    DiffPriceDollars: number;
    DiffPercent: number;
    IsActive: boolean;
    CreatedAt: string;
}