const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const upload = require("../middleware/upload")
const c = require("../controllers/storyController")

router.use(auth)

router.get("/", c.getStoriesFeed)
router.post("/", upload.single("image"), c.createStory)
router.post("/repost/:postId", c.repostToStory)
router.get("/archive", c.getArchive)
router.get("/archive/:id/image", c.getArchiveImage)
router.get("/highlights", c.getHighlights)
router.post("/highlights", c.createHighlight)
router.get("/user/:userId", c.getUserStories)
router.post("/:id/view", c.viewStory)
router.get("/:id/viewers", c.getViewers)
router.delete("/:id", c.deleteStory)

module.exports = router
