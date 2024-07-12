const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session = require('express-session');
router.use(cookieParser());
env = require('dotenv').config();
const authenticate = require('../middleware/authenticate');

require('../db/conn');
const User = require('../model/userSchema');

router.get('/', (req, res) => {
    res.send('Hello World from router');
})

router.post('/register', async (req, res) => {
    const {name, email, password} = req.body; 

    if (!name || !email || !password) {
        return res.status(422).json({error: 'Please add all fields'});
    }

    try {
        const userExist = await User.findOne({email: email});
        if (userExist) {
            return res.status(422).json({error: 'User already exists'});
        }
        const user = new User({name, email, password});
        // need a middleware - presave method
        await user.save();
        res.status(201).json({message: 'User registered successfully'});
    } catch (err) {
        console.log(err);
    }

});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide all fields' });
    }

    try {
        const user = await User.findOne({ email: email });
        console.log('User found:', user);

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = await user.generateAuthToken();

        req.session.userId = user._id;
        console.log('User session set:', req.session);

        res.status(200).json({ message: 'User signed in successfully' });

    } catch (error) {
        console.error('Error signing in user:', error);
        res.status(500).json({ error: 'Server error, failed to sign in' });
    }
});

// Middleware to check for the JWT token
router.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(200).json({ authenticated: false });
    }
});

router.get('/dashboard', authenticate, (req, res) => {
    console.log('Inside /dashboard route');
    console.log('User Data:', req.rootUser);
    res.json({ name: req.rootUser.name, email: req.rootUser.email, token: req.token });
});


// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
        res.status(200).json({ message: 'Logout successful' });
    });
});

// New route to fetch all documents from the 'sample' collection
router.get('/vocab', async (req, res) => {
    try {
        const samples = await mongoose.connection.db.collection('vocab_questions').find({}).toArray();
        res.status(200).json(samples);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch samples' });
        console.log(err);
    }
});

module.exports = router
