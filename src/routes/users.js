const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole } = require('../middleware/auth');
const multer = require('multer');

// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Routes
router.get('/', 
    auth, 
    checkRole(['admin']), 
    (req, res) => userController.getAllUsers(req, res)
);

router.get('/:id', 
    auth, 
    (req, res) => userController.getUserById(req, res)
);

router.put('/:id', 
    auth, 
    upload.single('profilePicture'), 
    (req, res) => userController.updateUser(req, res)
);

router.delete('/:id', 
    auth, 
    checkRole(['admin']), 
    (req, res) => userController.deleteUser(req, res)
);

module.exports = router;
