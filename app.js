const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const User = require('./model/userSchema');

app.use(cors({
    origin: 'https://sanghamitra-quiz.vercel.app', // Replace with your frontend URL
    credentials: true,
}));

dotenv.config({path:'./.env'});
require('./db/conn');
//const User = require('./model/userSchema');
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://sanghamitra-quiz.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

//here we link the router files to make our route easy
app.use(require('./router/auth'));

app.post('/signin', async (req, res) => {
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

        // Save token in cookie
        res.cookie('jwtoken', 'token');

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api', function(req, res){
   // Setting the below key-value pair
   res.cookie('name', 'tutorialsPoint');
   res.send("Cookies are set");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
