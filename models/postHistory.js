const mongoose = require('mongoose');

const postHistorySchema = new mongoose.Schema({
  JobTask: String,
  Jobtype: String,
  Jobtitle: String,
  Description: String,
  Qualification: String,
  PostedDate: String,
  Deadline: String,
  Salary: String,
  Contact: String,
  location: String,
  urgency: String,
  employerid: String,
  closedDate: { type: Date, default: Date.now }
});

const PostHistory = mongoose.model('PostHistory', postHistorySchema);

module.exports.PostHistory = PostHistory;
