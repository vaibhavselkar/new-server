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
