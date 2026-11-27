const imageModel = require("../model/imageModel")
const storyModel = require("../model/storyModel")

// GET /images/:id  - public, so it works in <img src="...">
const getImage = async (req, res) => {
    const story = await storyModel.findOne({ image: `/images/${req.params.id}`, type: "image" }).select("expiresAt")
    if (story?.expiresAt <= new Date()) return res.status(404).json({ message: "rasm topilmadi" })
    const image = await imageModel.findById(req.params.id)
    if (!image) return res.status(404).json({ message: "rasm topilmadi" })

    res.set("Content-Type", image.contentType)
    res.set("Cache-Control", story ? "no-store" : "public, max-age=31536000, immutable")
    res.set("X-Content-Type-Options", "nosniff")
    res.send(image.data)
}

module.exports = { getImage }
