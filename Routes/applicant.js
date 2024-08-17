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
        const appliedDate = new Date();
        const newPost = new applicant({  Freelancerid, postid, Coverletter,status,appliedDate})
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

  //serch application by id 

  router.get("/searchapplicant/:id", async (req, res) => {
    try {
      const applicantId = req.params.id;
      const application = await applicant.findById(applicantId);
      if (!application) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error reading application:", error);
      res.status(500).json({ message: "Server error while reading application" });
    }
  });

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
    const { applicantid, interviewdate, interviewTime,interviewInfo,interviewType } = req.body;

    const filter = { _id: applicantid };
    const update = { $set: { interivewDate: interviewdate, interivewTime: interviewTime,
      interviewInfo: interviewInfo ,
      interviewType: interviewType,  
      status: "Interview Set" } };

    const updatedApplicant = await applicant.findOneAndUpdate(filter, update);


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
    console.error("Error setting interview :", error.message);
    res.status(500).send("Server error while setting interview date");
  }
});
  
//search freelaner for interview

router.get("/searchfreelancer/:FreelancerId", async (req, res) => {
  try {
    const FreelancerId = req.params.FreelancerId;

    const freelancer = await User.findById(FreelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }


    res.json(freelancer);
    console.log("a",freelancer)
   
  } catch (error) {
    console.error("Error searching freelancer :", error.message);
    res.status(500).send("Server error while searching freelancer");
  }
});

//  applications where an employer has set interviews
router.get('/applicationInterview/:employerId', async (req, res) => {

  const employerId = req.params.employerId;

  try {
  
    const posts = await Post.find({ employerid: employerId });


    if (!posts.length) {
      return res.status(404).json({ message: 'No posts found for this employer.' });
    }

    const postIds = posts.map(post => post._id);

    // Find all applicants with status 'Interview Set' and matching post IDs
    const applications = await applicant.find({
      postid: { $in: postIds },
      status: 'Interview Set'
    }).populate('postid'); // Populate postid to get post details

  
    res.json(applications);

  
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



    module.exports = router;
