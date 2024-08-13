const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const joi = require("joi");



const AdminSchema = new mongoose.Schema({
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
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },

});

const Admin = mongoose.model("admin", AdminSchema);

module.exports.Admin = Admin;
