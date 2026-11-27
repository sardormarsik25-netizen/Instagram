const notificationModel = require("../model/notificationModel")
const { httpError, USER_FIELDS, shortUser } = require("../utils/helpers")

// GET /notifications  - newest first
const getNotifications = async (req, res) => {
    const items = await notificationModel
        .find({ recipient: req.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", USER_FIELDS)
        .populate("post", "image")

    res.json({
        notifications: items.map((n) => ({
            _id: n._id,
            type: n.type, // like | comment | follow | repost
            sender: shortUser(n.sender),
            post: n.post ? { _id: n.post._id, image: n.post.image } : null,
            text: n.text,
            read: n.read,
            createdAt: n.createdAt,
        })),
    })
}

// GET /notifications/unread-count  - for the red badge
const getUnreadCount = async (req, res) => {
    const count = await notificationModel.countDocuments({ recipient: req.userId, read: false })
    res.json({ count })
}

// PATCH /notifications/read-all
const readAll = async (req, res) => {
    await notificationModel.updateMany({ recipient: req.userId, read: false }, { read: true })
    res.json({ message: "hammasi o'qildi" })
}

// PATCH /notifications/:id/read
const readOne = async (req, res) => {
    const n = await notificationModel.findOneAndUpdate(
        { _id: req.params.id, recipient: req.userId },
        { read: true },
        { returnDocument: "after" },
    )
    if (!n) throw httpError(404, "bildirishnoma topilmadi")
    res.json({ message: "o'qildi" })
}

module.exports = { getNotifications, getUnreadCount, readAll, readOne }
