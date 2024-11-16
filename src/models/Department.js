const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Department extends Model {}

Department.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: DataTypes.TEXT
}, {
    sequelize,
    modelName: 'Department'
});

module.exports = Department;