import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import 'dotenv/config';
import { connectDb, getCollection } from "../data/database.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    console.log("AccessToken:", accessToken);
    // console.log("Profile:", profile);
    const { id, displayName, emails, photos } = profile;
    const db = await connectDb();
    const usersCollection = await getCollection(db, "users");

    let existingUser = await usersCollection.findOne({ googleID: id });
    // console.log('Google profile:', profile);

    if (!existingUser) {
      const newUser = {
        googleID: id,
        name: displayName,
        email: emails[0].value,
        avatar: photos[0].value
      };

      await usersCollection.insertOne(newUser);
      existingUser = newUser;
    }
    
    return cb(null, existingUser);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user.googleID);
});

passport.deserializeUser(async function(id, cb) {
  const db = await connectDb();
  const usersCollection = await getCollection(db, "users");
  const user = await usersCollection.findOne({ googleID: id });
  cb(null, user);
});

export default passport;
