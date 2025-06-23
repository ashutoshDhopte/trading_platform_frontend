'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLoading } from '@/components/LoadingContext';
import { formatCurrency } from '@/lib/util';
import { getStocks, getStockNews } from '@/lib/api';
import { Stock, MarketData } from '@/type/model';
import { ChevronDown, MessageCircle, ExternalLink } from 'lucide-react';
import { getSession } from 'next-auth/react';


const MarketsPage = () => {
    const { showLoading, hideLoading } = useLoading();
    const searchParams = useSearchParams();
    const stockParam = searchParams.get('stock');
    
    // State for dynamic data
    const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { id: 1, type: 'bot', message: 'Hello! I\'m your market assistant. How can I help you with market analysis today?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isLoadingOlderNews, setIsLoadingOlderNews] = useState(false);
    const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set());
    const [newArticlesCount, setNewArticlesCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreNews, setHasMoreNews] = useState(true);

    // Load available stocks on component mount
    const loadStocks = async () => {
        try {
            showLoading();
            const session = await getSession();
            const token = session?.backendToken || "";
            const stocks = await getStocks(token);
            
            if (stocks && stocks.length > 0) {
                setAvailableStocks(stocks);
                
                // Set selected stock based on URL parameter or first stock
                if (stockParam) {
                    const foundStock = stocks.find(stock => stock.Ticker === stockParam);
                    if (foundStock) {
                        setSelectedStock(foundStock);
                    } else {
                        setSelectedStock(stocks[0]);
                    }
                } else {
                    setSelectedStock(stocks[0]);
                }
                
                // Reset pagination state
                setCurrentPage(1);
                setHasMoreNews(true);
                setNewArticlesCount(0);
                setExpandedArticles(new Set());
            }
        } catch (error) {
            console.error('Error loading stocks:', error);
        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        loadStocks();
    }, [stockParam]);

    // WebSocket connection for market data - following dashboard pattern
    useEffect(() => {
        if (!selectedStock) return;

        const wsUrl = process.env.NEXT_PUBLIC_API_WS;
        const ws = new WebSocket(`${wsUrl}/market?stockId=${selectedStock.StockID}`);

        // Event handler for when the connection is successfully opened.
        ws.onopen = () => {
            console.log('Market WebSocket connection established.');
        };

        // Event handler for receiving messages from the server.
        ws.onmessage = (event) => {
            try {
                // The data from the server is a JSON string. We need to parse it.
                const data: MarketData = JSON.parse(event.data);
                
                // Debug: Log the received data structure
                console.log('Received market data:', data);
                
                // Update stock data
                if (data.Stock) {
                    setMarketData(prev => prev ? { ...prev, Stock: data.Stock } : data);
                }
                
                // Handle news data - only add new articles
                if (data.News && Array.isArray(data.News)) {
                    setMarketData(prev => {
                        if (!prev) return data;
                        
                        // Get existing news IDs from the current state
                        const existingNewsIds = new Set(prev.News.map(news => news.newsArticleId));
                        
                        // Filter out news that already exist
                        const newNews = data.News.filter(news => !existingNewsIds.has(news.newsArticleId));
                        
                        if (newNews.length > 0) {
                            console.log(`Adding ${newNews.length} new news articles:`, newNews.map(n => n.newsArticleId));
                            // Add new news to the top of the list (newer first)
                            setNewArticlesCount(prev => prev + newNews.length);
                            return {
                                ...prev,
                                News: [...newNews, ...prev.News]
                            };
                        }
                        
                        return prev;
                    });
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        // Event handler for any errors that occur.
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Event handler for when the connection is closed.
        ws.onclose = () => {
            console.log('Market WebSocket connection closed.');
        };

        // This is a cleanup function.
        // It will be called when the component is unmounted or when selectedStock changes.
        return () => {
            ws.close();
        };
    }, [selectedStock?.StockID]); // Only depend on the StockID, not the entire selectedStock object

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        
        const userMessage = { id: Date.now(), type: 'user' as const, message: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        
        // Simulate bot response
        setTimeout(() => {
            const botResponse = { 
                id: Date.now() + 1, 
                type: 'bot' as const, 
                message: 'Thank you for your message. I\'m analyzing the market data for you...' 
            };
            setChatMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    const handleLoadOlderNews = async () => {
        if (!selectedStock || !hasMoreNews || isLoadingOlderNews) return;
        
        setIsLoadingOlderNews(true);
        showLoading();
        
        try {
            const session = await getSession();
            const token = session?.backendToken || "";
            const nextPage = currentPage + 1;
            
            const olderNews = await getStockNews(selectedStock.StockID, nextPage, token);
            
            if (olderNews && olderNews.length > 0) {
                // Append older news to the bottom of the current list
                setMarketData(prev => {
                    if (!prev) return prev;
                    
                    // Get existing news IDs to avoid duplicates
                    const existingNewsIds = new Set(prev.News.map(news => news.newsArticleId));
                    
                    // Filter out any duplicates
                    const uniqueOlderNews = olderNews.filter(news => !existingNewsIds.has(news.newsArticleId));
                    
                    if (uniqueOlderNews.length > 0) {
                        console.log(`Loaded ${uniqueOlderNews.length} older news articles from page ${nextPage}`);
                        setCurrentPage(nextPage);
                        
                        // If we got fewer articles than expected, assume no more pages
                        if (olderNews.length < 10) { // Assuming 10 articles per page
                            setHasMoreNews(false);
                        }
                        
                        return {
                            ...prev,
                            News: [...prev.News, ...uniqueOlderNews]
                        };
                    }
                    
                    return prev;
                });
            } else {
                // No more news available
                setHasMoreNews(false);
                console.log('No more news available');
            }
        } catch (error) {
            console.error('Error loading older news:', error);
        } finally {
            setIsLoadingOlderNews(false);
            hideLoading();
        }
    };

    const toggleArticleExpansion = (articleId: number) => {
        setExpandedArticles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(articleId)) {
                newSet.delete(articleId);
            } else {
                newSet.add(articleId);
            }
            return newSet;
        });
    };

    const handleNewsScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        if (target.scrollTop === 0 && newArticlesCount > 0) {
            setNewArticlesCount(0);
        }
    };

    const getSentimentColor = (score: number) => {
        if (score >= 0.5) return 'text-green-400';
        if (score <= -0.5) return 'text-red-400';
        return 'text-yellow-400';
    };

    const getSentimentBgColor = (score: number) => {
        if (score >= 0.5) return 'bg-green-400/20 border-green-400/30';
        if (score <= -0.5) return 'bg-red-400/20 border-red-400/30';
        return 'bg-yellow-400/20 border-yellow-400/30';
    };

    const getSentimentEmoji = (score: number) => {
        if (score >= 0.8) return '🚀';
        if (score >= 0.5) return '📈';
        if (score >= 0.2) return '😊';
        if (score >= -0.2) return '😐';
        if (score >= -0.5) return '😟';
        if (score >= -0.8) return '📉';
        return '💥';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-23 px-6 lg:px-12">
            

            {/* Stock Selection and Stats Row */}
            <div className="flex flex-col lg:flex-row gap-6 mb-4 mt-14">
                {/* Stock Dropdown */}
                <div className="lg:w-1/3">
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-lg hover:bg-white/[0.05] transition-all duration-300"
                        >
                            <div className="text-left">
                                <div className="font-bold text-lg">{selectedStock?.Ticker || 'Loading...'}</div>
                                <div className="text-white/70 text-sm">{selectedStock?.Name || 'Loading...'}</div>
                            </div>
                            <ChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl backdrop-blur-lg z-50 max-h-60 overflow-y-auto">
                                {availableStocks.map((stock) => (
                                    <button
                                        key={stock.StockID}
                                        onClick={() => {
                                            // Clear all data first
                                            setMarketData(null);
                                            setChatMessages([]);
                                            setChatInput('');
                                            
                                            // Set new stock
                                            setSelectedStock(stock);
                                            setIsDropdownOpen(false);
                                            
                                            // Reset pagination and UI state for new stock
                                            setCurrentPage(1);
                                            setHasMoreNews(true);
                                            setNewArticlesCount(0);
                                            setExpandedArticles(new Set());
                                        }}
                                        className="w-full p-4 text-left hover:bg-white/[0.05] transition-colors border-b border-white/5 last:border-b-0"
                                    >
                                        <div className="font-bold">{stock.Ticker}</div>
                                        <div className="text-white/70 text-sm">{stock.Name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stock Stats Card */}
                <div className="lg:w-2/3">
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl py-3 px-6 backdrop-blur-lg">
                        <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
                            <div>
                                <div className="text-white/70 text-sm mb-1">Current Price</div>
                                <div className="text-2xl font-bold">{marketData?.Stock?.CurrentPriceDollars ? formatCurrency(marketData.Stock.CurrentPriceDollars) : 'Loading...'}</div>
                            </div>
                            <div>
                                <div className="text-white/70 text-sm mb-1">Price Change</div>
                                <div className={`text-2xl font-bold mt-1 flex items-center gap-1 ${(marketData?.Stock?.ChangedPriceDollars ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {marketData?.Stock ? `${(marketData.Stock.ChangedPriceDollars ?? 0) >= 0 ? '+' : ''}${formatCurrency(marketData.Stock.ChangedPriceDollars ?? 0)} (${(marketData.Stock.ChangedPercent ?? 0) >= 0 ? '+' : ''}${(marketData.Stock.ChangedPercent ?? 0).toFixed(2)}%)` : 'Loading...'}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-white/70 text-sm mb-1 flex items-center gap-1">
                                    Sentiment 14EMA
                                    <div className="relative group">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-2 bg-gray-900 text-white/70 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                                            14 days Exponential Moving Average
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-xl font-bold flex items-center gap-2 ${getSentimentColor(marketData?.Stock?.OverallSentimentScore ?? 0)}`}>
                                    <span className="text-2xl">{getSentimentEmoji(marketData?.Stock?.OverallSentimentScore ?? 0)}</span>
                                    <span>{marketData?.Stock?.OverallSentimentScore ? `${(marketData.Stock.OverallSentimentScore * 100).toFixed(0)}%` : 'Loading...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="flex flex-col lg:flex-row gap-6 pb-8">
                {/* Market News Section (70%) */}
                <div className="lg:w-[70%]">
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-lg h-[550px] flex flex-col">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Market News</h2>
                                    <p className="text-white/70 text-sm mt-1">Latest news and sentiment analysis for {selectedStock?.Ticker}</p>
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm mt-1">
                                        Real-time news from{' '}
                                        <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors underline inline-flex items-center gap-1">
                                            finnhub.io
                                            <ExternalLink size={14} />
                                        </a>
                                        &nbsp;(Updated every 15 mins)
                                    </p>
                                    <p className="text-white/70 text-sm mt-1">
                                        Sentiment calculated using{' '}
                                        <a 
                                            href="https://huggingface.co/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline inline-flex items-center gap-1"
                                        >
                                            pre-trained model
                                            <ExternalLink size={14} />
                                        </a>
                                    </p>
                                    {newArticlesCount > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="bg-green-400/20 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {newArticlesCount} new
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setNewArticlesCount(0);
                                                    // Scroll to top of news container
                                                    const newsContainer = document.querySelector('.news-container');
                                                    if (newsContainer) {
                                                        newsContainer.scrollTop = 0;
                                                    }
                                                }}
                                                className="text-cyan-400 hover:text-cyan-300 text-sm"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto news-container" onScroll={handleNewsScroll}>
                            {marketData?.News.map((news) => {
                                const isExpanded = expandedArticles.has(news.newsArticleId);
                                const summaryText = news.articleSummary || '';
                                const summaryWords = summaryText.split(' ');
                                const maxWords = 30; // Show approximately 2 lines worth of words
                                const shouldShowExpand = summaryWords.length > maxWords;
                                const displaySummary = isExpanded 
                                    ? summaryText 
                                    : summaryWords.slice(0, maxWords).join(' ');
                                
                                
                                return (
                                    <div key={news.newsArticleId} className="p-6 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-lg pr-4">{news.articleTitle}</h3>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getSentimentBgColor(news.sentimentScore)} ${getSentimentColor(news.sentimentScore)}`}>
                                                <span className="text-base">{getSentimentEmoji(news.sentimentScore)}</span>
                                                <span>{(news.sentimentScore * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                        
                                        {/* Article Summary */}
                                        {summaryText && (
                                            <div className="mb-4">
                                                <div 
                                                    className={`text-white/80 text-sm leading-relaxed ${!isExpanded && shouldShowExpand ? 'overflow-hidden' : ''}`}
                                                    style={!isExpanded && shouldShowExpand ? {
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    } : {}}
                                                >
                                                    {displaySummary}
                                                    {!isExpanded && shouldShowExpand && (
                                                        <span className="text-white/50 font-bold">...</span>
                                                    )}
                                                    {(shouldShowExpand || summaryText.length > 50) && (
                                                        <span
                                                            onClick={() => toggleArticleExpansion(news.newsArticleId)}
                                                            className="ml-1 text-white hover:text-gray-300 cursor-pointer font-medium transition-colors"
                                                        >
                                                            {isExpanded ? ' (Show Less)' : ' (Show More)'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center">
                                            <a
                                                href={news.articleUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                                            >
                                                Read Full Article
                                                <ExternalLink size={14} />
                                            </a>
                                            <span className="text-white/50 text-xs">
                                                {news.publicationTime}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }) || (
                                <div className="p-6 text-center text-white/70">
                                    Loading news...
                                </div>
                            )}
                            
                            {/* Load Older News Button */}
                            <div className="p-6 border-t border-white/5">
                                {hasMoreNews ? (
                                    <button
                                        onClick={handleLoadOlderNews}
                                        disabled={isLoadingOlderNews}
                                        className="w-full bg-white/[0.05] hover:bg-white/[0.08] disabled:bg-white/[0.03] disabled:cursor-not-allowed border border-white/10 rounded-xl p-4 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        {isLoadingOlderNews ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-white/70">Loading older news...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-white">Load Older News</span>
                                                <ChevronDown className="text-white/70" />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center text-white/50 text-sm py-4">
                                        No more news available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chatbot Section (30%) */}
                <div className="lg:w-[30%]">
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-lg h-[550px] flex flex-col">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="text-cyan-400" />
                                <h2 className="text-xl font-bold">Market Assistant (Coming Soon)</h2>
                            </div>
                            <p className="text-white/70 text-sm mt-1">Ask questions about {selectedStock?.Ticker}</p>
                        </div>
                        
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-xl ${
                                            msg.type === 'user'
                                                ? 'bg-cyan-400/20 border border-cyan-400/30 text-cyan-100'
                                                : 'bg-white/[0.05] border border-white/10'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Chat Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about market trends..."
                                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketsPage; 