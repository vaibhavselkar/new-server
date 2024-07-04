const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const cookieParser = require('cookie-parser');
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

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = await user.generateAuthToken();
        console.log('Generated token:', token);

        res.cookie('jwtoken', token, {
            sameSite: 'None',
            secure: true, // Ensure the cookie is only sent over HTTPS
            httpOnly: true, // Ensures the cookie is not accessible via JavaScript
            path: '/',
        });
        res.status(200).json({ message: 'User signed in successfully', token: token });

    } catch (error) {
        console.error('Error signing in user:', error);
        res.status(500).json({ error: 'Server error, failed to sign in' });
    }
});

// Middleware to check for the JWT token
router.get('/check-auth', (req, res) => {
    const token = req.cookies.jwtoken;

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                console.log(err);
                return res.status(403).json({ authenticated: false });
            }
            res.status(200).json({ authenticated: true });
            console.log('User:', user);
        });
    } else {
        res.status(200).json({ authenticated: false });
        console.log('No token provided');
    }
});

router.get('/dashboard', authenticate, (req, res) => {
    console.log('Inside /dashboard route');
    console.log('User Data:', req.rootUser);
    res.json({ name: req.rootUser.name, email: req.rootUser.email, token: req.token });
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('jwtoken', {
        path: '/',
        httpOnly: true,
        secure: true
    });
    res.status(200).send({ message: 'Logout successful' });
});



// New route to fetch all documents from the 'sample' collection
router.get('/samples', async (req, res) => {
    try {
        const samples = await mongoose.connection.db.collection('sample').find({}).toArray();
        res.status(200).json(samples);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch samples' });
        console.log(err);
    }
});

module.exports = router
