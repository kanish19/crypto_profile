const BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetch top cryptocurrency market data
 * @params {number} perPage - Number of results per page
 * @params {number} page - Page number
 * @returns {Promise<Array>}
 */
export const getMarketData = async (perPage = 50, page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    if (!response.ok) throw new Error('Failed to fetch market data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Search for coins
 * @params {string} query - Search query
 * @returns {Promise<Array>}
 */
export const searchCoins = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search?query=${query}`);
    if (!response.ok) throw new Error('Failed to search coins');
    const data = await response.json();
    return data.coins;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get simple price for specific coins (useful for portfolio updates)
 * @params {Array<string>} ids - Array of coin IDs
 * @returns {Promise<Object>}
 */
export const getSimplePrices = async (ids) => {
  if (!ids || ids.length === 0) return {};
  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!response.ok) throw new Error('Failed to fetch prices');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
