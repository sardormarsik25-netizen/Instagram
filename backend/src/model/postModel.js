const mongoose = require("mongoose")

const postModel = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "InstaUser", required: true },
    image: { type: String, required: true }, // "/images/<id>"
    caption: { type: String, default: "", maxlength: 2200 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "InstaUser" }],
    commentsCount: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model("InstaPost", postModel)
