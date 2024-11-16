const { User, Department } = require('../models');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

class UserController {
    // Get all users
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                include: Department,
                attributes: { exclude: ['password'] }
            });
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Error fetching users' });
        }
    }

    // Get single user
    async getUserById(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                include: Department,
                attributes: { exclude: ['password'] }
            });
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Error fetching user' });
        }
    }

    // Update user
    async updateUser(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (req.file) {
                if (user.profilePicture) {
                    await deleteFromS3(user.profilePicture);
                }
                const profilePictureUrl = await uploadToS3(req.file);
                if (profilePictureUrl) {
                    req.body.profilePicture = profilePictureUrl;
                }
            }

            await user.update(req.body);
            
            const updatedUser = await User.findByPk(user.id, {
                include: Department,
                attributes: { exclude: ['password'] }
            });

            res.json(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Error updating user' });
        }
    }

    // Delete user
    async deleteUser(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (user.profilePicture) {
                await deleteFromS3(user.profilePicture);
            }

            await user.destroy();
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Error deleting user' });
        }
    }
}

// Create and export an instance of the controller
const userController = new UserController();
module.exports = userController;