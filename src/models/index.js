const User = require('./User');
const Department = require('./Department');
const Ticket = require('./Ticket');

// Define relationships after all models are defined
User.belongsTo(Department, { foreignKey: 'departmentId' });
Department.hasMany(User, { foreignKey: 'departmentId' });

Ticket.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
Ticket.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
User.hasMany(Ticket, { foreignKey: 'creatorId', as: 'createdTickets' });
User.hasMany(Ticket, { foreignKey: 'assigneeId', as: 'assignedTickets' });

// Export all models
module.exports = {
    User,
    Department,
    Ticket,
    sequelize: require('../config/database')
};