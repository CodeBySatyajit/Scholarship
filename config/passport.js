const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local Strategy for email/password authentication
passport.use('local', new LocalStrategy(
  {
    usernameField: 'Email',
    passwordField: 'Password',
    passReqToCallback: true
  },
  async (req, Email, Password, done) => {
    try {
      const user = await User.findOne({ Email });

      if (!user) {
        return done(null, false, { message: 'Invalid Email or Password' });
      }

      if (user.authMethod === 'google') {
        return done(null, false, { message: 'This account is linked to Google. Please use Google login.' });
      }

      const isPasswordValid = await bcrypt.compare(Password, user.Password);

      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid Email or Password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google Strategy
passport.use('google', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by googleId
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User exists, return it
        return done(null, user);
      }
      // Check if email already exists (email authentication user)
      const existingEmailUser = await User.findOne({ Email: profile.emails[0].value });

      if (existingEmailUser) {

        if (existingEmailUser.authMethod === 'email' && !existingEmailUser.googleId) {
          // Link Google ID to existing email account
          existingEmailUser.googleId = profile.id;
          existingEmailUser.profilePicture = existingEmailUser.profilePicture || (profile.photos[0] ? profile.photos[0].value : null);
          existingEmailUser.isVerified = true;
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        } else if (existingEmailUser.googleId === profile.id) {
          // Same Google account, return it
          return done(null, existingEmailUser);
        }
      }

      // Generate a unique username based on email
      const baseUsername = profile.emails[0].value.split('@')[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;
      let userExists = await User.findOne({ username });

      while (userExists) {
        username = `${baseUsername}${counter}`;
        userExists = await User.findOne({ username });
        counter++;
      }

      // Create new user with Google data
      const newUser = new User({
        FirstName: profile.name.givenName || profile.displayName || '',
        LastName: profile.name.familyName || '',
        Email: profile.emails[0].value,
        username: username,
        email: profile.emails[0].value.toLowerCase(),
        googleId: profile.id,
        authMethod: 'google',
        profilePicture: profile.photos[0] ? profile.photos[0].value : null,
        isVerified: true,
        Mobile: null, // Null for Google users - allows multiple users with sparse index
        // Password is not required for Google auth
      });

      await newUser.save();

      // Create empty UserInfo document for the new user
      const UserInfo = require('../models/UserInfo');
      const newUserInfo = new UserInfo({
        userID: newUser._id
      });
      await newUserInfo.save();

      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }
));

module.exports = passport;
