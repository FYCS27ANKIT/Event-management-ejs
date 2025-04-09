const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const path = require('path');
const {registerUser, loginUser, logoutUser, dashboard, createEvent,editEventForm, editEvent, deleteEvent, allEvents } = require('./controllers/controller');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save in 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    },
});
const upload = multer({ storage });

// Ensure the uploads folder is accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

mongoose.connect('mongodb://localhost:27017/eventDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

    

// Routes
app.get('/dashboard', dashboard);
app.get('/register', (req, res) => res.render('register'));
app.post('/register', registerUser);
app.get('/login', (req, res) => res.render('login'));
app.post('/login', loginUser);
app.get('/createEvent', (req, res) => res.render('createEvent'));
app.post('/createEvent', upload.single('image'), createEvent);
app.get('/editEvent/:id', editEventForm);
app.post('/editEvent/:id', editEvent);
app.post('/deleteEvent/:id', deleteEvent);
app.get('/logout', logoutUser);
app.get('/allEvents', allEvents);

const port = 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}/dashboard`));