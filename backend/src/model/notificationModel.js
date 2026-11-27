const mongoose = require("mongoose")

const notificationModel = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "InstaUser", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "InstaUser", required: true },
    type: { type: String, enum: ["like", "comment", "follow", "repost"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "InstaPost", default: null },
    text: { type: String, default: "" }, // comment text for "comment" type
    read: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model("InstaNotification", notificationModel)
