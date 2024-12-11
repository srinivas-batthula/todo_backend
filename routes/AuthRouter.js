const router = require('express').Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const Auth = require('../controllers/AuthController')
const CRUD = require('../services/CRUD')
const JWT = require('../services/JWT')
const UserModel = require('../models/UserModel')
const dotenv = require('dotenv').config({path:'../config.env'})


router.post('/signUp', Auth.Register);

router.post('/signIn', Auth.Login);

router.get('/google1', (req, res)=>{ return res.redirect('/api/auth/google') })

router.get('/signOut', Auth.LogOut);

let user={};

// Use Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_1+'',
    clientSecret: process.env.GOOGLE_CLIENT_2+'',
    callbackURL: (process.env.MODE==='production') ? 'https://todo-backend-1-4u6w.onrender.com/api/auth/google/callback' : "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const data = {
            'username': profile.displayName,
            'email': profile.emails[0].value,
            'password': 'google'
        }
        // Check if the user exists in the database
        let response = await CRUD.ReadDB(UserModel, { email: data.email }, { email: 1, password: 1 })
        if (response.status!=='success') {
            // User not found, create a new user
            response = await CRUD.PostDB(UserModel, data)
        }

        user = {
            'email': data.email,
            'password': response.data.password
        }
        // Return the user data to the passport callback
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));


// Google Authentication Routes (Starter Path)
router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile'],
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
    async(req, res) => {
        const response = await JWT.CreateToken(user)
        
        res.cookie('jwt', response.token, {httpOnly: true, secure: process.env.MODE+'' === 'production'})
        return res.redirect('https://github.com/srinivas-batthula/todo'+'')
        // json({'status':'success', 'details':'LoggedIn via Google'})
    }
)

router.get('/google/failure', (req, res)=>{
    res.status(403).redirect('https://github.com/srinivas-batthula/todo'+'/login')
    // json({'status':'Un-Authorized', 'details':'Please SignIn to continue...'})
})



module.exports = router