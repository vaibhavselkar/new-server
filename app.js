const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

dotenv.config({path:'./.env'});
require('./db/conn');
//const User = require('./model/userSchema');

app.use(express.json());

//here we link the router files to make our route easy
app.use(require('./router/auth'));

const PORT = process.env.PORT || 4000;

// Middleware
middleware = (req, res, next) => {
    console.log('Hello Middleware');
    next();
}


//app.get('/', (req, res) => {
//    res.send('Hello My World!');
//});

app.get('/dashboard',middleware, (req, res) => {
    res.send('Welcome to Dashboard');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});