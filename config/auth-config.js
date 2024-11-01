import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { message: 'Användare hittades inte' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Fel lösenord' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialisera och deserialisera användare för sessioner
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
