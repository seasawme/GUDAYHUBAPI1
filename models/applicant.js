const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ApplicantSchema = new mongoose.Schema({
    Freelancerid:{
        type: ObjectId,
        required: true
    },
    postid:{
        type: ObjectId,
        required: true
    },
    Coverletter:{
        type: String,
    },
    status:{
        type: String,
    },appliedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    interivewDate:{
        type: Date,
    },
    interivewTime:{
        type: String,
    },
    interviewInfo:{
        type: String,
    },
    interviewType:{
        type: String,
    }
});
 const applicant = mongoose.model("applicant", ApplicantSchema);

module.exports.applicant =applicant