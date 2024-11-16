const { User } = require('../models');
const bcrypt = require('bcryptjs');

const initializeDb = async () => {
    try {
        // Create admin user if it doesn't exist
        const adminExists = await User.findOne({
            where: { email: 'simonj@gmail.com' }
        });

        if (!adminExists) {
            await User.create({
                email: 'simonj@gmail.com',
                password: await bcrypt.hash('123456', 10),
                firstName: 'Simon',
                lastName: 'Johnson',
                role: 'admin',
                isActive: true
            });
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

module.exports = initializeDb;