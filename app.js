const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcryptjs');
const User = require('./model/userSchema');

app.use(cors({
    origin: 'https://sanghamitra-quiz.vercel.app', // Replace with your frontend URL
    credentials: true,
}));
app.use(cookieParser());
dotenv.config({path:'./.env'});
require('./db/conn');


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


app.get('/api', function(req, res){
   // Setting the below key-value pair
   res.cookie('name', 'tutorialsPoint');
   res.send("Cookies are set");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
