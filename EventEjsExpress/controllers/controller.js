const { User, Event } = require('../models/model');
const bcrypt = require('bcryptjs');


const registerUser = async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/login');
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        return res.redirect('/allEvents');
    }
    res.redirect('/login');
};

const logoutUser = (req, res) => {
    req.session.destroy(() => res.redirect('/dashboard'));
};

const dashboard = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const allEvents = await Event.find({ createdBy: { $eq: req.session.user._id } });
    res.render('dashboard', { user: req.session.user, allEvents});

};

const createEvent = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { title, description, date } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        await Event.create({
            title,
            description,
            date,
            createdBy: req.session.user._id,
            image : imagePath
        });
        res.redirect('/allEvents');
    } catch (error) {
        console.error('Error creating event:', error);
        res.redirect('/allEvents');
    }
};

const editEventForm = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        
        // Ensure the logged-in user can only edit their own events
        if (!event || !event.createdBy.equals(req.session.user._id)) {
            return res.redirect('/dashboard');
        }

        res.render('editEvent', { user: req.session.user, event });
    } catch (error) {
        console.error('Error loading edit form:', error);
        res.redirect('/dashboard');
    }
};


const editEvent = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { id } = req.params;
    const { title, description, date } = req.body;
    const event = await Event.findById(id);
    if (event && event.createdBy.equals(req.session.user._id)) {
        await Event.findByIdAndUpdate(id, { title, description, date });
    }
    res.redirect('/dashboard');
};

const deleteEvent = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { id } = req.params;
    const event = await Event.findById(id);
    if (event && event.createdBy.equals(req.session.user._id)) {
        await Event.findByIdAndDelete(id);
    }
    res.redirect('/dashboard');
};

const allEvents = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    // Find events NOT created by the logged-in user
    const events = await Event.find({ createdBy: { $ne: req.session.user._id } });
    res.render('allEvents', { user: req.session.user, events });
};

module.exports = { registerUser, loginUser, logoutUser, dashboard, createEvent,editEventForm, editEvent, deleteEvent, allEvents };