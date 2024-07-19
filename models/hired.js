const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const HiredSchema = new mongoose.Schema({
    Freelancerid: {
        type: ObjectId,
    },
    postid: {
        type: ObjectId,
    },
    Coverletter: {
        type: String
    },
    status: {
        type: String,
    },
    // other fields as needed
});

const Hired = mongoose.model('Hired', HiredSchema);

module.exports.Hired = Hired;
