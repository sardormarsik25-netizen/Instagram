const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const upload = require("../middleware/upload")
const c = require("../controllers/userController")

router.post("/login", c.login)
router.post("/register", c.register)
router.get("/users", c.getAllusers)

router.get("/me", auth, c.getMe)
router.patch("/me", auth, upload.single("avatar"), c.updateMe)
router.patch("/me/note", auth, c.updateNote)
router.get("/search", auth, c.searchUsers)
router.post("/:id/follow", auth, c.toggleFollow)

// keep "/:username" routes last, otherwise they catch "/me" and "/search"
router.get("/:username", auth, c.getProfile)
router.get("/:username/posts", auth, c.getUserPosts)
router.get("/:username/followers", auth, c.getFollowList("followers"))
router.get("/:username/following", auth, c.getFollowList("following"))

module.exports = router
