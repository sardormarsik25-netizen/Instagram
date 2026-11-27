const multer = require("multer")

// Express 5 sends errors from async controllers here automatically
const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE" ? "rasm 5 MB dan katta bo'lmasin" : err.message
        return res.status(400).json({ message })
    }
    if (err.name === "CastError") {
        return res.status(400).json({ message: "noto'g'ri id" })
    }
    if (err.status) {
        return res.status(err.status).json({ message: err.message })
    }

    console.log("server failed", err.message)
    res.status(500).json({ message: "server xatosi" })
}

module.exports = errorHandler
