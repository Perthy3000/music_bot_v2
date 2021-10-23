const mongoose = require("mongoose");

const { Schema } = mongoose;

const serverSchema = new Schema(
    {
        server_id: String,
        server_name: String,
    },
    { collection: "Server" }
);

module.exports = mongoose.model("server", serverSchema);
