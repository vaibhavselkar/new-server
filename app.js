const dotenv = require('dotenv');
const mongoose = require('mongoose');

const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcryptjs');
const User = require('./model/userSchema');

app.use(cors({
    origin: 'https://sanghamitra-learning.vercel.app', // Replace with your frontend URL
    credentials: true,
}));

dotenv.config({path:'./.env'});
require('./db/conn');
//const User = require('./model/userSchema');


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

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
