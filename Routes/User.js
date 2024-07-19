const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const { Vcode } = require("../models/verifycod");
const { sendWelcomeEmail } = require('../utils/sendNotificationEmail');

router.post("/registerUser", async (req, res) => {
  try { 

    let aUser = await User.find({ username: req.body.username });
    if (aUser.length > 0) {
      return res.status(400).send("User already registered");
    }
    const code = req.body.code
    const user = new User({
      Usertype: req.body.Usertype,
      Fullname: req.body.Fullname,
      username: req.body.username,
      Phonenumber: req.body.Phonenumber,
      Email: req.body.Email,
      Password: await bcrypt.hash(req.body.Password, 10),
      Gender: req.body.Gender,
      profilepic: req.body.profilepic,
      title: req.body.title,
      freelancerprofile: req.body.freelancerprofile,
    });
    const vercode = await Vcode.findOne({email:user.Email });
  

    if (!vercode) {
      return res.status(404).send("User not found");
    }

    if (vercode.verificationCode !== code) {
      return res.status(400).send("Invalid code");
    }

    if (new Date() > vercode.codeExpiry) {
      return res.status(400).send("Code has expired");
    }

    Vcode.verificationCode = null;
    Vcode.codeExpiry = null;
    console.log(user);
    await user.save();

    res.status(201).json({ message: "data saved successfully" });
  } catch (error) {
    console.log("errorrrrrrr", error);
    res.status(500).send("server error while saving data erorrrrrrrr");
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



module.exports = router;
