'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { addStockToWatchlist, buyStocks, getDashboardData, sellStocks } from '@/lib/api';
import { Dashboard, Holding, Stock } from '@/type/model';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/util';
import { useUser } from '@/components/UserContext';
import { useCallback } from 'react';
import { useRef } from 'react';

// Popup component for adding to watchlist
const StockWatchlistPopup = ({ x, y, stockPrice, onAdd }: { x: number, y: number, stockPrice: number, onAdd: (value: string) => void }) => {
  const [input, setInput] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useEffect(() => {
    setInput(stockPrice.toFixed(2).toString()); // Initialize with stock price as string
    function handleClick(e: MouseEvent) {
      
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [stockPrice]);

  return (
    <div
      ref={popupRef}
      style={{ position: 'absolute', left: x, top: y, zIndex: 1000 }}
      className="text-black shadow-lg min-w-[180px] border border-gray-200 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl item-center flex p-3"
    >
      {/* Caret */}
      <div
      style={{ position: 'absolute', left: '50%', top: '-10px', transform: 'translateX(-50%)' }}
      >
      <svg width="20" height="10" viewBox="0 0 20 10">
        <polygon points="10,0 20,10 0,10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.03"/>
      </svg>
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full p-2 pl-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none transition-colors"
        placeholder="Target price"
      />
      <button
        className="text-white rounded font-semibold cursor-pointer transition-colors mx-auto ml-2"
        style={{ width: '40%', display: 'block' }}
        onClick={() => { onAdd(input); }}
      >
      Add
      </button>
    </div>
  );
};

const TradingDashboard = () => {
  
    const {user} = useUser();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [portfolioValue, setPortfolioValue] = useState(0.00);
    const [totalPnL, setTotalPnL] = useState(0.00);
    const [totalPnLPercent, setTotalPnLPercent] = useState(0.00);
    const [totalHoldingValue, setTotalHoldingValue] = useState(0.00);

    // const [watchlist, setWatchList] = useState([]);

    const [tradeSymbol, setTradeSymbol] = useState('');
    const [tradeQuantity, setTradeQuantity] = useState('');

    const quickTradeBuy = async () => {
      if (!user?.UserID || !tradeSymbol || !tradeQuantity) return;
      const quantity = parseInt(tradeQuantity);
      if (isNaN(quantity) || quantity <= 0) {
          console.error('Invalid quantity');
          return;
      }
      const response = await buyStocks(user?.UserID, tradeSymbol, quantity);
      if (response == "") {
          console.log(`Bought ${quantity} shares of ${tradeSymbol}`);
          // Optionally, refresh holdings or stocks after a successful trade
          setTradeSymbol('');
          setTradeQuantity('');
          loadDashboard()
      } else {
          console.error('Failed to buy stocks: '+response);
      }
    };

    const quickTradeSell = async () => {
      if (!user?.UserID || !tradeSymbol || !tradeQuantity) return;
      const quantity = parseInt(tradeQuantity);
      if (isNaN(quantity) || quantity <= 0) {
          console.error('Invalid quantity');
          return;
      }
      const response = await sellStocks(user?.UserID, tradeSymbol, quantity);
      if (response == "") {
          console.log(`Sold ${quantity} shares of ${tradeSymbol}`);
          // Optionally, refresh holdings or stocks after a successful trade
          setTradeSymbol('');
          setTradeQuantity('');
          loadDashboard()
      } else {
          console.error('Failed to buy stocks: '+response);
      }
    };


  // Update StockItem to accept onEyeClick: (e: React.MouseEvent) => void
  const StockItem = ({ stock, onClick, onEyeClick }: { stock: Stock; onClick: () => void; onEyeClick: (e: React.MouseEvent) => void }) => (
    <div 
      className="flex justify-between items-center p-4 bg-white/[0.03] rounded-xl border border-white/5 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
      <div>
        <div className="font-bold text-base">{stock.Ticker}</div>
        <div className="text-white/70 text-sm">{stock.Name}</div>
      </div>
      </div>
      <div className="text-right flex items-center gap-2">
      <div>
        <div className="font-bold text-base">{formatCurrency(stock.CurrentPriceDollars)}</div>
        <div className={`text-sm mt-1 ${stock.ChangedPriceDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.ChangedPriceDollars >= 0 ? '+' : ''}{formatCurrency(stock.ChangedPriceDollars)} ({stock.ChangedPercent >= 0 ? '+' : ''}{stock.ChangedPercent.toFixed(2)}%)</div>
      </div>
      {/* Eye Icon - always visible */}
      <span className="ml-2 text-gray-400 cursor-pointer" onClick={onEyeClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3.5" />
        </svg>
      </span>
      </div>
    </div>
  );

  const HoldingItem = ({ holding } : { holding: Holding}) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0">
      <div className="flex flex-col gap-1">
        <div className="font-bold">{holding.StockTicker}
          {holding.Quantity > 0 && (
          <span className="ml-2 text-green-400">▲</span>
          )}
          {holding.Quantity < 0 && (
            <span className="ml-2 text-red-400">▼</span>
          )}
        </div>
        <div className="text-white/70 text-sm">{Math.abs(holding.Quantity)} qty x {formatCurrency(holding.AverageCostPerShareDollars)} avg</div>
      </div>
      <div className="text-right">
        <div className="font-bold">{formatCurrency(holding.TotalValueDollars)}</div>
        <div className={`text-sm ${holding.PnLDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {holding.PnLDollars >= 0 ? '+' : ''}{formatCurrency(holding.PnLDollars)} ({holding.PnLPercent >= 0 ? '+' : ''}{holding.PnLPercent.toFixed(2)}%)
        </div> 
      </div>
    </div>
  );

  // const WatchlistItem = ({ item }) => (
  //   <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0">
  //     <div>
  //       <div className="font-bold">{item.symbol}</div>
  //       <div className="text-white/70 text-sm">{item.name}</div>
  //     </div>
  //     <div className="text-right">
  //       <div className="font-bold">{formatCurrency(item.price)}</div>
  //       <div className={`text-sm ${item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
  //         {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
  //       </div>
  //     </div>
  //   </div>
  // );

  const setDashboardData = useCallback((data: Dashboard) => {
    setStocks(data.Stocks == null ? [] : data.Stocks);
    setHoldings(data.Holdings == null ? [] : data.Holdings);
    setPortfolioValue(data.PortfolioValueDollars || 0);
    setTotalPnL(data.TotalPnLDollars || 0);
    setTotalPnLPercent(data.TotalReturnPercent || 0);
    setTotalHoldingValue(data.TotalHoldingValueDollars || 0);
    setLastUpdateTime(new Date())
  }, [])

  const loadDashboard = useCallback(async () => {
    const data = await getDashboardData(user?.UserID || 0);
    if(data == null){
      console.error('Failed to fetch dashboard data');
      return;
    }
    setDashboardData(data);
  }, [setDashboardData, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, user]);


  const [dashboardWsStatus, setDashboardWsStatus] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const userIdForWS = Number(useSearchParams().get('userId')) || 0;

  useEffect(() => {
    // This effect runs once when the component mounts.
    // It's responsible for establishing and managing the WebSocket connection.

    // The URL of your Go backend's WebSocket endpoint.
    // In development, this is localhost. For cloud deployment, you'd use a different URL
    // from an environment variable, e.g., `process.env.NEXT_PUBLIC_WEBSOCKET_URL`.

    const wsUrl = process.env.NEXT_PUBLIC_API_WS;

    // Create a new WebSocket connection.
    const ws = new WebSocket(wsUrl+`/dashboard?userId=${userIdForWS}`);

    // Event handler for when the connection is successfully opened.
    ws.onopen = () => {
      console.log('WebSocket connection established.');
      setDashboardWsStatus(true);
    };

    // Event handler for receiving messages from the server.
    ws.onmessage = (event) => {
      try {
        // The data from the server is a JSON string. We need to parse it.
        const dashboard: Dashboard = JSON.parse(event.data);
        
        // Update the component's state with the new list of stocks.
        // This will cause the UI to re-render with the new prices.
        setDashboardData(dashboard);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Event handler for any errors that occur.
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setDashboardWsStatus(false);
    };

    // Event handler for when the connection is closed.
    ws.onclose = () => {
      console.log('WebSocket connection closed.');
      setDashboardWsStatus(false);
    };

    // This is a cleanup function.
    // It will be called when the component is unmounted (e.g., if you navigate to another page).
    // This is crucial for preventing memory leaks by closing the connection.
    return () => {
      ws.close();
    };
  }, [setDashboardData, userIdForWS]); // The empty dependency array `[]` ensures this effect runs only once on mount.

  const addStockToWatchlistApiCall = async (stockId: number, targetPriceStr: string) => {
    console.log(`Adding stock ${stockId} to watchlist with target price ${targetPriceStr}`);
    if (!user?.UserID || !stockId || !targetPriceStr) return;
    const targetPrice = parseFloat(targetPriceStr);
    if (isNaN(targetPrice) || targetPrice <= 0) {
        console.error('Invalid target price');
        return;
    }
    const response = await addStockToWatchlist(user?.UserID, stockId, targetPrice);
    if (response == "") {
        console.log(`Added stock ${stockId} to watchlist with target price ${targetPrice}`);
        setPopup(null); // Close the popup after adding
    } else {
        console.error('Failed to add stock to wathchlist: '+response);
    }
  };

  const [popup, setPopup] = useState<{ x: number, y: number, stockId: number, stockPrice: number } | null>(null);

  const handleEyeClick = (event: React.MouseEvent, stock: Stock) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopup({
      x: rect.left + window.scrollX - 207 + rect.width / 2, // center popup
      y: rect.top + window.scrollY - 110, // above the icon
      stockId: stock.StockID,
      stockPrice: stock.CurrentPriceDollars
    });
  };

  return (
    <section className="relative section-padding flex min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto p-5 mt-35 relative">

        {/* Market Status */}
        {/* <div className="flex items-center gap-2 p-3 bg-green-400/10 border border-green-400/30 rounded-lg mb-8">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Market Open • NYSE</span>
        </div> */}

        

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">

            {/* Portfolio Stats */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
                <div className={`text-3xl font-bold ${portfolioValue >= 0 ? 'text-green-400' : 'text-red-400'} mb-2`}>{formatCurrency(portfolioValue)}</div>
                <div className="text-white/70">Portfolio Value</div>
              </div>
              <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
                <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'} mb-2`}>{totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}</div>
                <div className="text-white/70">Today&apos;s P&L</div>
              </div>
              <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
                <div className={`text-3xl font-bold ${totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'} mb-2`}>{totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%</div>
                <div className="text-white/70">Total Return</div>
              </div>
            </div>

            {/* Market Overview */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold">Market Overview</h3>
                <div className="justify-end flex items-center">
                  {dashboardWsStatus ? (
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-5 h-5 ml-2 text-red-500"
                      fill="none"
                      viewBox="0 0 20 20"
                      stroke="currentColor"
                    >
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                      <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="10" cy="14" r="1" fill="currentColor" />
                    </svg>
                  )}
                    <span className='pl-2 text-sm text-white/70'>
                    Last updated:&nbsp;&nbsp;
                    {lastUpdateTime.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}{' '}
                    {lastUpdateTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                    &nbsp;&nbsp; (Updates every 15 seconds)
                    </span>
                 </div>
              </div>
              <div className="space-y-3">
                {stocks.map((stock) => (
                  <StockItem 
                    key={stock.Ticker} 
                    stock={stock} 
                    onClick={() => console.log(`Clicked ${stock.Ticker}`)}
                    onEyeClick={(e) => handleEyeClick(e, stock)}
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
                  <button className="flex-1 py-3 px-6 bg-red-500/20 text-red-400 border border-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all duration-300"
                    onClick={quickTradeSell}>
                    Sell
                  </button>
                </div>
              </div>
            </div>

            {/* Holdings */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <div className="mb-5 flex">
                <div className="w-2/5">
                  <h3 className="text-xl font-semibold">My Holdings</h3>
                </div>
                <div className="text-xl font-semibold w-3/5 text-right">{formatCurrency(totalHoldingValue)}</div>
              </div>
              <div>
                {holdings.map((holding) => (
                  <HoldingItem key={holding.StockTicker} holding={holding} />
                ))}
              </div>
              {/* <div className="flex gap-3 mt-5">
                <button className="flex-1 py-3 px-6 bg-gradient-to-r from-green-400 to-cyan-400 text-black rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
                  Buy More
                </button>
                <button className="flex-1 py-3 px-6 bg-red-500/20 text-red-400 border border-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all duration-300">
                  Sell
                </button>
              </div> */}
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

            
          </div>
        </div>
        {/* Render the popup absolutely inside the container */}
        {popup && (
          <StockWatchlistPopup
            x={popup.x}
            y={popup.y}
            stockPrice={popup.stockPrice}
            onAdd={val => addStockToWatchlistApiCall(popup.stockId, val)}
          />
        )}
      </div>
    </section>
  );
};

export default TradingDashboard;