const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./model/userSchema');
const authRouter = require('./router/auth');

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

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: true,    // Requires HTTPS
        httpOnly: true,  // Ensures cookies are not accessible via JavaScript
        sameSite: 'None' // Ensures cookies are sent on cross-origin requests
    }
}));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use('/api', authRouter);

app.get('/', (req, res) => {
    res.send('Hello World its working');
})

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
