const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'https://sanghamitra-learning.vercel.app',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
    cookie: {
        secure: true,    // Requires HTTPS
        httpOnly: true,  // Ensures cookies are not accessible via JavaScript
        sameSite: 'None' // Ensures cookies are sent on cross-origin requests
    }
}));

// Routes
app.use(require('./router/auth'));

// Example route to set cookies
app.get('/api/example', (req, res) => {
    res.cookie('name', 'tutorialsPoint');
    res.send("Cookies are set");
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connected to MongoDB");
    // Start server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => console.error("MongoDB connection error:", err));
