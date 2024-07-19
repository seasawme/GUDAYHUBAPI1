const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const OfferSchema = new mongoose.Schema({
    Description: {
        type: String,
    },
    PostedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    price: {
        type: String,
        required: true
    },
    freelancerid: {
        type: ObjectId,
        required: true
    },
    employerid: {
        type: ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    message: {
        type: String,
    },
});

const Offer = mongoose.model("Offer", OfferSchema);

module.exports.Offer = Offer;
