import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Space = sequelize.define("spaces",{
     id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isActive:{
        type: DataTypes.TINYINT,
        defaultValue: 1
    }, 
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
    },
    {
        tableName: 'spaces' // ? ← explícito para evitar pluralización inesperada
    });