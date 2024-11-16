const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const { sequelize } = require('./models');
const initializeDb = require('./config/initDb');
require('dotenv').config();

// Initialize express app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express EJS Layouts middleware
app.use(expressLayouts);
app.locals.layout = 'layouts/main'; // Set default layout
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', require('./routes/tickets'));

// Frontend routes
app.get('/', (req, res) => {
    res.render('auth/login', {
        layout: 'layouts/auth',
        title: 'Login'
    });
});

app.get('/login', (req, res) => {
    res.render('auth/login', {
        layout: 'layouts/auth',
        title: 'Login'
    });
});

app.get('/register', (req, res) => {
    res.render('auth/register', {
        layout: 'layouts/auth',
        title: 'Register'
    });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        layout: 'layouts/main',
        title: 'Dashboard',
        content: 'dashboard'
    });
});

app.get('/employees', (req, res) => {
    res.render('employees', {
        layout: 'layouts/main',
        title: 'Employees',
        content: 'employees'
    });
});

app.get('/tickets', (req, res) => {
    res.render('tickets', {
        layout: 'layouts/main',
        title: 'Tickets',
        content: 'tickets'
    });
});

app.get('/admin', (req, res) => {
    res.render('admin', {
        layout: 'layouts/main',
        title: 'Admin Panel',
        content: 'admin'
    });
});

// Initialize database
const initializeApp = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');
        await initializeDb();
        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
};

// Start the application
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await initializeApp();
});

module.exports = app;