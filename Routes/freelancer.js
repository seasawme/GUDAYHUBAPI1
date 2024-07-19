const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const upload = require("../FileHandler/profilepicConfig")
const uploadDoc = require("../FileHandler/freelancerFileCofig")



//to serach freelancer by id for applying

router.get("/freelancerapply/:id", async (req, res) => {
    try {
      const freelancerid = req.params.id;
      const freelancer = await User.findById(freelancerid);
      if (!freelancer) {
        return res.status(404).json({ message: "freelancer not found" });
      }
      res.json(freelancer);
      
    } catch (error) {
      console.error("Error reading post:", error);
      res.status(500).json({ message: "Server error while reading freelancer" });
    }
  });

  //to edit profil pic for freelancer
  router.put("/picedit/:id", upload.single('file'), async (req, res) => {
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];


      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file format. Only JPEG, PNG, and GIF are allowed.' });
      }

      const freelancerid = req.params.id;
      const profilepic = req.file ? `image/${req.file.filename}` : null;

      if (!profilepic) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      console.log(`Profile pic path: ${profilepic}`);
  
      const filter = { _id: freelancerid };
      const update = { $set: { 'freelancerprofile.profilepic': profilepic } };
      const updatedFreelancer = await User.findOneAndUpdate(filter, update, { new: true });
  
      res.status(200).json(updatedFreelancer);
    } catch (error) {
      if (error.status === 400) {

        return res.status(400).json({ message: "Invalid file format. Only JPEG, PNG, and GIF are allowed." });
      } else {
        console.error("Error editing profile picture:", error);
        res.status(500).json({ message: "Server error while editing profile picture" });
      }
    }
  });
  


// to edit freelancer data
router.put("/edit/:id", uploadDoc.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'educationDocs', maxCount: 10 },
  { name: 'certificationDocs', maxCount: 10 }]), async (req, res) => {
  try {

    const freelancerid = req.params.id;
    const {title,skills, workhistory, description} = req.body;
    const cvPath = req.files.cv ? `documents/${req.files.cv[0].filename}` : null;
    const educationDocsPath = req.files.educationDocs ? req.files.educationDocs.map(file => `documents/${file.filename}` ): null;
    const certificationDocsPath = req.files.certificationDocs ? req.files.certificationDocs.map(file => `documents/${file.filename}`) : null;
  
console.log(req.body)
    const filter = { _id: freelancerid };
    const update = {$set: {}  };

    if (title) {
      update.$set['freelancerprofile.title'] = title;
    }  
    if (skills) {
      update.$push = update.$push || {};
      update.$push['freelancerprofile.skills'] = { $each: Array.isArray(skills) ? skills : [skills] };
    }  
    if (workhistory) {
      update.$push = update.$push || {};
      update.$push['freelancerprofile.workhistory'] = { $each: Array.isArray(workhistory) ? workhistory : [workhistory] };
    }  
    if (description) {
      update.$set['freelancerprofile.description'] = description;
    }  
     if (cvPath) {
  update.$set['freelancerprofile.cv'] = cvPath;
}      

if (educationDocsPath) {
  update.$push = update.$push || {};
  update.$push['freelancerprofile.additionaldoc.educations'] = { $each: Array.isArray(educationDocsPath) ? educationDocsPath : [educationDocsPath] };
}    

if (certificationDocsPath) {
   update.$push = update.$push || {};
  update.$push['freelancerprofile.additionaldoc.certifications'] = { $each: Array.isArray(certificationDocsPath) ? certificationDocsPath : [certificationDocsPath] };
}    
    const updatedFreelancer = await User.findOneAndUpdate(filter, update,{ new: true });

    res.status(200).json(updatedFreelancer);
  } catch (error) {
    console.error("Error reading post:", error);
    res.status(500).json({ message: "Server error while editing freelancer" });
  }
});

// DELETE specific skill from freelancer's profile
router.delete('/datadelete/:id', async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const  {skillToDelete , workdelete}  = req.body; 
    
    const filter = { _id: freelancerId };
    const update = {$set: {}  };
    if(skillToDelete){
      update.$pull = update.$pull || {};
    update.$pull['freelancerprofile.skills'] = { $in: skillToDelete}  ;
    }
    if(workdelete){
      update.$pull = update.$pull || {};
     update.$pull['freelancerprofile.workhistory'] = { $in: workdelete} 
    }

    const updatedFreelancer = await User.findOneAndUpdate(filter, update, { new: true });

    res.status(200).json(updatedFreelancer);
  } catch (error) {
    console.error("Error deleting freelancer skill:", error);
    res.status(500).json({ message: "Server error while deleting freelancer skill" });
  }
});

//to serach freelancer by id for applying

router.get("/apply/:id", async (req, res) => {
  try {
    const freelancerid = req.params.id;
    const freelancer = await User.findById(freelancerid);
    if (!freelancer) {
      return res.status(404).json({ message: "freelancer not found" });
    }
    res.json(freelancer);
    
  } catch (error) {
    console.error("Error reading post:", error);
    res.status(500).json({ message: "Server error while reading freelancer" });
  }
});



  module.exports = router;