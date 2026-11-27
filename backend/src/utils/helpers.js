const imageModel = require("../model/imageModel")
const notificationModel = require("../model/notificationModel")

// Throw this inside a controller to return an error response
const httpError = (status, message) => {
    const err = new Error(message)
    err.status = status
    return err
}

// Saves uploaded file (req.file) into MongoDB and returns its public path
const saveImage = async (file, ownerId) => {
    if (!file) throw httpError(400, "rasm tanlanmagan (field nomi: image)")
    const image = await imageModel.create({
        data: file.buffer,
        contentType: file.mimetype,
        size: file.size,
        owner: ownerId,
    })
    return `/images/${image._id}`
}

// Removes an image saved by saveImage ("/images/<id>")
const deleteImage = async (path) => {
    const id = path && path.split("/images/")[1]
    if (id) await imageModel.findByIdAndDelete(id)
}

const isSame = (a, b) => String(a) === String(b)

// Creates a notification, but never for your own action
const notify = async ({ recipient, sender, type, post = null, text = "" }) => {
    if (isSame(recipient, sender)) return
    await notificationModel.create({ recipient, sender, type, post, text })
}

const USER_FIELDS = "username fullName avatar"

const shortUser = (user) => user && ({
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar,
})

// Shape of a post in every API response
const postOut = (post, meId) => ({
    _id: post._id,
    image: post.image,
    caption: post.caption,
    author: shortUser(post.author),
    likesCount: post.likes.length,
    isLiked: post.likes.some((id) => isSame(id, meId)),
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
})

module.exports = { httpError, saveImage, deleteImage, isSame, notify, USER_FIELDS, shortUser, postOut }
