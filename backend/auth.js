const express = require("express");
const { User } = require("./db");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const userEmail = profile._json.email;
        let userFound = await User.findOne({ email: userEmail });

        if (!userFound) {
          const newUser = new User({
            email: userEmail,
            name: profile.displayName,
          });
          await newUser.save();
          return done(null, newUserser);
        } else {
          return done(null, userFound);
        }
      } catch (err) {
        console.log(err);
      }
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
