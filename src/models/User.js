import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define("users",{
     id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,

    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,

    },
    password: {
        type: DataTypes.STRING(200),
        allowNull: false,

    },
    role:{
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['user', 'admin'],
    }, 
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,

    }
    },
    {
        timestamps: true, // ? ← guardar automatico registros de created, updated
        tableName: 'users' // ? ← explícito para evitar pluralización inesperada
    });