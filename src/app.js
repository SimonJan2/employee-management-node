const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const sequelize = require('./config/database');
const initializeDb = require('./config/initDb');
require('dotenv').config();

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', require('./routes/tickets'));

// Frontend routes
app.get('/', (req, res) => res.render('auth/login', { layout: 'layouts/auth' }));
app.get('/login', (req, res) => res.render('auth/login', { layout: 'layouts/auth' }));
app.get('/register', (req, res) => res.render('auth/register', { layout: 'layouts/auth' }));
app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/employees', (req, res) => res.render('employees'));
app.get('/tickets', (req, res) => res.render('tickets'));
app.get('/admin', (req, res) => res.render('admin'));

// Initialize database and create admin user
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced');
        return initializeDb();
    })
    .catch(err => {
        console.error('Database sync error:', err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});