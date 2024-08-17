const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Admin } = require("../models/admin");
const { User } = require("../models/User");
const { Post } = require("../models/post");
const {PostHistory} = require('../models/postHistory'); 
const { Vcode } = require("../models/verifycod");
const { VerificationSchedule } = require("../models/VerificationSchedule");
const { sendWelcomeEmail } = require('../utils/sendNotificationEmail');
const upload = require("../FileHandler/profilepicConfig")
const uploadDoc = require("../FileHandler/freelancerFileCofig")

router.post("/registerAdimin", async (req, res) => {
    try {
        let aUser = await Admin.find({ username: req.body.username });
        if (aUser.length > 0) {
          return res.status(400).send("Admin already registered");
        }
    
        const user = new Admin({
          Usertype: req.body.Usertype,
          username: req.body.username,
          Email: req.body.email,
          Password: await bcrypt.hash(req.body.Password, 10),
        });
    
        console.log(user);
        await user.save();
    
        res.status(201).json({ message: "Admin saved successfully" });
      } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Server error while saving admin");
      }
});


router.post("/login", async (req, res) => {
    try {
      const user = await Admin.findOne({ username: req.body.username });
  
      if (!user) {
        res.status(404).send({ error: "Invalid Email or Password" });
        return;
      }
  
      const password = await bcrypt.compare(req.body.password, user.Password);
  
      if (!password) {
        res.status(404).json({ error: "Invalid Email or Password1" });
        return;
      }
  
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.json({
        message: {
          userData: {
            UserName: user.username,
            Email: user.Email,
            userID: user._id,
            UserType:user.Usertype
          },
          token,
        },
      });
    } catch {
      res.status(500).json({ error: "Server error logingin" });
    }
  });

  


//serach user with id for testimony

router.get("/serach/:id", async (req, res) => {
  try {
    const userid = req.params.id;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.json(user);

    
  } catch (error) {
    console.error("Error serching user:", error);
    res.status(500).json({ message: "Server error while serching user" });
  }
});




//get all users

router.get("/allUser", async (req, res) => {
    try {
      const type = req.query.type || "";  
      const users = await User.find({
        $or: [
          { "Usertype": { $regex: type, $options: "i" } },
          { "Usertype": null }, 
        ],
      }, { Password: 0 });
      res.json(users);
    } catch (error) {
      console.log("error", error.message);
      res.status(500).send("Server error while reading data");
    }
  });



  //register users
  router.post("/registerUserAdmin", async (req, res) => {
    try {
      const { Usertype, Fullname, username, Phonenumber, Email, Password, Gender, profilepic, title, freelancerprofile, code } = req.body;
  
      // Check for duplicate username
      let existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).send("Username already registered");
      }
  
      // Check for duplicate email
      existingUser = await User.findOne({ Email });
      if (existingUser) {
        return res.status(400).send("Email already registered");
      }
  
      // Fetch the verification code
      const vercode = await Vcode.findOne({ email: Email });
  
      if (!vercode) {
        return res.status(404).send("Verification code not found");
      }
  
      if (vercode.verificationCode !== code) {
        return res.status(400).send("Invalid verification code");
      }
  
      if (new Date() > vercode.codeExpiry) {
        return res.status(400).send("Verification code has expired");
      }


      status = "Active"
  
      const user = new User({
        Usertype,
        Fullname,
        username,
        Phonenumber,
        Email,
        Password: await bcrypt.hash(Password, 10),
        Gender,
        profilepic,
        title,
        status ,
        freelancerprofile,

      });
  
      // Clear the verification code
      vercode.verificationCode = null;
      vercode.codeExpiry = null;
      await vercode.save();
  
      // Save the user
      await user.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.log("Error:", error);
      res.status(500).send("Server error while registering user");
    }
  });

  function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  
  router.post("/sendcode", async (req, res) => {
    try {
      const { email } = req.body;
  
      const code = generateCode();
      const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes
  
      // Save the code and expiry date to the user's record in the database
      await Vcode.updateOne(
        { email: email },
        { $set: { verificationCode: code, codeExpiry: expiryDate } },
        { upsert: true } // This will insert the document if it doesn't exist
      );
  
      console.log("email",email)
      // Send the code via email
      await sendWelcomeEmail(email, code);
  
      res.status(200).send("Code sent successfully");
    } catch (error) {
      console.log("errorrrrrrr", error);
      res.status(500).send("Server error while sending code");
    }
  });


  router.put("/verifieUser/:username",uploadDoc.fields([
    { name: 'VerifiedDoc', maxCount: 1 } 
  ]) ,async (req, res) => {
    try {
      const DocPath = req.files && req.files.VerifiedDoc && req.files.VerifiedDoc.length > 0 ? `documents/${req.files.VerifiedDoc[0].filename}` : null;
        const update = {$set: {}  };

        update.$set['IsVerified'] = true;
        if (DocPath) {
          update.$set['VerifiedDoc'] = DocPath;
        } 
        const result = await User.findOneAndUpdate({ username: req.params.username }, update, { new: true });
   
        if (!result) {
          return res.status(404).json({ message: 'User not found' });
        }

        const freelancerId = result._id;

        if (freelancerId) {
          await VerificationSchedule.deleteMany({ freelancerId });
        }
  
        res.status(200).json({ message: 'User verification successful' });
    
      } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({ message: "Server error while verifying user" });
      }
    })


    // get all schedules
router.get('/Allschedules', async (req, res) => {
  try {
      const schedules = await VerificationSchedule.find();
      
      res.status(200).json(schedules);
  } catch (error) {
      console.error('Error retrieving schedules:', error);
      res.status(500).json({ message: 'Server error while retrieving schedules' });
  }
});


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
    const cvPath = req.files && req.files.cv && req.files.cv.length > 0 ? `documents/${req.files.cv[0].filename}` : null;
    const educationDocsPath =  req.files && req.files.educationDocs ? req.files.educationDocs.map(file => `documents/${file.filename}` ): null;
    const certificationDocsPath =  req.files && req.files.certificationDocs ? req.files.certificationDocs.map(file => `documents/${file.filename}`) : null;
  
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
    console.error("Error editing user:", error);
    res.status(500).json({ message: "Server error while editing freelancer" });
  }
});

router.put("/resetPassword/:id", async (req, res) => {
    try {
        const { newpassword } = req.body;
        const userId = req.params.id;
    
        if (!newpassword) {
          return res.status(400).json({ message: 'New password is required' });
        }
    
        const hashedPassword = await bcrypt.hash(newpassword, 10);
    
        const result = await User.findByIdAndUpdate(userId, { Password: hashedPassword }, { new: true });
    
        if (!result) {
          return res.status(404).json({ message: 'User not found' });
        }
    
    
        res.status(200).json({ message: 'Password reset successfully' });
    
      } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error while resetting password" });
      }
    })

    router.put("/deleteuser/:id", async (req, res) => {
        try {
            const userId = req.params.id;
 
            const user = await User.findById(userId);
            
            if (!user) {
              return res.status(404).json({ message: "User not found" });
            }

            const updatedUser = await User.findByIdAndUpdate(
              userId,
              { 
                status: 'deleted',
               /* $unset: {
                  username: "",
                  Email: "",
                  password: "",
                  Usertype: "",
                  language: "",
                  Fullname: "",
                  Phonenumber: "",
                  Gender: "",
                   'freelancerprofile.profilepic': "",
                   'freelancerprofile.skills': "",
                   'freelancerprofile.cv': "",
                   'freelancerprofile.additionaldoc.educations': "",
                   'freelancerprofile.additionaldoc.certifications': "",
                   'freelancerprofile.gudayhistory.jobs': "",
                   'freelancerprofile.gudayhistory.hired': "",
                   'freelancerprofile.workhistory': "",
                   'freelancerprofile.rating': "",
                   'freelancerprofile.description': "",
                   'freelancerprofile.portfolio': "",
                   'freelancerprofile.employerprofile.profilepic': "",
                   
                }*/
              },
              { new: true }
            );
        
            res.status(200).json(updatedUser);
          } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ message: "Server error while deleting user" });
          }
        })
  


  //get all active jobs
  router.get("/readpost", async (req, res) => {
    try {
      const search = req.query.search || ""; 
      const searchtitle = req.query.searchtitle || ""; 
      const filter = req.query.filter || ""; 
  
      const posts = await Post.find({
        Jobtype: { $regex: search, $options: "i" },
        Jobtitle: { $regex: searchtitle, $options: "i" },
        JobTask: { $regex: filter, $options: "i" },
      });
  
      res.json(posts);
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).send("Server error while reading post");
    }
  });
  

    //get all jobs
    router.get("/readAllpost", async (req, res) => {
        try {
          const search = req.query.search || ""; 
          const searchtitle = req.query.serachtitle || ""; 
           const filter =req.query.filter || ""; 
      
          await PostHistory.find({
            Jobtype: { $regex: search, $options: "i" },
            Jobtitle: { $regex: searchtitle, $options: "i" },
            JobTask: { $regex: filter, $options: "i" },
          })
          .then((Post) => res.json(Post));
        } catch (error) {
          console.log("errorr", error.message);
          res.status(500).send("server error while reading post");
        }
      });


module.exports = router;
