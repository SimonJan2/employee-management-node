const sequelize = require('../config/database');
const User = require('./User');
const Department = require('./Department');
const Ticket = require('./Ticket');

const models = {
    User,
    Department,
    Ticket
};

// Define associations
models.User.belongsTo(models.Department, { foreignKey: 'departmentId' });
models.Department.hasMany(models.User, { foreignKey: 'departmentId' });

models.Ticket.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
models.Ticket.belongsTo(models.User, { as: 'assignee', foreignKey: 'assigneeId' });
models.User.hasMany(models.Ticket, { foreignKey: 'creatorId', as: 'createdTickets' });
models.User.hasMany(models.Ticket, { foreignKey: 'assigneeId', as: 'assignedTickets' });

// Add sequelize instance to models
models.sequelize = sequelize;

module.exports = models;