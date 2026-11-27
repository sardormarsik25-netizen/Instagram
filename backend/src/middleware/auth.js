const jwt = require("jsonwebtoken")

// Requires header: Authorization: Bearer <token>
// Puts the logged-in user's id into req.userId
const auth = (req, res, next) => {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null

    if (!token) {
        return res.status(401).json({ message: "token kerak, avval login qiling" })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.id
        next()
    } catch {
        return res.status(401).json({ message: "token yaroqsiz yoki muddati tugagan" })
    }
}

module.exports = auth
