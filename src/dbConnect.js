const mongoose = require("mongoose");

MONGO_URL = process.env.MONGO_URL;

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

exports.connectDb = async () => {
    try {
        await mongoose.connect(MONGO_URL, config);
        console.log("Connected to database");
    } catch (error) {
        console.log("Connection to database failed");
    }
};
