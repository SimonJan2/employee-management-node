const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create Departments table first
        await queryInterface.createTable('Departments', {
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
            description: DataTypes.TEXT,
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });

        // Create Users table with department reference
        await queryInterface.createTable('Users', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            role: {
                type: DataTypes.ENUM('admin', 'manager', 'employee'),
                defaultValue: 'employee'
            },
            departmentId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Departments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });

        // Create Tickets table with user references
        await queryInterface.createTable('Tickets', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: DataTypes.TEXT,
            status: {
                type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
                defaultValue: 'open'
            },
            priority: {
                type: DataTypes.ENUM('low', 'medium', 'high'),
                defaultValue: 'medium'
            },
            creatorId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            assigneeId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Drop tables in reverse order
        await queryInterface.dropTable('Tickets');
        await queryInterface.dropTable('Users');
        await queryInterface.dropTable('Departments');
    }
};