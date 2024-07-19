const express = require("express");
const router = express.Router();
const { Offer } = require("../models/offer");
const { User } = require("../models/User");
const { sendOfferEmail } = require('../utils/sendNotificationEmail');


//to write post
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

//read 
  router.get("/read" , async (req,res) => {
    try{
    const id = req.query.freelancerid

     await Offer.find({freelancerid: id})
    .then(Offer => res.json(Offer))
    
}catch(err){
  console.log("error reading offer" + err )
  res.status(500).send("error while reading offer")
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

  
  module.exports = router;