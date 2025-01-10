const mongoose = require("mongoose");
const connectDB = async (dbUrl) => {
  await mongoose.connect(dbUrl);
};
module.exports = { connectDB };
