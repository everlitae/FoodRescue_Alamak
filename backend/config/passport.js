const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      passReqToCallback: true, // ← biar bisa akses req.query.state
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        const state = req.query.state; // "login" atau "register"

        let user = await User.findOne({ email });

        if (user) {
          // User sudah ada → update oauth info kalau perlu
          if (user.oauth_provider === "local") {
            user.oauth_provider = "google";
            user.oauth_id = profile.id;
            user.is_verified = true;
            if (!user.avatar_url) user.avatar_url = profile.photos[0]?.value;
            await user.save();
          }
          user._isNewUser = false;
          return done(null, user);
        }

        // User belum ada
        if (state === "login") {
          // Dari halaman login → tolak, suruh daftar dulu
          // Buat dummy user object dengan flag _isNewUser
          const dummyUser = { _isNewUser: true };
          return done(null, dummyUser);
        }

        // Dari halaman register → buat akun baru
        user = await User.create({
          first_name: profile.name.givenName || profile.displayName,
          last_name: profile.name.familyName || "",
          email,
          role: "food_seeker",
          oauth_provider: "google",
          oauth_id: profile.id,
          avatar_url: profile.photos[0]?.value,
          is_verified: true,
          is_active: true,
          is_profile_complete: false,
          profile: {},
        });
        user._isNewUser = false;
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

module.exports = passport;
