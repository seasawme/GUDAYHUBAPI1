const express = require("express");
const router = express.Router();
const { Complaint } = require("../models/complaint");


router.get("/readcomplaint", async (req, res) => {
  try {

    await Complaint.find()
    .then((Complaint) => res.json(Complaint));
  } catch (error) {
    console.log("errorr", error.message);
    res.status(500).send("server error while reading complaint");
  }
});

//to write complaint
router.post('/writecomplaint', async (req, res) => {
  try {
    const { Fullname, email, complaint, number, Userid, Date } = req.body;

    const newComplaint = new Complaint({
      Fullname,
      email,
      complaint,
      number,
      Userid,
      Date: Date || new Date() // Set the date to the current date if not provided
    });

    await newComplaint.save();
    res.json({ message: 'Complaint saved successfully' });
  } catch (error) {
    console.log('Error posting complaint:', error.message);
    res.status(500).send('Server error while saving complaint');
  }
});

  module.exports = router;
