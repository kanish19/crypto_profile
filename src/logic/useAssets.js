import { useState, useMemo, useEffect } from 'react';

export const useAssets = () => {
    const [portfolio, setPortfolio] = useState(() => {
        const saved = localStorage.getItem('crypto_portfolio');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('crypto_portfolio', JSON.stringify(portfolio));
    }, [portfolio]);

    const addToPortfolio = (coin, quantity, buyPrice) => {
        setPortfolio(prev => {
            const existing = prev.find(item => item.id === coin.id);
            if (existing) {
                return prev.map(item =>
                    item.id === coin.id
                        ? {
                            ...item,
                            quantity: item.quantity + parseFloat(quantity),
                            buyPrice: (item.buyPrice * item.quantity + parseFloat(buyPrice) * parseFloat(quantity)) / (item.quantity + parseFloat(quantity))
                        }
                        : item
                );
            }
            return [...prev, {
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                image: coin.image,
                quantity: parseFloat(quantity),
                buyPrice: parseFloat(buyPrice)
            }];
        });
    };

    const removeFromPortfolio = (coinId) => {
        setPortfolio(prev => prev.filter(item => item.id !== coinId));
    };

    const calculateTotals = (currentPrices) => {
        let totalValue = 0;
        let totalCost = 0;

        const portfolioWithData = portfolio.map(item => {
            const liveData = currentPrices[item.id];
            const currentPrice = liveData ? liveData.usd : item.buyPrice;
            const currentValue = item.quantity * currentPrice;
            const costBasis = item.quantity * item.buyPrice;
            const gainLoss = currentValue - costBasis;
            const gainLossPercentage = costBasis !== 0 ? (gainLoss / costBasis) * 100 : 0;

            totalValue += currentValue;
            totalCost += costBasis;

            return {
                ...item,
                currentPrice,
                currentValue,
                gainLoss,
                gainLossPercentage,
                priceChange24h: liveData?.usd_24h_change || 0
            };
        });

        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercentage = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return {
            portfolioWithData,
            totalValue,
            totalGainLoss,
            totalGainLossPercentage
        };
    };

    return {
        portfolio,
        addToPortfolio,
        removeFromPortfolio,
        calculateTotals
    };
};
