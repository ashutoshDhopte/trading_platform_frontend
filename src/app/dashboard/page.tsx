'use client';

import { buyStocks, getDashboardData } from '@/lib/api';
import { Holding, Stock } from '@/type/model';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const TradingDashboard = () => {
  
    const userId = Number(useSearchParams().get('userId'));

    const [stocks, setStocks] = useState<Stock[]>([]);

    const [holdings, setHoldings] = useState<Holding[]>([]);

    // const [watchlist, setWatchList] = useState([]);

    const [tradeSymbol, setTradeSymbol] = useState('');
    const [tradeQuantity, setTradeQuantity] = useState('');

    const quickTradeBuy = async () => {
    if (!userId || !tradeSymbol || !tradeQuantity) return;
    const quantity = parseInt(tradeQuantity);
    if (isNaN(quantity) || quantity <= 0) {
        console.error('Invalid quantity');
        return;
    }
    const response = await buyStocks(userId, tradeSymbol, quantity);
    if (response == "") {
        console.log(`Bought ${quantity} shares of ${tradeSymbol}`);
        // Optionally, refresh holdings or stocks after a successful trade
        setTradeSymbol('');
        setTradeQuantity('');
    } else {
        console.error('Failed to buy stocks: '+response);
    }
};

  // Simulate real-time price updates
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setStockData(prevData => 
  //       prevData.map(stock => {
  //         const change = (Math.random() - 0.5) * 10;
  //         const newPrice = Math.max(stock.price + change, 1);
  //         const changePercent = ((change / stock.price) * 100);
          
  //         return {
  //           ...stock,
  //           price: parseFloat(newPrice.toFixed(2)),
  //           change: parseFloat(change.toFixed(2)),
  //           changePercent: parseFloat(changePercent.toFixed(2))
  //         };
  //       })
  //     );
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const StockItem = ({ stock, onClick }) => (
    <div 
      className="flex justify-between items-center p-4 bg-white/[0.03] rounded-xl border border-white/5 transition-all duration-300 cursor-pointer hover:bg-white/8 hover:border-white/15"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div>
          <div className="font-bold text-base">{stock.Ticker}</div>
          <div className="text-white/70 text-sm">{stock.Name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-base">{formatCurrency(stock.OpeningPriceDollars)}</div>
        <div className={`text-sm mt-1 ${stock.ChangedPriceDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stock.ChangedPriceDollars >= 0 ? '+' : ''}{formatCurrency(stock.ChangedPercent)} ({stock.ChangePercent >= 0 ? '+' : ''}{stock.ChangedPercent}%)
        </div>
      </div>
    </div>
  );

  const HoldingItem = ({ holding }) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0">
      <div className="flex flex-col gap-1">
        <div className="font-bold">{holding.StockTicker}</div>
        <div className="text-white/70 text-sm">{holding.Quantity} shares</div>
      </div>
      <div className="text-right">
        <div className="font-bold">{formatCurrency(holding.TotalValueDollars)}</div>
        {/* <div className={`text-sm ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {holding.change >= 0 ? '+' : ''}{formatCurrency(holding.change)}
        </div> */}
      </div>
    </div>
  );

  const WatchlistItem = ({ item }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0">
      <div>
        <div className="font-bold">{item.symbol}</div>
        <div className="text-white/70 text-sm">{item.name}</div>
      </div>
      <div className="text-right">
        <div className="font-bold">{formatCurrency(item.price)}</div>
        <div className={`text-sm ${item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
        </div>
      </div>
    </div>
  );



  useEffect(() => {
    const getData = async () => {
      const data = await getDashboardData(1);
      if(data == null){
        console.error('Failed to fetch dashboard data');
        return;
      }
      setStocks(data.Stocks == null ? [] : data.Stocks);
      setHoldings(data.Holdings == null ? [] : data.Holdings);
    };

    getData();
  }, []);


  return (
    <section className="relative section-padding flex min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white">
      
      <div className="max-w-7xl mx-auto p-5 mt-35">

        {/* Market Status */}
        <div className="flex items-center gap-2 p-3 bg-green-400/10 border border-green-400/30 rounded-lg mb-8">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Market Open • NYSE • Last updated: 2 seconds ago</span>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">$89,234.50</div>
            <div className="text-white/70">Portfolio Value</div>
          </div>
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">+$2,845.30</div>
            <div className="text-white/70">Today's P&L</div>
          </div>
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">+18.2%</div>
            <div className="text-white/70">Total Return</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Market Overview */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold">Market Overview</h3>
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-3">
                {stocks.map((stock) => (
                  <StockItem 
                    key={stock.Ticker} 
                    stock={stock} 
                    onClick={() => console.log(`Clicked ${stock.Ticker}`)}
                  />
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <h3 className="text-xl font-semibold mb-5">Portfolio Performance</h3>
              <div className="h-80 bg-white/[0.02] rounded-xl bg-gradient-to-br from-cyan-400/10 to-purple-500/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <div className="text-lg text-white/60">Interactive Chart Coming Soon</div>
                  <div className="text-sm text-white/40 mt-2">Real-time portfolio performance visualization</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - 1/3 width */}
          <div className="space-y-5">
            {/* Holdings */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <h3 className="text-xl font-semibold mb-5">My Holdings</h3>
              <div>
                {holdings.map((holding) => (
                  <HoldingItem key={holding.StockTicker} holding={holding} />
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button className="flex-1 py-3 px-6 bg-gradient-to-r from-green-400 to-cyan-400 text-black rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
                  Buy More
                </button>
                <button className="flex-1 py-3 px-6 bg-red-500/20 text-red-400 border border-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all duration-300">
                  Sell
                </button>
              </div>
            </div>

            {/* Watchlist */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <h3 className="text-xl font-semibold mb-5">Watchlist</h3>
              <div>
                {/* {watchlist.map((item) => (
                  <WatchlistItem key={item.symbol} item={item} />
                ))} */}
              </div>
            </div>

            {/* Quick Trade */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <h3 className="text-xl font-semibold mb-5">Quick Trade</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={tradeSymbol}
                  onChange={(e) => setTradeSymbol(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none transition-colors"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none transition-colors"
                />
                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-6 bg-gradient-to-r from-green-400 to-cyan-400 text-black rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg" onClick={quickTradeBuy}>
                    Buy
                  </button>
                  <button className="flex-1 py-3 px-6 bg-red-500/20 text-red-400 border border-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all duration-300">
                    Sell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingDashboard;