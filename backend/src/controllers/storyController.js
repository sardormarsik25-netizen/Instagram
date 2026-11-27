const storyModel = require("../model/storyModel")
const postModel = require("../model/postModel")
const imageModel = require("../model/imageModel")
const userModel = require("../model/userModel")
const { isObjectIdOrHexString } = require("mongoose")
const { httpError, saveImage, deleteImage, isSame, notify, USER_FIELDS, shortUser } = require("../utils/helpers")

const storyOut = (story, meId) => ({
    _id: story._id,
    type: story.type,
    image: story.image,
    // for reposts: whose post is advertised (frontend shows "@username" link)
    post: story.post ? { _id: story.post._id, author: shortUser(story.post.author) } : null,
    viewed: story.viewers.some((id) => isSame(id, meId)),
    // only the owner sees how many people viewed
    viewersCount: isSame(story.author._id, meId) ? story.viewers.length : undefined,
    createdAt: story.createdAt,
    expiresAt: story.expiresAt,
})

// POST /stories  (multipart/form-data: image file)
const createStory = async (req, res) => {
    const image = await saveImage(req.file, req.userId)
    const story = await storyModel.create({ author: req.userId, type: "image", image })
    await story.populate("author", USER_FIELDS)
    res.status(201).json({ message: "istoriya qo'yildi", story: storyOut(story, req.userId) })
}

// POST /stories/repost/:postId  - share someone's post to your story
const repostToStory = async (req, res) => {
    const post = await postModel.findById(req.params.postId).populate("author", USER_FIELDS)
    if (!post) throw httpError(404, "post topilmadi")

    const story = await storyModel.create({ author: req.userId, type: "repost", image: post.image, post: post._id })
    await story.populate([{ path: "author", select: USER_FIELDS }, { path: "post", populate: { path: "author", select: USER_FIELDS } }])
    await notify({ recipient: post.author._id, sender: req.userId, type: "repost", post: post._id })

    res.status(201).json({ message: "post istoriyaga qo'yildi", story: storyOut(story, req.userId) })
}

// GET /stories  - active stories grouped by user (story bar)
const getStoriesFeed = async (req, res) => {
    const stories = await storyModel
        .find({ expiresAt: { $gt: new Date() } })
        .sort({ createdAt: 1 })
        .populate("author", USER_FIELDS)
        .populate({ path: "post", populate: { path: "author", select: USER_FIELDS } })

    const groups = new Map()
    for (const story of stories) {
        const key = String(story.author._id)
        if (!groups.has(key)) groups.set(key, { user: shortUser(story.author), stories: [] })
        groups.get(key).stories.push(storyOut(story, req.userId))
    }

    const result = [...groups.values()].map((g) => ({ ...g, allViewed: g.stories.every((s) => s.viewed) }))
    // own stories first, then unseen, then seen
    result.sort((a, b) => {
        if (isSame(a.user._id, req.userId)) return -1
        if (isSame(b.user._id, req.userId)) return 1
        return Number(a.allViewed) - Number(b.allViewed)
    })

    res.json({ groups: result })
}

// GET /stories/user/:userId  - one user's active stories
const getUserStories = async (req, res) => {
    const stories = await storyModel
        .find({ author: req.params.userId, expiresAt: { $gt: new Date() } })
        .sort({ createdAt: 1 })
        .populate("author", USER_FIELDS)
        .populate({ path: "post", populate: { path: "author", select: USER_FIELDS } })
    res.json({ stories: stories.map((s) => storyOut(s, req.userId)) })
}

const archiveQuery = (author) => ({ author, expiresAt: { $lte: new Date() } })

const getArchive = async (req, res) => {
    const stories = await storyModel.find(archiveQuery(req.userId)).select("createdAt").sort({ expiresAt: -1 })
    res.json({ stories })
}

const getArchiveImage = async (req, res) => {
    const story = await storyModel.findOne({ ...archiveQuery(req.userId), _id: req.params.id }).select("image")
    const imageId = story?.image?.split("/images/")[1]
    const image = imageId && await imageModel.findById(imageId)
    if (!image) throw httpError(404, "Rasm topilmadi")
    res.set("Content-Type", image.contentType)
    res.set("Cache-Control", "private, no-store")
    res.set("X-Content-Type-Options", "nosniff")
    res.send(image.data)
}

const getHighlights = async (req, res) => {
    const user = await userModel.findById(req.userId).select("+highlights")
    if (!user) throw httpError(404, "Foydalanuvchi topilmadi")
    const highlights = user.highlights || []
    const available = await storyModel.find({
        ...archiveQuery(req.userId), _id: { $in: highlights.flatMap((item) => item.storyIds) },
    }).distinct("_id")
    const valid = new Set(available.map(String))
    res.json({ highlights: highlights.map((item) => ({
        _id: item._id, name: item.name, storyIds: item.storyIds.filter((id) => valid.has(String(id))),
    })) })
}

const createHighlight = async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : ""
    const { storyIds } = req.body ?? {}
    if (!name || name.length > 24 || !Array.isArray(storyIds) || !storyIds.length || storyIds.length > 20 ||
        !storyIds.every((id) => typeof id === "string" && isObjectIdOrHexString(id))) {
        throw httpError(400, "Nom yozing va arxivdan 1–20 ta story tanlang")
    }
    const ids = [...new Set(storyIds.map((id) => id.toLowerCase()))]
    const count = await storyModel.countDocuments({ ...archiveQuery(req.userId), _id: { $in: ids } })
    if (count !== ids.length) throw httpError(400, "Tanlangan storylardan biri arxivda yo‘q")
    const user = await userModel.findOneAndUpdate(
        { _id: req.userId, "highlights.19": { $exists: false } },
        { $push: { highlights: { name, storyIds: ids } } },
        { returnDocument: "after", runValidators: true },
    ).select("+highlights")
    if (!user) throw httpError(409, "20 tadan ortiq Highlight saqlab bo‘lmaydi")
    res.status(201).json({ highlight: user.highlights.at(-1) })
}

// POST /stories/:id/view  - mark as viewed
const viewStory = async (req, res) => {
    const story = await storyModel.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.userId } })
    if (!story) throw httpError(404, "istoriya topilmadi")
    res.json({ viewed: true })
}

// GET /stories/:id/viewers  - only the owner
const getViewers = async (req, res) => {
    const story = await storyModel.findById(req.params.id).populate("viewers", USER_FIELDS)
    if (!story) throw httpError(404, "istoriya topilmadi")
    if (!isSame(story.author, req.userId)) throw httpError(403, "faqat o'z istoriyangizni ko'ra olasiz")
    res.json({ viewers: story.viewers.map(shortUser) })
}

// DELETE /stories/:id  - only the author
const deleteStory = async (req, res) => {
    const story = await storyModel.findById(req.params.id)
    if (!story) throw httpError(404, "istoriya topilmadi")
    if (!isSame(story.author, req.userId)) throw httpError(403, "faqat o'z istoriyangizni o'chira olasiz")

    // a repost uses the post's image, so only delete own uploaded images
    if (story.type === "image") await deleteImage(story.image)
    await story.deleteOne()
    res.json({ message: "istoriya o'chirildi" })
}

module.exports = { createStory, repostToStory, getStoriesFeed, getUserStories, getArchive, getArchiveImage, getHighlights, createHighlight, viewStory, getViewers, deleteStory }
