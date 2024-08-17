const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const { nonVerifiedUsers } = require("../models/nonVerifiedUser");
const { Vcode } = require("../models/verifycod");
const { VerificationSchedule } = require("../models/VerificationSchedule");
const { sendWelcomeEmail,contactFormUsers,sendScheduledEmail } = require('../utils/sendNotificationEmail');

const { body, validationResult } = require('express-validator');


function generateCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

const sendVerificationCode = async (email) => {
  const code = generateCode();
  const expiryDate = new Date(Date.now() + 10 * 60 * 1000); 

  await Vcode.updateOne(
    { email: email },
    { $set: { verificationCode: code, codeExpiry: expiryDate } },
    { upsert: true } 
  );

  await sendWelcomeEmail(email, code);
  return code;
};

const validateEmailDomain = (email) => {
  const invalidDomains = ['gamil.com', 'gnail.com', 'yaho.com']; // Add more common misspellings if needed
  const domain = email.split('@')[1];
  return !invalidDomains.includes(domain);
};



router.post(
  "/registerUser",
  [

    body('Usertype').notEmpty().withMessage('User type is required'),
    body('Fullname').notEmpty().withMessage('Full name is required'),
    body('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('Phonenumber').isMobilePhone().withMessage('Invalid phone number'),
    body('Email').isEmail().withMessage('Invalid email address')
    .custom(value => validateEmailDomain(value))
    .withMessage('Invalid email address'),
    body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('Gender').isIn(['male', 'female', 'Other']).withMessage('Invalid gender'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let aUser = await User.find({    $or: [
        { username: req.body.username },
        { Email: req.body.Email }
      ] });
      if (aUser.length > 0) {
        return res.status(400).send("User already registered");
      }

      let existingUser = await nonVerifiedUsers.findOne({  Email:req.body.Email  });

      if (existingUser) {
const code = generateCode()
        await Vcode.updateOne(
          { email: req.body.Email },
          { $set: { verificationCode: code, codeExpiry: new Date(Date.now() + 10 * 60 * 1000) } },
          { upsert: true }
        );

        await sendWelcomeEmail( req.body.Email, code);
  
        return res.status(201).json({ message: 'User already exists. Verification code has been reset.' });
      }

      const hashedPassword = await bcrypt.hash(req.body.Password, 10);


      const user = new nonVerifiedUsers({
        Usertype: req.body.Usertype,
        Fullname: req.body.Fullname,
        username: req.body.username,
        Phonenumber: req.body.Phonenumber,
        Email: req.body.Email,
        Password: hashedPassword,
        Gender: req.body.Gender,
        profilepic: req.body.profilepic,
        title: req.body.title,
        IsVerified: req.body.IsVerified || false,
        freelancerprofile: req.body.freelancerprofile,
      });


      await user.save();

      await sendVerificationCode(user.Email);

      res.status(201).json({ message: "Verification code sent to email" });
    } catch (error) {
      console.error("Error sending Verification code:", error);
      res.status(500).send("Server error while sending Verification code");
    }
  }
);

router.post('/verify', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const unverifiedUser = await nonVerifiedUsers.findOne({ Email: email });

    if (!unverifiedUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    const vercode = await Vcode.findOne({ email: email });

    if (!vercode) {
      return res.status(404).json({ message: 'Verification code not found' });
    }

    if (vercode.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > vercode.codeExpiry) {
      return res.status(400).json({ message: 'Code has expired' });
    }


    await Vcode.updateOne(
      { email: email },
      { $set: { verificationCode: null, codeExpiry: null } }
    );

 
    const newUser = new User({
      Usertype: unverifiedUser.Usertype,
      Fullname: unverifiedUser.Fullname,
      username: unverifiedUser.username,
      Phonenumber: unverifiedUser.Phonenumber,
      Email: unverifiedUser.Email,
      Password: unverifiedUser.Password,
      Gender: unverifiedUser.Gender,
      profilepic: unverifiedUser.profilepic,
      title: unverifiedUser.title,
      IsVerified: false,
      freelancerprofile: unverifiedUser.freelancerprofile,
    });

    await newUser.save();


    await nonVerifiedUsers.deleteOne({ Email: email });

    return res.status(200).json({ message: 'Verification successful' });

  } catch (error) {
    console.error('Error during verification:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});



router.post("/sendcode", async (req, res) => {
  try {
    const { email } = req.body;

    const code = generateCode();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); 

    await Vcode.updateOne(
      { email: email },
      { $set: { verificationCode: code, codeExpiry: expiryDate } },
      { upsert: true } 
    );

    await sendWelcomeEmail(email, code);

    res.status(200).send("Code sent successfully");
  } catch (error) {
    console.log("errorrrrrrr", error);
    res.status(500).send("Server error while sending code");
  }
});

//schedule verification
router.post('/schedule-verification', async (req, res) => {
  try {
    const { freelancerId, freelanerName, freelancerEmail, verificationDate, verificationTime, notes } = req.body;

    // Check if a schedule already exists for the given freelancerId
    let schedule = await VerificationSchedule.findOne({ freelancerId });

    if (schedule) {
      // Update the existing schedule
      schedule.verificationDate = verificationDate;
      schedule.verificationTime = verificationTime;
      schedule.notes = notes;

      const updatedSchedule = await schedule.save();

      sendScheduledEmail(freelanerName, freelancerEmail, updatedSchedule);

      res.status(200).json({ 
        message: 'Verification schedule updated successfully', 
        schedule: updatedSchedule 
      });
    } else {
      // Create a new schedule
      const newSchedule = new VerificationSchedule({
        freelancerId,
        verificationDate,
        verificationTime,
        notes,
      });

      const savedSchedule = await newSchedule.save();

      sendScheduledEmail(freelanerName, freelancerEmail, savedSchedule);

      res.status(201).json({ 
        message: 'verification Scheduled successfully', 
        schedule: savedSchedule 
      });
    }
  } catch (error) {
    console.error("Error scheduling verification:", error);
    res.status(500).json({ message: "Server error while scheduling verification" });
  }
});


// Get schedule by ID
router.get('/schedule/:id', async (req, res) => {
  try {
      const freelancerid = req.params.id;

      const filter = { freelancerId: freelancerid };
      const schedule = await VerificationSchedule.findOne(filter);

      if (!schedule) {
          return res.status(201).json({ message: 'Schedule not found' });
      }

      res.status(200).json({ schedule: schedule, message: 'Schedule found' });

  } catch (error) {
      console.error('Error retrieving schedule:', error);
      res.status(500).json({ message: 'Server error while retrieving schedule' });
  }
});




//get user for message
  
router.get("/getuser/:userId", async (req,res)=>{
  const userId = req.params.userId
  try{
    const user = await User.findById(userId)

    const {Password , ...other} = user._doc;
    res.status(200).json(other);
  }catch(err){
    console.log("error geting user for massage" + err)
    res.status(500).json(err)
  }
})

router.put("/addrating/:id", async (req, res) => {
  try {

    const userid = req.params.id;
    let {rating } = req.body;
    rating = parseInt(rating, 10);

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }


    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentRating = user.freelancerprofile.rating || 0;
    const newRating = (currentRating + rating) / 2;

    
    const filter = { _id: userid };
    const update = { $set: {'freelancerprofile.rating': newRating}};
  
    const updatedUser = await User.findOneAndUpdate(filter, update,{ new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ message: "Server error while adding rating" });
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

router.post('/writecontact', async (req, res) => {
  try {
    const { fullname, email, message} = req.body;

    await contactFormUsers(fullname, email, message)

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.log('Error contacting:', error.message);
    res.status(500).send('Server error while contacting');
  }
});



module.exports = router;
