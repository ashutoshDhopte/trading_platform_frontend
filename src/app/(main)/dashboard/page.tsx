'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { addStockToWatchlist, buyStocks, deleteStockFromWatchlist, getDashboardData, sellStocks } from '@/lib/api';
import { Dashboard, Holding, Stock, StockWatchlist, User } from '@/type/model';
import { useState, useEffect, Key, use, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/util';
import { useUser } from '@/components/UserContext';
import { useCallback } from 'react';
import { useRef } from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { showNotificationUtil } from '@/lib/notification';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Popup component for adding to watchlist
const StockWatchlistPopup = ({ x, y, stockPrice, onAdd, setPopup }: 
  { x: number, 
    y: number, 
    stockPrice: number, 
    onAdd: (value: string) => void, 
    setPopup: (value: { x: number, y: number, stockId: number, stockPrice: number } | null) => void 
  }) => {
  const [input, setInput] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useEffect(() => {
    setInput(stockPrice.toFixed(2).toString()); // Initialize with stock price as string
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null); // Close popup on outside click
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [setPopup, stockPrice]);

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
      Watch
      </button>
    </div>
  );
};

const TradingDashboard = () => {
  
    const {user} = useUser();
    const router = useRouter();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [portfolioValue, setPortfolioValue] = useState(0.00);
    const [totalPnL, setTotalPnL] = useState(0.00);
    const [totalPnLPercent, setTotalPnLPercent] = useState(0.00);
    const [totalHoldingValue, setTotalHoldingValue] = useState(0.00);
    const [watchlist, setWatchList] = useState<StockWatchlist[]>([]);

    const [tradeSymbol, setTradeSymbol] = useState('');
    const [tradeQuantity, setTradeQuantity] = useState('');
    const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
    const [stockSearchTerm, setStockSearchTerm] = useState('');

    // Predefined quantity options
    const quantityOptions = [10, 25, 50, 100, 250];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.stock-dropdown')) {
                setIsStockDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showNotification = useCallback((title: string, options: NotificationOptions) => {
      if(!user || !user.NotificationsOn) return;
      showNotificationUtil(title, options);
    },[user]);

    const quickTradeBuy = async () => {
      if (!user?.UserID || !tradeSymbol || !tradeQuantity) return;
      const quantity = parseInt(tradeQuantity);
      if (isNaN(quantity) || quantity <= 0) {
          console.error('Invalid quantity');
          return;
      }
      const session = await getSession(); 
      const token = session?.backendToken || ""
      const response = await buyStocks(user?.UserID, tradeSymbol, quantity, token);
      if (response == "") {
          console.log(`Bought ${quantity} shares of ${tradeSymbol}`);
          // Optionally, refresh holdings or stocks after a successful trade
          setTradeSymbol('');
          setTradeQuantity('');
          setStockSearchTerm('');
          loadDashboard()
          showNotification(`Trade Executed!!`, {
            body: `Successfully purchased ${quantity} shares of ${tradeSymbol}`
          });
      } else {
          console.error('Failed to buy stocks: '+response);
          showNotification(`Trade Failed`, {
            body: `Failed to purchase ${quantity} shares of ${tradeSymbol}: ${response}`
          });
      }
    };

    const quickTradeSell = async () => {
      if (!user?.UserID || !tradeSymbol || !tradeQuantity) return;
      const quantity = parseInt(tradeQuantity);
      if (isNaN(quantity) || quantity <= 0) {
          console.error('Invalid quantity');
          return;
      }
      const session = await getSession(); 
      const token = session?.backendToken || ""
      const response = await sellStocks(user?.UserID, tradeSymbol, quantity, token);
      if (response == "") {
          console.log(`Sold ${quantity} shares of ${tradeSymbol}`);
          // Optionally, refresh holdings or stocks after a successful trade
          setTradeSymbol('');
          setTradeQuantity('');
          setStockSearchTerm('');
          loadDashboard()
          showNotification(`Trade Executed!!`, {
            body: `Successfully sold ${quantity} shares of ${tradeSymbol}`
          });
      } else {
          console.error('Failed to buy stocks: '+response);
          showNotification(`Trade Failed`, {
            body: `Failed to sell ${quantity} shares of ${tradeSymbol}: ${response}`
          });
      }
    };


  // Update StockItem to accept onEyeClick: (e: React.MouseEvent) => void
  const StockItem = ({ stock, onClick, onEyeClick }: { stock: Stock; onClick: () => void; onEyeClick: (e: React.MouseEvent) => void }) => {
    const handleNavigateToMarkets = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering the main onClick
      // Set the active tab to Markets before navigating
      const marketsTab = document.querySelector('[data-tab="Markets"]') as HTMLElement;
      if (marketsTab) {
        marketsTab.click(); // This will trigger the onClick handler that sets activeTab
      }
      router.push(`/markets?stock=${stock.Ticker}&userId=${user?.UserID}`);
    };

    // Check if stock data is valid
    const hasValidPrice = typeof stock.CurrentPriceDollars === 'number' && stock.CurrentPriceDollars > 0;
    const hasValidChange = typeof stock.ChangedPriceDollars === 'number' && typeof stock.ChangedPercent === 'number';

    return (
      <div 
        className="flex justify-between items-center p-4 bg-white/[0.03] rounded-xl border border-white/5 transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* AI Analysis Icon */}
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-cyan-400/30 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-cyan-400/30 hover:to-purple-500/30"
            onClick={handleNavigateToMarkets}
            title="AI Market Analysis"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-cyan-400"
            >
              <path 
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                fill="currentColor"
              />
              <path 
                d="M19 15L19.74 18.26L23 19L19.74 19.74L19 23L18.26 19.74L15 19L18.26 18.26L19 15Z" 
                fill="currentColor"
              />
              <path 
                d="M5 15L5.74 18.26L9 19L5.74 19.74L5 23L4.26 19.74L1 19L4.26 18.26L5 15Z" 
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base">{stock.Ticker}</div>
            <div className="text-white/70 text-sm">{stock.Name}</div>
          </div>
        </div>
        <div className="text-right flex items-center gap-4 ml-4">
          {/* Price and Change Info - Now side by side */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-base">
                {hasValidPrice ? formatCurrency(stock.CurrentPriceDollars) : 'Loading...'}
              </div>
            </div>
            {hasValidChange && (
              <>
                <div className={`text-sm ${stock.ChangedPriceDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.ChangedPriceDollars >= 0 ? '+' : ''}{formatCurrency(stock.ChangedPriceDollars)}
                </div>
                <div className={`text-sm ${stock.ChangedPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({stock.ChangedPercent >= 0 ? '+' : ''}{stock.ChangedPercent.toFixed(2)}%)
                </div>
              </>
            )}
          </div>
          {/* Eye Icon - always visible */}
          <Eye className="text-gray-400 cursor-pointer" onClick={onEyeClick}/>
        </div>
      </div>
    );
  };

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

  const WatchlistItem = ({ stockWatchlist, deleteStockFromWatchlist } : 
    { 
      stockWatchlist: StockWatchlist, 
      deleteStockFromWatchlist: (stockId: number) => void
    }) => (
    <div className="group flex justify-between items-center py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center">
        {(
          <span
            className="absolute right-3 mr-3"
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        ) /* placeholder for layout shift prevention */}
        {(
          <span className="group-hover:inline-block hidden cursor-pointer">
            <EyeOff
              size={18}
              className="text-red-500 hover:text-red-400 mr-3"
              onClick={() => deleteStockFromWatchlist(stockWatchlist.StockId)}
            />
          </span>
        )}
        <div>
          <div className="font-bold">{stockWatchlist.StockTicker}</div>
          <div className="text-white/70 text-sm">{stockWatchlist.StockName}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold">{formatCurrency(stockWatchlist.TargetPriceDollars)}</div>
        <div className={`text-sm ${stockWatchlist.DiffPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stockWatchlist.DiffPriceDollars >= 0 ? '+' : ''}{formatCurrency(stockWatchlist.DiffPriceDollars)} ({stockWatchlist.DiffPercent >= 0 ? '+' : ''}{stockWatchlist.DiffPercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  );

  const watchlistNotification = useCallback((stockWatchlist: StockWatchlist[]) => {
    for(const watch of stockWatchlist) {
      if (watch.DiffPercent == 0) {
        // Call showNotificationUtil directly to avoid circular dependency
        if(user && user.NotificationsOn) {
          showNotificationUtil(`Watchlist Alert: ${watch.StockTicker}`, {
            body: `Target price (${formatCurrency(watch.TargetPriceDollars)}) acheived!!`
          });
        }
      }
    }
  }, [user]); // Only depend on user, not showNotification

  const setDashboardData = useCallback((data: Dashboard) => {
    // Ensure stocks have valid numeric values
    const validatedStocks = (data.Stocks || []).map(stock => ({
      ...stock,
      CurrentPriceDollars: typeof stock.CurrentPriceDollars === 'number' ? stock.CurrentPriceDollars : 0,
      ChangedPriceDollars: typeof stock.ChangedPriceDollars === 'number' ? stock.ChangedPriceDollars : 0,
      ChangedPercent: typeof stock.ChangedPercent === 'number' ? stock.ChangedPercent : 0,
      OpeningPriceDollars: typeof stock.OpeningPriceDollars === 'number' ? stock.OpeningPriceDollars : 0
    }));
    
    console.log('Setting dashboard data with validated stocks:', validatedStocks);
    
    setStocks(validatedStocks);
    setHoldings(data.Holdings == null ? [] : data.Holdings);
    setPortfolioValue(data.PortfolioValueDollars || 0);
    setTotalPnL(data.TotalPnLDollars || 0);
    setTotalPnLPercent(data.TotalReturnPercent || 0);
    setTotalHoldingValue(data.TotalHoldingValueDollars || 0);
    setWatchList(data.StockWatchlist == null ? [] : data.StockWatchlist);
    setLastUpdateTime(new Date())
    // Call watchlistNotification separately to avoid circular dependency
    watchlistNotification(data.StockWatchlist || []);
  }, []) // No dependencies to avoid circular dependency

  const loadDashboard = useCallback(async () => {
    const session = await getSession(); 
    const token = session?.backendToken || ""
    const data = await getDashboardData(user?.UserID || 0, token);
    if(data == null){
      console.error('Failed to fetch dashboard data');
      return;
    }
    setDashboardData(data);
  }, [user?.UserID]); // Only depend on user?.UserID, not setDashboardData

  useEffect(() => {
    if (user?.UserID) {
      loadDashboard();
    }
  }, [loadDashboard]); // Only depend on loadDashboard

  const [dashboardWsStatus, setDashboardWsStatus] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isWebSocketDataLoading, setIsWebSocketDataLoading] = useState(false);
  const searchParams = useSearchParams();
  const userIdForWS = useMemo(() => Number(searchParams.get('userId')) || 0, [searchParams]);

  useEffect(() => {
    // This effect runs once when the component mounts.
    // It's responsible for establishing and managing the WebSocket connection.

    // The URL of your Go backend's WebSocket endpoint.
    // In development, this is localhost. For cloud deployment, you'd use a different URL
    // from an environment variable, e.g., `process.env.NEXT_PUBLIC_WEBSOCKET_URL`.

    const wsUrl = process.env.NEXT_PUBLIC_API_WS;
    
    // Debug: Log the WebSocket URL being used
    console.log('Attempting to connect to WebSocket:', wsUrl+`/dashboard?userId=${userIdForWS}`);
    
    // Check if we have a valid userId before attempting connection
    if (!userIdForWS || userIdForWS === 0) {
      console.log('No valid userId, skipping WebSocket connection');
      return;
    }

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
        setIsWebSocketDataLoading(true);
        // The data from the server is a JSON string. We need to parse it.
        const rawData = JSON.parse(event.data);
        console.log('Raw WebSocket data received:', rawData);
        
        // Check if the data has the expected structure
        if (rawData && typeof rawData === 'object') {
          // If the data is already in Dashboard format, use it directly
          if (rawData.Stocks && Array.isArray(rawData.Stocks)) {
            console.log('Data is in Dashboard format, using directly');
            const dashboard: Dashboard = rawData;
            setDashboardData(dashboard);
          } 
          // If the data is just an array of stocks, wrap it in a Dashboard object
          else if (Array.isArray(rawData)) {
            console.log('Data is array of stocks, wrapping in Dashboard format');
            const dashboard: Dashboard = {
              User: user || new User(0, '', '', 0, '', '', false),
              Stocks: rawData,
              Holdings: holdings, // Keep existing holdings
              StockWatchlist: watchlist, // Keep existing watchlist
              TotalHoldingValueDollars: totalHoldingValue,
              PortfolioValueDollars: portfolioValue,
              TotalPnLDollars: totalPnL,
              TotalReturnPercent: totalPnLPercent
            };
            setDashboardData(dashboard);
          }
          // If it's a single stock update, update the specific stock
          else if (rawData.StockID && rawData.Ticker) {
            console.log('Data is single stock update, updating specific stock');
            setStocks(prevStocks => 
              prevStocks.map(stock => 
                stock.StockID === rawData.StockID ? rawData : stock
              )
            );
          }
          else {
            console.log('Unknown data format, attempting to use as Dashboard');
            const dashboard: Dashboard = rawData;
            setDashboardData(dashboard);
          }
        } else {
          console.error('Invalid WebSocket data format:', rawData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        console.error('Raw message data:', event.data);
      } finally {
        setIsWebSocketDataLoading(false);
      }
    };

    // Event handler for any errors that occur.
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket URL attempted:', wsUrl+`/dashboard?userId=${userIdForWS}`);
      setDashboardWsStatus(false);
    };

    // Event handler for when the connection is closed.
    ws.onclose = (event) => {
      console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
      setDashboardWsStatus(false);
    };

    // This is a cleanup function.
    // It will be called when the component is unmounted (e.g., if you navigate to another page).
    // This is crucial for preventing memory leaks by closing the connection.
    return () => {
      ws.close();
    };
  }, [userIdForWS]); // Only depend on userIdForWS, not setDashboardData which changes on every render

  const addStockToWatchlistApiCall = async (stockId: number, targetPriceStr: string) => {

    console.log(`Adding stock ${stockId} to watchlist with target price ${targetPriceStr}`);
    if (!user?.UserID || !stockId || !targetPriceStr) return;
    const targetPrice = parseFloat(targetPriceStr);
    if (isNaN(targetPrice) || targetPrice <= 0) {
        console.error('Invalid target price');
        return;
    }
    const session = await getSession(); 
    const token = session?.backendToken || ""
    const response = await addStockToWatchlist(user?.UserID, stockId, targetPrice, token);
    if (response == "") {
        console.log(`Added stock ${stockId} to watchlist with target price ${targetPrice}`);
        setPopup(null); // Close the popup after adding
        loadDashboard();

        for(const stock of stocks) {
          if (stock.StockID === stockId) {
            showNotification(`Watchlist Updated`, {
              body: `Added stock ${stock.Ticker} to watchlist with target price ${formatCurrency(targetPrice)}`
            });
            break;
          }
        }
         
    } else {
        console.error('Failed to add stock to wathchlist: '+response);
        for(const stock of stocks) {
          if (stock.StockID === stockId) {
            showNotification(`Failed to update watchlist`, {
              body: `Failed to add stock ${stock.Ticker} to watchlist: ${response}`
            });
            break;
          }
        }
    }
  };

  const [popup, setPopup] = useState<{ x: number, y: number, stockId: number, stockPrice: number } | null>(null);

  const handleEyeClick = (event: React.MouseEvent, stock: Stock) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopup({
      x: rect.left + window.scrollX - 215 + rect.width / 2, // center popup
      y: rect.top + window.scrollY - 110, // above the icon
      stockId: stock.StockID,
      stockPrice: stock.CurrentPriceDollars
    });
  };

  const handleDeleteStockFromWatchlist = async (stockId: number) => {
    if (!user?.UserID || !stockId) return;
    const session = await getSession(); 
    const token = session?.backendToken || ""
    const response = await deleteStockFromWatchlist(user?.UserID, stockId, token); // Assuming 0 means delete
    if (response == "") {
      console.log(`Deleted stock ${stockId} from watchlist`);
      loadDashboard(); // Refresh the dashboard to reflect changes
      showNotification(`Watchlist Updated`, {
        body: `Deleted stock from watchlist`
      });
    } else {
      console.error('Failed to delete stock from watchlist: ' + response);
      showNotification(`Failed to update watchlist`, {
        body: `Failed to delete stock from watchlist: ${response}`
      });
    }
  };

  // Hydration-safe formatted time for last update
  const [formattedTime, setFormattedTime] = useState('');
  useEffect(() => {
    setFormattedTime(
      lastUpdateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' +
      lastUpdateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  }, [lastUpdateTime]);

  return (
    <section className="relative section-padding flex min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white mt-17">
      <div className="w-full px-6 lg:px-12 pt-20 relative">


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
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      {isWebSocketDataLoading && (
                        <span className="text-xs text-cyan-400">Processing...</span>
                      )}
                    </div>
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
                  Last updated:&nbsp;&nbsp;{formattedTime}&nbsp;&nbsp; (Updates every 15 seconds)
                    </span>
                 </div>
              </div>
              <div className="space-y-3">
                {stocks.map((stock) => (
                  <StockItem 
                    key={stock.StockID} 
                    stock={stock} 
                    onClick={() => {
                      // Handle stock click, e.g., navigate to stock details page
                      console.log(`Clicked on stock: ${stock.Ticker}`);
                      }
                    }
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
                {/* Stock Dropdown and Quantity Input - Side by Side */}
                <div className="flex gap-3">
                  {/* Stock Dropdown - 70% */}
                  <div className="relative stock-dropdown z-[999] flex-[0.7]">
                    <input
                      type="text"
                      placeholder="Search stock (e.g., AAPL)"
                      value={stockSearchTerm}
                      onChange={(e) => {
                        setStockSearchTerm(e.target.value);
                        setIsStockDropdownOpen(true);
                      }}
                      onFocus={() => setIsStockDropdownOpen(true)}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                    {isStockDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl backdrop-blur-lg z-50 max-h-40 overflow-y-auto">
                        {stocks
                          .filter(stock => 
                            stock.Ticker.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                            stock.Name.toLowerCase().includes(stockSearchTerm.toLowerCase())
                          )
                          .slice(0, 8) // Limit to 8 results for better UX
                          .map((stock) => (
                            <button
                              key={stock.StockID}
                              onClick={() => {
                                setTradeSymbol(stock.Ticker);
                                setStockSearchTerm(stock.Ticker);
                                setIsStockDropdownOpen(false);
                              }}
                              className="w-full p-3 text-left hover:bg-white/[0.05] transition-colors border-b border-white/5 last:border-b-0"
                            >
                              <div className="font-bold">{stock.Ticker}</div>
                              <div className="text-white/70 text-sm">{stock.Name}</div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Input - 30% */}
                  <div className="flex-[0.3]">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Quantity Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quantityOptions.map((quantity) => (
                    <button
                      key={quantity}
                      onClick={() => setTradeQuantity(quantity.toString())}
                      className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-full text-sm text-white transition-all duration-300 hover:border-cyan-400/50"
                    >
                      {quantity}
                    </button>
                  ))}
                </div>

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
            </div>

            {/* Watchlist */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold">Watchlist</h3>
              </div>
              <div>
                {watchlist.map((stockWatchlist: StockWatchlist) => (
                  <WatchlistItem 
                    key={stockWatchlist.StockTicker} 
                    stockWatchlist={stockWatchlist} 
                    deleteStockFromWatchlist={handleDeleteStockFromWatchlist}
                  />
                ))}
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
            setPopup={setPopup}
            onAdd={val => addStockToWatchlistApiCall(popup.stockId, val)}
          />
        )}
      </div>
    </section>
  );
};

export default TradingDashboard;