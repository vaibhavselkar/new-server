const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const User = require('./model/userSchema');
const authRouter = require('./router/auth');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();

// Load environment variables
dotenv.config({ path: './.env' });

// Middleware setup
app.use(cors({
    origin: 'https://sanghamitra-learning.vercel.app', // Replace with your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'None' // Required for cross-site cookies
    }
}));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use('/api', authRouter);

app.get('/', (req, res) => {
    res.send('Hello World');
});

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
