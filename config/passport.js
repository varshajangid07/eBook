const passport=require('passport');
const GoogleStrategy=require('passport-google-oauth20').Strategy;
const LocalStrategy=require('passport-local').Strategy;
const bcrypt=require('bcryptjs');
const User=require('../models/userModel');

passport.use(new LocalStrategy({ usernameField : 'email' }, async(email, password, done)=>{
    try{
        const user=await User.findOne({ email : email });
        if(!user){
            return done(null, false, { message : "Email is not registered."});
        }
        if(!user.password){
            return done(null, false, { message : "this account uses Google login!"});
        }
        const isMatch=await bcrypt.compare(password, user.password);
        if(isMatch){
            return done(null, user);
        } else{
            return done(null, false, { message : "Password is incorrect!"});
        }
    } catch(err){
        return done(err);
    }
}))

passport.use(new GoogleStrategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : "http://localhost:2000/auth/google/callback"
},
    async(accessToken, refreshToken, profile, done)=>{
        try{
            let user=await User.findOne({ email : profile.emails[0].value });
            if(user){
                if(!user.googleId){
                    user.googleId=profile.id;
                    await user.save();
                }
                return done(null, user);
            } else{
                user=new User({
                    googleId : profile.id,
                    name : profile.displayName,
                    email : profile.emails[0].value
                });
                await user.save();
                return done(null, user);
            }
        } catch(err){
            console.error(err);
            return done(err, false);
        }
    }

))


passport.serializeUser((user, done)=>{
    done(null, user.id);
})

passport.deserializeUser(async(id, done)=>{
    try{
        const  user=await User.findById(id);
        done(null, user);
    } catch(err){
        done(err, false);
    }
})

