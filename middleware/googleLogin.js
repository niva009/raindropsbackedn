const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRegistration = require('../models/userregistration');


passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile._json.email;
  
        try {

          let user = await userRegistration.findOne({ email });
          if (!user) {
            // If the user does not exist, create a new one
            user = new userRegistration({ email });
            await user.save();
          }
          done(null, user);
        } catch (err) {

          done(err, null);
        }
      }
    )
  );


  passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRegistration.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


  module.exports = passportGoogleToken;


  

