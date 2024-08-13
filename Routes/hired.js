const express = require("express");
const router = express.Router();
const {Hired} = require("../models/hired");
const {applicant} = require("../models/applicant");
const { User } = require("../models/User");
const { ObjectId } = require('mongoose').Types;


router.get("/searchhiredposts", async (req, res)=>{
    try{
      const freelancerid =req.query.freelancerid;
      await Hired.find({ Freelancerid:freelancerid })
      
    .then(applicant => res.json(applicant))
    
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while searching applied post")
  
    }
  })

  router.post('/addhired', async (req, res) => {
    try {
      const { appId } = req.body;
  
      // Find the applicant by ID
      const Applicant = await applicant.findById(appId);
      if (!Applicant) {
        return res.status(404).send('Applicant not found');
      }
  
      // Create a new Hired document from the Applicant data
      // Remove the _id field to avoid duplicate key error
      const applicantData = Applicant.toObject();
      delete applicantData._id; // Remove the _id field to let MongoDB generate a new one
      const hiredApplicant = new Hired(applicantData);
  
      // Save the applicant to Hired collection
      await hiredApplicant.save();
  
      // Update the Freelancer's job count
      const userFilter = { _id: Applicant.Freelancerid };
      const userUpdate = { $inc: { 'freelancerprofile.gudayhistory.jobs': 1 } };
  
      const user = await User.findOneAndUpdate(userFilter, userUpdate, { new: true });
  
      if (!user) {
        return res.status(404).json({ message: "Freelancer not found" });
      }
  
      // Remove the applicant from Applicant collection
      await applicant.findByIdAndDelete(appId);
  
      res.status(200).send('Applicant moved to hired successfully');
    } catch (error) {
      console.error('Error adding hired:', error);
      res.status(500).send('Server error while moving applicant to hired');
    }
  });
  

//shows hired to employer

router.get("/readhired", async (req, res)=>{
    try{
      const postid = req.query.postid;
       await Hired.find({postid:postid})
      .then(Hired => res.json(Hired))
  
    
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while reading applicant")
        
    }
  })


  
module.exports = router;
  