// routes/authRoutes.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/userregistration');
require('dotenv').config();

const authRoute = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

authRoute.post('/google/login', async (req, res) => {
  const { idToken } = req.body;

  console.log("google response id token ...:", idToken)

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;


    console.log("email  retrived from gggggggg", email)

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, email });
  } catch (error) {
    console.error('Error verifying Google ID Token:', error);
    res.status(400).json({ message: 'Invalid ID Token' });
  }
});

module.exports = authRoute;
