const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const joi = require("joi");
const { Schema } = mongoose;


const nonVerifiedUserSchema = new mongoose.Schema({
  _id: {
    type: ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  Usertype: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  language: {
    type: String,
    default: "en",
  },
  Fullname: {
    type: String,
    required: true,
  },
  Phonenumber: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  status:{
    type: String,
    default: 'active'
  },
  CreatedDate: {
    type: Date,
    default: Date.now
},
IsVerified: {
  type: Boolean,
  required: true,
},
VerifiedDoc: {
  type: String,
},
  freelancerprofile: {
    profilepic: { type: String, default: null },
    title: { type: String, default: null },
    skills: { type: [String], default: [] },
    cv: { type: String, default: null },
    additionaldoc: {
      educations: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
    },
    gudayhistory: {
      jobs: {
        type: Number,
        default: 0,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
      },
      hired: {
        type: Number,
        default: 0,
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
      },
    },
    workhistory: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    description: { type: String, default: null },
    portfolio: {
      link: { type: [String], default: [] },
      title: { type: [String], default: [] },
    },
    employerprofile: {
      profilepic: { type: String, default: null },
    },
  },
});

const nonVerifiedUsers = mongoose.model("nonVerifiedUsers", nonVerifiedUserSchema);

module.exports.nonVerifiedUsers = nonVerifiedUsers;
