require("dotenv").config();
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const modelDB = require("../models/cryptoPrice");

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
        .catch((error) => console.error("error", error.code));
    }

    return {
      coinId: data.id,
      coinName: data.name,
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      change24h: data.market_data.price_change_24h,
    };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log("Rate limit hit, retrying...");
    } else if (error.response && error.response.status === 400) {
      console.log("Bad request, check coinId and request format");
    } else {
      console.error(`Error fetching data for ${coinId}`, error);
    }
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
    .catch((error) => console.error("Error pinging server", error.code));
};

module.exports = {
  handleFetchAllCoinsDataAndPushToDb,
  handleFetchSingleCoinData,
  handleCalculateStandardDeviation,
  pingServer,
};
