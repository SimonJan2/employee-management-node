const { User } = require('../models');
const bcrypt = require('bcryptjs');

const initializeDb = async () => {
    try {
        // Check if admin user exists
        const adminExists = await User.findOne({
            where: { email: 'simonj@gmail.com' }
        });

        if (!adminExists) {
            // Create admin user
            await User.create({
                email: 'simonj@gmail.com',
                password: '123456', // Password will be hashed by the model hook
                firstName: 'Simon',
                lastName: 'Johnson',
                role: 'admin',
                isActive: true
            });
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

module.exports = initializeDb;