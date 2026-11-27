const multer = require("multer")

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

// Keeps the file in memory (req.file.buffer); it is then saved into MongoDB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            const err = new Error("faqat rasm yuklash mumkin")
            err.status = 400
            return cb(err)
        }
        cb(null, true)
    },
})

module.exports = upload
