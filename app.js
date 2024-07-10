const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./model/userSchema');

const app = express();

// Load environment variables
dotenv.config({ path: './.env' });

// Middleware setup
app.use(cors({
    origin: 'https://sanghamitra-learning.vercel.app',
    credentials: true,
}));
app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', require('./routes/auth')); 

// Example route setting a cookie
app.get('/api/example', function(req, res) {
    res.cookie('name', 'tutorialsPoint');
    res.send("Cookies are set");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
