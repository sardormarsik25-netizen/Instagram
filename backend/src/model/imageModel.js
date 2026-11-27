const mongoose = require("mongoose")

// Images are stored inside MongoDB so they survive redeploys.
// They are served by GET /images/:id
const imageModel = new mongoose.Schema({
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "InstaUser", required: true },
}, { timestamps: true })

module.exports = mongoose.model("InstaImage", imageModel)
