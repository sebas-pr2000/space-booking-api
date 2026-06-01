import { User } from "./User.js";
import { Space } from "./Space.js";
import { Booking } from "./Booking.js";

export const setupAssociations = () => {
    // ? Un User tiene muchas Bookings.
    // ? foreignKey: "userId" → columna que se crea en la tabla bookings.
    // ? as: "bookings" → alias para usar en include: [{ model: Bookings }]
    User.hasMany(Booking, {
        foreignKey: "userId",
         as: "bookings",
    });

    // ? Una Booking pertenece a un User.
    // ? foreignKey debe ser IGUAL que en hasMany — siempre van en par.
    // ? as: "user" → cuando hagas include del user dentro de booking
    Booking.belongsTo(User, {
        foreignKey: "userId",
         as: "user",
    });

    // ? un Spaces puede tener muchas Bookings
    Space.hasMany(Booking, {
        foreignKey: "spaceId",
         as: "bookings",
    });

    // ? un Bookings solo tendra un Spaces
    Booking.belongsTo(Space, {
        foreignKey: "spaceId",
        as: "space",
    });

};

