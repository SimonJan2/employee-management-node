const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const userValidationRules = () => [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .if(body('password').exists())
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role')
];

const ticketValidationRules = () => [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('assigneeId').optional().isUUID().withMessage('Invalid assignee ID')
];

const departmentValidationRules = () => [
    body('name').notEmpty().withMessage('Department name is required'),
    body('description').optional().isString().withMessage('Description must be a string')
];

module.exports = {
    validate,
    userValidationRules,
    ticketValidationRules,
    departmentValidationRules
};