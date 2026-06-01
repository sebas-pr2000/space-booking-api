import { config } from "dotenv";
import { Sequelize } from "sequelize";

config();

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql', // Required for MySQL connections
  // timezone: '-05:00',
  timezone: '+00:00',
  port: process.env.DB_PORT || 3306,
  pool: {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000
},
define: {
      timestamps: true,
      underscored: false
  }
});

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1)  // ? ← si la BD falla al arrancar, detén el proceso
  }
}
