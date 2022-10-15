const mongoose = require("mongoose");

const connect = () => {
    mongoose.connect(process.env.MONGO_URI, {
        logger: process.env.NODE_ENV === "development",
        serverSelectionTimeoutMS: 5000,
        dbName: "production"
    });
    mongoose.connection.on("connected", () => {
        console.log(`MongoDB Connected ===>: ${process.env.MONGO_URI}`);
    });
}

module.exports = connect;