const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const upload = require("../FileHandler/profilepicConfig");


//to searcch employer by id
router.get("/serach/:id", async (req, res) => {
  try {
    const employerid = req.params.id;
    const employer = await User.findById(employerid);
    if (!employer) {
      return res.status(404).json({ message: "employer not found" });
    }
    res.json(employer);

    
  } catch (error) {
    console.error("Error reading post:", error);
    res.status(500).json({ message: "Server error while reading employer" });
  }
});

//to read freelancer for employer
router.get("/readfromserver", async (req, res) => {
  try {
    const search = req.query.serachtitle || "";  // Default to an empty string if search query is not provided
    const users = await User.find({
      $or: [
        { "freelancerprofile.title": { $regex: search, $options: "i" } },
        { "freelancerprofile.title": null },  // Include documents where title is null
      ],
    });
    res.json(users);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).send("Server error while reading data");
  }
});



//to serach freelancer detail

router.get("/freelancerdetail/:id", async (req, res) => {
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

router.get("/readprofile/:id", async (req, res) => {
  try {
    const employerid = req.params.id;
    const employer = await User.findById(employerid);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    res.json(employer);
  } catch (error) {
    console.error("Error fetching employer", error);
    res.status(500).json({ message: "Server error while fetching employer" });
  }
});

//add profile pic for employer

router.put("/picedit/:id", upload.single("file"), async (req, res) => {
  try {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({
          message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
        });
    }

    const employerid = req.params.id;
    const profilepic = req.file ? `image/${req.file.filename}` : null;

    if (!profilepic) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log(`Profile pic path: ${profilepic}`);

    const filter = { _id: employerid };
    const update = { $set: { "freelancerprofile.profilepic": profilepic } };
    const updatedEmployer = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    res.status(200).json(updatedEmployer);
  } catch (error) {
    if (error.status === 400) {
      return res
        .status(400)
        .json({
          message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
        });
    } else {
      console.error("Error editing profile picture:", error);
      res
        .status(500)
        .json({ message: "Server error while editing profile picture" });
    }
  }
});

//edit employer data

router.put("/edit/:id", async (req, res) => {
  try {
    const employerid = req.params.id;
    const { fullname, email, phonenumber, gender, title } = req.body;
console.log( req.body)
    const filter = { _id: employerid };
    const update = {
      $set: {},
    };
    if (title) {
      update.$set["freelancerprofile.title"] = title;
    }
    if (fullname) {
      update.$set["Fullname"] = fullname;
    }
    if (email) {
      update.$set["Email"] = email;
    }
    if (phonenumber) {
      update.$set["Phonenumber"] = phonenumber;
    }
    if (gender) {
      update.$set["Gender"] = gender;
    }
    const updatedEmployer = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    res.status(200).json(updatedEmployer);
  } catch (error) {
    console.error("Error editing employer profile", error);
    res
      .status(500)
      .json({ message: "Server error while editing employer profile" });
  }
});

router.get("/searchoffer/:id", async (req, res) => {
  try {
    const employerId = req.params.id;

    const employer = await User.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    res.json(employer);

  } catch (error) {
    console.error("Error reading employer:", error);
    res.status(500).json({ message: "Server error while reading employer" });
  }
});




module.exports = router;
