const express = require("express");
const cron = require("node-cron");
const dotenv = require("dotenv");
const apiRouter = require("./routes/coinRoutes");
const { connectDB } = require("./connectDB");
const {
  handleFetchAllCoinsDataAndPushToDb,
} = require("./controllers/fetchCryptoPrices");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

connectDB(process.env.MONGODB_URL)
  .then(() => console.log("Db connected successfully"))
  .catch((err) => console.log("Error connecting to DB:", err));

cron.schedule("0 */2 * * *", () => {
  console.log("Fetching and saving coin data to DB");
  handleFetchAllCoinsDataAndPushToDb();
});

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
