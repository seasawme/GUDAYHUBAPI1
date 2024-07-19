const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const DataSchema = new mongoose.Schema({
    Userid: {
    type: ObjectId,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

const testimony = mongoose.model("testimony", DataSchema);

module.exports.testimony = testimony;
