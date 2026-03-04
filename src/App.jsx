import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  PlusCircle,
  Search,
  Wallet,
  PieChart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMarketData, searchCoins, getSimplePrices } from './data/fetching';
import { useAssets } from './logic/useAssets';
import { Card, Button, Badge, Input } from './components/Elements';

const App = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [livePrices, setLivePrices] = useState({});

  const { portfolio, addToPortfolio, removeFromPortfolio, calculateTotals } = useAssets();

  // Fetch initial market data
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const data = await getMarketData();
      setCoins(data);

      // Also fetch live prices for portfolio items if any
      if (portfolio.length > 0) {
        const ids = portfolio.map(item => item.id);
        const prices = await getSimplePrices(ids);
        setLivePrices(prices);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch crypto data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = useMemo(() => {
    return coins.filter(coin =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coins, searchQuery]);

  const { portfolioWithData, totalValue, totalGainLoss, totalGainLossPercentage } = useMemo(() => {
    return calculateTotals(livePrices);
  }, [portfolio, livePrices, calculateTotals]);

  const handleAddCoin = (e) => {
    e.preventDefault();
    if (!selectedCoin || !amount || !buyPrice) return;

    addToPortfolio(selectedCoin, amount, buyPrice);
    setIsAddingMode(false);
    setSelectedCoin(null);
    setAmount('');
    setBuyPrice('');
    fetchMarketData(); // Refresh to get prices
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 lg:px-16 bg-[#05070a] text-[#f8fafc]">
      {/* Header / Stats Navigation */}
      <header className="sticky top-0 z-50 py-6 mb-8 glass-card border-none bg-black/40 backdrop-blur-xl -mx-4 md:-mx-8 lg:-mx-16 px-4 md:px-8 lg:px-16 flex flex-wrap items-center justify-between gap-6 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-neon">
            <TrendingUp className="text-black w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white outfit">Crypto<span className="text-cyan-400">Sphere</span></h1>
        </div>

        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex flex-col">
            <span className="text-xs text-[#64748b] uppercase tracking-widest font-bold">Total Portfolio</span>
            <span className="text-xl font-bold text-white outfit">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#64748b] uppercase tracking-widest font-bold">Total P/L</span>
            <div className={`flex items-center gap-1 font-bold outfit ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalGainLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>${Math.abs(totalGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalGainLossPercentage.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        <div className="relative group flex-1 max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

        {/* Market Overview Section */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-cyan-400" size={20} />
              <h2 className="text-xl font-bold outfit">Market Overview</h2>
            </div>
            <Button variant="secondary" className="p-2 rounded-lg" onClick={fetchMarketData}>
              <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            </Button>
          </div>

          <div className="md:hidden mb-4">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2"
            />
          </div>

          {loading && coins.length === 0 ? (
            <div className="h-64 glass-card flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-cyan-400" size={40} />
              <p className="text-[#64748b] font-medium">Syncing with blockchain...</p>
            </div>
          ) : error ? (
            <Card className="border-rose-500/20 bg-rose-500/5 text-center py-12">
              <X className="mx-auto text-rose-500 mb-4" size={40} />
              <p className="text-rose-400 font-semibold">{error}</p>
              <Button variant="secondary" className="mt-4" onClick={fetchMarketData}>Retry Connection</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode='popLayout'>
                {filteredCoins.map((coin) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={coin.id}
                  >
                    <Card className="group relative overflow-hidden flex items-center justify-between hover:border-cyan-500/30 p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full bg-white/5" />
                          <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                            <div className="text-[10px] font-bold px-1 text-white uppercase">{coin.symbol}</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight group-hover:text-cyan-400 transition-colors">{coin.name}</h3>
                          <p className="text-[#64748b] text-sm font-medium">MCap: ${(coin.market_cap / 1e9).toFixed(2)}B</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg outfit">${coin.current_price.toLocaleString()}</div>
                        <div className={`flex items-center justify-end gap-0.5 font-bold text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedCoin(coin); setIsAddingMode(true); }}
                        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center bg-cyan-500/0 hover:bg-cyan-500/20 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <PlusCircle size={24} />
                      </button>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Portfolio Table/Summary Section */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2">
            <PieChart className="text-purple-500" size={20} />
            <h2 className="text-xl font-bold outfit">Your Portfolio</h2>
          </div>

          <Card className="min-h-[400px] overflow-hidden flex flex-col p-0 border-white/5">
            {portfolio.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-[#64748b] border border-dashed border-white/20">
                  <Wallet size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Empty Vault</h3>
                  <p className="text-[#64748b] text-sm px-4">Start your journey by adding coins from the market grid.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {portfolioWithData.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold">{item.name}</div>
                          <div className="text-xs text-[#64748b]">{item.quantity} {item.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold outfit">${item.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className={`text-xs font-bold ${item.gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.gainLoss >= 0 ? '+' : ''}${Math.abs(item.gainLoss).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-[10px] uppercase font-bold text-[#64748b]">Avg Buy: ${item.buyPrice.toFixed(2)}</div>
                      <button
                        onClick={() => removeFromPortfolio(item.id)}
                        className="text-rose-500 hover:text-rose-400 text-xs font-bold"
                      >
                        Remove Asset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {portfolio.length > 0 && (
              <div className="p-4 mt-auto bg-white/5 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#64748b] mb-1">Portfolio Standing</p>
                    <Badge type={totalGainLoss >= 0 ? 'success' : 'danger'}>
                      {totalGainLossPercentage.toFixed(2)}% Performance
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#64748b]">Net Worth</p>
                    <p className="text-xl font-bold outfit text-cyan-400">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </aside>
      </main>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isAddingMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMode(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md glass-card p-8 relative z-10 border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <img src={selectedCoin?.image} className="w-12 h-12" alt="" />
                  <div>
                    <h2 className="text-2xl font-bold outfit">Add {selectedCoin?.name}</h2>
                    <p className="text-[#64748b] text-sm">Portfolio entry</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingMode(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X />
                </button>
              </div>

              <form onSubmit={handleAddCoin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#64748b] mb-2">Quantity Owned</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 0.5"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#64748b] mb-2">Buy Price (USD)</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder={`Market: $${selectedCoin?.current_price}`}
                    required
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full py-4 text-lg mt-4 shadow-cyan-500/20">
                  Secure in Portfolio
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center">
        <p className="text-[#64748b] text-sm font-medium">Powered by <span className="text-white">CoinGecko API</span> &bull; 2026 CryptoSphere</p>
      </footer>
    </div>
  );
};

export default App;
