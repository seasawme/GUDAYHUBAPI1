const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { Admin } = require("../models/admin");


router.post("/", async (req, res) => {
  try {
    let user = await User.findOne({ username: req.body.username });
    let userType = 'user';

    if (!user) {
      user = await Admin.findOne({ username: req.body.username });
      userType = 'admin';
    }

    if (!user) {
      res.status(404).send({ error: "Invalid Email or Password" });
      return;
    }

    const password = await bcrypt.compare(req.body.password, user.Password);

    if (!password) {
      res.status(404).json({ error: "Invalid Email or Password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, userType: userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: {
        userData: {
          FullName: user.Fullname || user.username,
          UserName: user.username,
          Email: user.Email,
          userID: user._id,
          UserType: user.Usertype
        },
        token,
      },
    });
  } catch (error) {
    console.error("Server error logging in:", error);
    res.status(500).json({ error: "Server error logging in" });
  }
});



module.exports = router;
