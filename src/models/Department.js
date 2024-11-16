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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Department',
    tableName: 'departments'
});

module.exports = Department;