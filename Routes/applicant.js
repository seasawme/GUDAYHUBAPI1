const express = require("express");
const router = express.Router();
const {applicant} = require("../models/applicant");
const {Hired} = require("../models/hired");
const { User } = require("../models/User");
const { Post } = require("../models/post");
const { sendInterviewDateEmail } = require('../utils/sendNotificationEmail');


//to search if an applicant have already applied

router.get("/searchapplied", async (req, res) => {
    try {
      const freelancerid = req.query.freelancerid;
      const postid = req.query.postid;
      const applied = await applicant.find({Freelancerid:freelancerid, postid:postid});
      const hired =  await Hired.find({Freelancerid:freelancerid, postid:postid});


      
      if (Array.isArray(applied) && applied.length === 0 && (Array.isArray(hired) && hired.length === 0)) {
        return res.json({ message: "have not applied or been hired" });
      } else if (Array.isArray(applied) && applied.length > 0) {
        return res.json({ message: "have applied" });
      } else if (Array.isArray(hired) && hired.length > 0) {
        return res.json({ message: "have been hired" });
      }
      
    } catch (error) {
      console.error("Error reading post:", error);
      res.status(500).json({ message: "Server error while reading freelancer" });
    }
  });

  
  //to write applicant

  router.post("/writeapplicant", async (req, res)=>{
    try{
        const { Freelancerid, postid, Coverletter,status} = req.body;
        const newPost = new applicant({  Freelancerid, postid, Coverletter,status})
        await newPost.save();
        res.json({message: "applicant saved successfully"})

    }catch (error){
        console.log("errorrrrrrr", error.message)
        res.status(500).send("server error while saving applicant erorrrrrrrr")

    }
})

//search applied for taskmanager

router.get("/searchappliedposts", async (req, res)=>{
    try{
      const freelancerid =req.query.freelancerid;
      await applicant.find({ Freelancerid:freelancerid })
      
    .then(applicant => res.json(applicant))
    
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while searching applied post")
  
    }
  })

  //shows applicant to employer
  router.get("/readjobapplicant", async (req, res)=>{
    try{
      const postid = req.query.postid;
       await applicant.find({postid:postid})
  
      .then(applicant => res.json(applicant))
  
    
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while reading applicant")
        
    }
  })

  //to change status

  router.put("/changestatus", async (req, res)=>{
    try{
      const applicantid = req.query.applicantid;
      const status = req.query.status;
      const filter = { _id: applicantid };
      const update = { $set: {status: status} };
      const updatedApplicant = await applicant.findOneAndUpdate(filter, update, { new: true });
      if (!updatedApplicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      res.status(200).json(updatedApplicant);
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while changing status")
    }
  })

  router.put("/changehirestatus", async (req, res)=>{
    try{
      const applicantid = req.query.applicantid;
      const status = req.query.status;
      const filter = { _id: applicantid };
      const update = { $set: {status: status} };
      const updatedApplicant = await Hired.findOneAndUpdate(filter, update, { new: true });
      if (!updatedApplicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      res.status(200).json(updatedApplicant);
    }catch (error){
        console.log("errorr", error.message)
        res.status(500).send("server error while changing status")
    }
  })

  //to set interview date
  router.post("/setinterviewdate", async (req, res) => {
  try {
    const { applicantid, interviewdate, interviewTime } = req.body;

    const filter = { _id: applicantid };
    const update = { $set: { interivewDate: interviewdate, interivewTime: interviewTime,  status: "Interview Set" } };

    const updatedApplicant = await applicant.findOneAndUpdate(filter, update, { new: true });


    if (!updatedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const freelancer = await User.findById(updatedApplicant.Freelancerid);
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    const posted = await Post.findById(updatedApplicant.postid);
    if (!posted) {
      return res.status(404).json({ message: "Posted not found" });
    }

    res.status(200).json(updatedApplicant); 
    sendInterviewDateEmail(freelancer,posted, updatedApplicant)
  } catch (error) {
    console.error("Error setting interview date:", error.message);
    res.status(500).send("Server error while setting interview date");
  }
});
  
    module.exports = router;
