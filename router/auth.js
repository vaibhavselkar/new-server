const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const cookieParser = require('cookie-parser');

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
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = await user.generateAuthToken();
        console.log(token)

        // Save token in cookie
        res.cookie('jwtoken', token, {
            expires: new Date(Date.now() + 25892000000), // Approximately 30 days
            httpOnly: false,   // Prevents client-side JavaScript from accessing the cookie
            secure: true, // Ensures the cookie is sent over HTTPS only in production
            sameSite: 'None',
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/dashboard', authenticate, (req, res) => {
    console.log('Inside /dashboard route')
    res.send(req.rootUser);
    res.json({ name: req.rootUser.name, email: req.rootUser.email, token: req.token });
    console.log('User Data:', req.rootUser);
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
