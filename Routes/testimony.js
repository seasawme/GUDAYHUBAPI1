const express = require("express");
const router = express.Router();
const { testimony } = require("../models/testimony");

router.get("/readtestimony", async (req, res) => {
  try {
    await testimony.find().then((testimony) => res.json(testimony));
  } catch (error) {
    console.log("errorr", error.message);
    res.status(500).send("server error while reading testimony");
  }
});

//to write complaint
router.post("/writetestimony", async (req, res) => {
  try {
    const { text,rating , Userid, Date } = req.body;

    const newtestimony = new testimony({
      text,
      rating,
      Userid,
      Date: Date || new Date(), // Set the date to the current date if not provided
    });

    await newtestimony.save();
    res.json({ message: "testimony saved successfully" });
  } catch (error) {
    console.log("Error posting testimony:", error.message);
    res.status(500).send("Server error while saving testimony");
  }
});

module.exports = router;
