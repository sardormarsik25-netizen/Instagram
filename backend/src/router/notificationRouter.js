const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const c = require("../controllers/notificationController")

router.use(auth)

router.get("/", c.getNotifications)
router.get("/unread-count", c.getUnreadCount)
router.patch("/read-all", c.readAll)
router.patch("/:id/read", c.readOne)

module.exports = router
