const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ComplaintSchema = new mongoose.Schema({
    Fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    number: {
        type: String,
    },
    Userid: {
        type: ObjectId,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String,
        default: "Pending"
    }
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

module.exports.Complaint = Complaint;
