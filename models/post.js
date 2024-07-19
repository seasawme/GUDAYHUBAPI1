const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const PostSchema = new mongoose.Schema({
    JobTask: {
        type: String,
        required: true
    },
    Jobtype: {
        type: String,
        required: true
    },
    Jobtitle: {
        type: String,
        required: true
    },
    Description: {
        type: String,
    },
    Qualification: {
        type: String,
    },
    PostedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    Deadline: {
        type: Date,
        required: true
    },
    Salary: {
        type: String,
        required: true
    },
    Contact: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    urgency: {
        type: Boolean,
        required: true
    },
    employerid: {
        type: ObjectId,
        required: true
    },
    anonymous: {
        type: Boolean,
        required: true
    },
    cv: {
        type: Boolean,
        required: true
    },
    coverletter: {
        type: Boolean,
        required: true
    },
});

const Post = mongoose.model("Post", PostSchema);

module.exports.Post = Post;
