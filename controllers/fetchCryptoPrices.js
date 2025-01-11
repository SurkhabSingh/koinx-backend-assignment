require("dotenv").config();
const axios = require("axios");
const modelDB = require("../models/cryptoPrice");

const coinIds = ["bitcoin", "ethereum", "matic-network"];

const handleFetchSingleCoinData = async (coinId, saveToDB = false) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-pro-api-key": process.env.COINGECKO_API_KEY,
    },
  };

  try {
    const response = await axios(url, options);
    const data = response.data;

    if (saveToDB) {
      await modelDB
        .create({
          coinId: data.id,
          coinName: data.name,
          current_price: data.market_data.current_price.usd,
          market_cap: data.market_data.market_cap.usd,
          change24h: data.market_data.price_change_24h,
        })
        .then(() => console.log(`successfully saved ${data.id} to DB`))
        .catch((err) => console.log("error", err));
    }

    return {
      coinId: data.id,
      coinName: data.name,
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      change24h: data.market_data.price_change_24h,
    };
  } catch (error) {
    console.error(`Error fetching data for ${coinId}:`, error);
  }
};

const handleFetchAllCoinsDataAndPushToDb = async () => {
  const coinDataPromises = coinIds.map((coinId) =>
    handleFetchSingleCoinData(coinId, true)
  );
  const coinDataArray = await Promise.all(coinDataPromises);
};

const handleCalculateStandardDeviation = (prices) => {
  if (prices.length === 0) return 0;
  const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
  const variance =
    prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) /
    prices.length;
  return Math.sqrt(variance);
};

const pingServer = () => {
  const url =
    "https://koinx-backend-assignment-tccl.onrender.com/api/stats/bitcoin";
  axios
    .get(url)
    .then(() => console.log(`Server pinged: ${url}`))
    .catch((err) => console.log("Error pinging server"));
};

module.exports = {
  handleFetchAllCoinsDataAndPushToDb,
  handleFetchSingleCoinData,
  handleCalculateStandardDeviation,
  pingServer,
};
