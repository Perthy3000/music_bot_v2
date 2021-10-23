const mongoose = require("mongoose");

const { Schema } = mongoose;

const channelSchema = new Schema(
    {
        server_id: String,
        channel_id: String,
        channel_name: String,
        message_id: String,
    },
    { collection: "Channel" }
);

module.exports = mongoose.model("channel", channelSchema);
