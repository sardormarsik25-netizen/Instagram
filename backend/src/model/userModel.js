const mongoose = require("mongoose")

const highlightSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 24 },
    storyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "InstaStory" }],
})

const userModel = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // never returned unless asked with .select("+password")
    },
    fullName: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 150 },
    note: {
        text: { type: String, maxlength: 60 },
        expiresAt: Date,
    },
    avatar: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "InstaUser" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "InstaUser" }],
    highlights: { type: [highlightSchema], select: false },
}, { timestamps: true })

module.exports = mongoose.model("InstaUser", userModel)
