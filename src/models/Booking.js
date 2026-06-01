import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Booking = sequelize.define("bookings",{
     id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "users",
            key: "id"
        }
    },
    spaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "spaces",
            key: "id"
        }
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false, // ? ← obligatorio
        validate: {
        isAfterStart(value) {   // ? ← validación a nivel modelo
            if (value <= this.startTime) {
            throw new Error('endTime debe ser posterior a startTime')
            }
      }
    }
    },
    status:{
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['pending','confirmed','cancelled'],
        defaultValue: 'pending'
    }
    },
    {
        tableName: 'bookings' // ? ← explícito para evitar pluralización inesperada
    });