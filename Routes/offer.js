const express = require("express");
const router = express.Router();
const { Offer } = require("../models/offer");
const { User } = require("../models/User");
const { sendOfferEmail } = require('../utils/sendNotificationEmail');


//to write offer
router.post("/write", async (req, res) => {
    try {
      const {
        Description,
        PostedDate,
        price,
        freelancerid,
        employerid,
        status
      } = req.body;
  
      const newOffer = new Offer({
        Description,
        PostedDate,
        price,
        freelancerid,
        employerid,
        status
      });
      await newOffer.save();

      const freelancer = await User.findById(freelancerid);
      if (!freelancer) {
        return res.status(404).json({ message: "freelancer not found" });
      }
      const employer = await User.findById(employerid);
      if (!employer) {
        return res.status(404).json({ message: "employer not found" });
      }

      sendOfferEmail(freelancer, employer);

      res.json({ message: "offer saved successfully" });
    } catch (error) {
      console.log("error posting offer", error.message);
      res.status(500).send("Server error while saving offer");
    }
  });

   //offer employer has posted
   router.get("/reademployerOffer", async (req, res)=>{
    try{
      const employerid =req.query.employerid;
    
      await Offer.find({employerid: employerid} )
      
    .then(Offer => res.json(Offer))
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while reading post")
  
    }
  })
  router.put("/changestatus", async (req, res)=>{
    try{
      const offerid = req.query.offerid;
      const status = req.query.status;
      const message = req.query.message;
      
      const filter = { _id: offerid };
      const update = { $set: {status: status ,message:message} };
      const updatedoffer = await Offer.findOneAndUpdate(filter, update, { new: true });
      if (!updatedoffer) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      res.status(200).json(updatedoffer);
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while changing status")
    }
  })

  // Route to get offers by freelancer ID
router.get('/read', async (req, res) => {
  try {
    const { freelancerid } = req.query;

    if (!freelancerid) {
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }

    const offers = await Offer.find({ freelancerid });

    if (offers.length === 0) {
      return res.status(404).json({ message: 'No offers found for this freelancer' });
    }

    res.status(200).json(offers);
  } catch (error) {
    console.error('Error retrieving offers:', error);
    res.status(500).json({ message: 'Server error while retrieving offers' });
  }
});
  
  module.exports = router;