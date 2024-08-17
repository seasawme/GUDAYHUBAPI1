const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const VerificationScheduleSchema = new Schema({
  freelancerId: {
    type: ObjectId,
    required: true,
  },
  verificationDate: {
    type: Date,
    required: true,
  },
  verificationTime: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Canceled'],
    default: 'Scheduled',
  },
  notes: {
    type: String,
  }
});

const VerificationSchedule = mongoose.model("VerificationSchedule", VerificationScheduleSchema);

module.exports.VerificationSchedule = VerificationSchedule;

