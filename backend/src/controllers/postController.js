const postModel = require("../model/postModel")
const commentModel = require("../model/commentModel")
const storyModel = require("../model/storyModel")
const notificationModel = require("../model/notificationModel")
const { httpError, saveImage, deleteImage, isSame, notify, USER_FIELDS, shortUser, postOut } = require("../utils/helpers")

const findPost = async (id) => {
    const post = await postModel.findById(id).populate("author", USER_FIELDS)
    if (!post) throw httpError(404, "post topilmadi")
    return post
}

// POST /posts  (multipart/form-data: image file, caption)
const createPost = async (req, res) => {
    const image = await saveImage(req.file, req.userId)
    const post = await postModel.create({ author: req.userId, image, caption: req.body.caption || "" })
    await post.populate("author", USER_FIELDS)
    res.status(201).json({ message: "post yaratildi", post: postOut(post, req.userId) })
}

// GET /posts?page=1&limit=10  - feed, newest first
const getFeed = async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50)

    const [posts, total] = await Promise.all([
        postModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("author", USER_FIELDS),
        postModel.countDocuments(),
    ])

    res.json({
        posts: posts.map((p) => postOut(p, req.userId)),
        page,
        hasMore: page * limit < total,
    })
}

// GET /posts/:id
const getPost = async (req, res) => {
    const post = await findPost(req.params.id)
    res.json({ post: postOut(post, req.userId) })
}

// DELETE /posts/:id  - only the author
const deletePost = async (req, res) => {
    const post = await postModel.findById(req.params.id)
    if (!post) throw httpError(404, "post topilmadi")
    if (!isSame(post.author, req.userId)) throw httpError(403, "faqat o'z postingizni o'chira olasiz")

    await Promise.all([
        commentModel.deleteMany({ post: post._id }),
        storyModel.deleteMany({ post: post._id }),
        notificationModel.deleteMany({ post: post._id }),
        deleteImage(post.image),
        post.deleteOne(),
    ])
    res.json({ message: "post o'chirildi" })
}

// POST /posts/:id/like  - like / unlike (toggle)
const toggleLike = async (req, res) => {
    const post = await postModel.findById(req.params.id)
    if (!post) throw httpError(404, "post topilmadi")

    const liked = post.likes.some((id) => isSame(id, req.userId))
    const updated = await postModel.findByIdAndUpdate(
        post._id,
        { [liked ? "$pull" : "$addToSet"]: { likes: req.userId } },
        { returnDocument: "after" },
    )

    if (!liked) await notify({ recipient: post.author, sender: req.userId, type: "like", post: post._id })

    res.json({ isLiked: !liked, likesCount: updated.likes.length })
}

// GET /posts/:id/comments
const getComments = async (req, res) => {
    const comments = await commentModel
        .find({ post: req.params.id })
        .sort({ createdAt: 1 })
        .populate("author", USER_FIELDS)

    res.json({
        comments: comments.map((c) => ({ _id: c._id, text: c.text, author: shortUser(c.author), createdAt: c.createdAt })),
    })
}

// POST /posts/:id/comments  { text }
const addComment = async (req, res) => {
    const text = (req.body.text || "").trim()
    if (!text) throw httpError(400, "izoh bo'sh bo'lmasin")

    const post = await postModel.findById(req.params.id)
    if (!post) throw httpError(404, "post topilmadi")

    const comment = await commentModel.create({ post: post._id, author: req.userId, text })
    await postModel.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } })
    await comment.populate("author", USER_FIELDS)
    await notify({ recipient: post.author, sender: req.userId, type: "comment", post: post._id, text })

    res.status(201).json({
        comment: { _id: comment._id, text: comment.text, author: shortUser(comment.author), createdAt: comment.createdAt },
    })
}

// DELETE /posts/:id/comments/:commentId  - comment author or post author
const deleteComment = async (req, res) => {
    const comment = await commentModel.findById(req.params.commentId)
    const post = await postModel.findById(req.params.id)
    if (!comment || !post || !isSame(comment.post, post._id)) throw httpError(404, "izoh topilmadi")
    if (!isSame(comment.author, req.userId) && !isSame(post.author, req.userId)) {
        throw httpError(403, "bu izohni o'chira olmaysiz")
    }

    await comment.deleteOne()
    await postModel.updateOne({ _id: post._id }, { $inc: { commentsCount: -1 } })
    res.json({ message: "izoh o'chirildi" })
}

module.exports = { createPost, getFeed, getPost, deletePost, toggleLike, getComments, addComment, deleteComment }
