const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const joi = require("joi");
const { Schema } = mongoose;

const portfolioSchema = new Schema({
  link: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return (v === null && this.title === null) || (v !== null && this.title !== null);
      },
      message: props => `Link must have a corresponding title`
    }
  },
  title: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return (v === null && this.link === null) || (v !== null && this.link !== null);
      },
      message: props => `Title must have a corresponding link`
    }
  }
});

const DataSchema = new mongoose.Schema({
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
    portfolio: portfolioSchema,
    employerprofile: {
      profilepic: { type: String, default: null },
    },
  },
});

const User = mongoose.model("users", DataSchema);

module.exports.User = User;
