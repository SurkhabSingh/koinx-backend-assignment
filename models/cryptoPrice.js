const mongoose = require("mongoose");

const cryptoPriceSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  coinName: { type: String, required: true },
  current_price: { type: Number, required: true },
  market_cap: { type: Number, required: true },
  change24h: { type: Number, required: true },
  fetchedAt: { type: Date, default: Date.now() },
});

const modelDB = mongoose.model("cryptoPrice", cryptoPriceSchema);

module.exports = modelDB;
