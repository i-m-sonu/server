const mongoose = require('mongoose');

async function connectToDb() {
    await mongoose.connect("mongodb://localhost:27017/fitnshop", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log("DB connected");
};

module.exports = connectToDb;