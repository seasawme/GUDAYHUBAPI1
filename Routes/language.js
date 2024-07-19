// routes/language.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint to set user language preference
router.post('/set-language', async (req, res) => {
  const { userId, language } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { language });
    res.status(200).send('Language preference updated');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Endpoint to get user language preference
router.get('/get-language/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ language: user.language });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
