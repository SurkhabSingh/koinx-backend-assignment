const { Router } = require("express");
const {
  handleFetchSingleCoinData,
  handleCalculateStandardDeviation,
} = require("../controllers/fetchCryptoPrices");
const modelDB = require("../models/cryptoPrice");
const router = Router();

router.get("/stats/:coin", async (req, res) => {
  const coin_id = req.params.coin;
  try {
    const result = await handleFetchSingleCoinData(coin_id, false);

    const filteredResult = {
      price: result.current_price,
      market_cap: result.market_cap,
      change24h: result.change24h,
    };
    return res.status(200).json(filteredResult);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/deviation/:coin", async (req, res) => {
  const coin_id = req.params.coin;

  try {
    const coinData = await modelDB
      .find({ coinId: coin_id })
      .sort({ fetchedAt: -1 })
      .limit(100);

    if (coinData.length === 0) {
      return res.status(404).json({ message: `No data found for ${coin_id}` });
    }

    const prices = coinData.map((record) => record.current_price);

    const deviation = handleCalculateStandardDeviation(prices);

    return res.status(200).json({ deviation: deviation.toFixed(2) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
