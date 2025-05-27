
export class User{
    constructor(
        public UserID: number,
        public Username: string,
        public Email: string,
        public CashBalanceDollars: number,
        public CreatedAt: string,
        public UpdatedAt: string
    ) {}
}

export class Stock{
    constructor(
        public StockID: number,
        public Ticker: string,
        public Name: string,
        public OpeningPriceDollars: number,
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
        public UpdatedAt: string
    ) {}
}

export class Dashboard{
    constructor(
        public User: User,
        public Stocks: Stock[],
        public Holdings: Holding[]
    ) {}
}