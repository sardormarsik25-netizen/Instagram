const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const upload = require("../middleware/upload")
const c = require("../controllers/postController")

router.use(auth)

router.get("/", c.getFeed)
router.post("/", upload.single("image"), c.createPost)
router.get("/:id", c.getPost)
router.delete("/:id", c.deletePost)
router.post("/:id/like", c.toggleLike)
router.get("/:id/comments", c.getComments)
router.post("/:id/comments", c.addComment)
router.delete("/:id/comments/:commentId", c.deleteComment)

module.exports = router
