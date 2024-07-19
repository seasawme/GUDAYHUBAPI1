const mongoose = require("mongoose");


const codeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  verificationCode: { type: String },
  codeExpiry: { type: Date }

});

const Vcode = mongoose.model('Vcode', codeSchema);
module.exports.Vcode = Vcode;






