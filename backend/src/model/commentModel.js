const mongoose = require("mongoose")

const commentModel = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "InstaPost", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "InstaUser", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true })

module.exports = mongoose.model("InstaComment", commentModel)
