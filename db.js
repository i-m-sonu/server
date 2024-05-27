const mongoose = require('mongoose');

async function connectToDb() {
  try {
    await mongoose.connect("mongodb://localhost:27017/fitnshop", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

module.exports = connectToDb;
