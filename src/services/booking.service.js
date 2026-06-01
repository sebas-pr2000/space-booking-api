import { sequelize } from "../config/database.js";
import { Booking } from "../models/Booking.js";
import { Space } from "../models/Space.js";
import { Op } from 'sequelize'
import { ApiError } from "../utils/errors.js";
import { User } from "../models/User.js";
import { parsePagination } from "../utils/pagination.js";


const getMyBookingsForUser = async({user, page, limit, status}) =>{

  // ? usando utils para comprobacion y obtener parametros:
  const { offset, buildMeta } = parsePagination({ page, limit })

  let where = {
      userId: user,
  }

  if(status) {
    where.status = status;
  }

  const {rows, count} = await Booking.findAndCountAll({
    where,
    attributes:{exclude: ["userId", "spaceId", "createdAt", "updatedAt"]},
    include:[
      {model: Space,
        as: "space",
        attributes:["name"]
      }
    ],
    offset,
    limit,
  })

  return {data: rows, meta: buildMeta(count)}
}
 
const getAllBookingsFilter = async({page, limit, status, date, spaceId}) =>{

  // ? usando utils para comprobacion y obtener parametros:
  const { offset, buildMeta } = parsePagination({ page, limit })

  let where = {};

  if(status) {
    where.status = status;
  }

  if(spaceId) {
    where.spaceId = spaceId;
  }

  if(date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    where.startTime = {
      [Op.lte]: endOfDay, // ? startTime <= fecha
    }

    where.endTime={
      [Op.gte]: startOfDay, // ? endTime >= fecha
    }
  }

  const {rows, count} = await Booking.findAndCountAll({
    where,
    attributes:{exclude: ["userId", "spaceId", "createdAt", "updatedAt"]},
    include:[
      {model: Space,
        as: "space",
        // attributes:["name"]
      },
      {model: User,
        as: "user",
        attributes:["name" , "email"]
      }
    ],
    offset,
    limit,
    distinct: true
  })

  return {data: rows, meta : buildMeta(count)}
}
 
const registerBooking = async({ spaceId, startTime, endTime, userId}) => {
 
       // ? 1. Verificar que el espacio existe y está activo
       let space = await Space.findByPk(spaceId,{
           attributes: { exclude: [ 'createdAt', 'updatedAt'] },
        });
        
        if (!space || !space.isActive) throw new ApiError('SPACE_NOT_FOUND', 'El espacio no existe o no está activo', '', 404)
            
            //? 2. Detectar conflicto de horario
            let conflict = await hasConflict(spaceId, startTime, endTime);
            
            if (conflict) throw new ApiError('BOOKING_ERROR', 'conflicto de horario', '', 409);
            
            // ? 3. Crear — sin pasar status, el modelo usa defaultValue: 'pending'
            let booking = await Booking.create({ spaceId, startTime, endTime, userId, status :'pending'})

            const bookingCreated = booking.toJSON()
            delete bookingCreated.userId
            delete bookingCreated.createdAt
            delete bookingCreated.updatedAt
            
            return bookingCreated
      
}

const hasConflict = async (spaceId, startTime, endTime) => {
  const conflict = await Booking.findOne({
    where: {
      spaceId,
      status: { [Op.in]: ['pending', 'confirmed'] }, // las canceladas no bloquean
      startTime: { [Op.lt]: endTime },   // ? existingStart < newEnd
      endTime:   { [Op.gt]: startTime }, // ? existingEnd   > newStart
    },
  })
  return !!conflict  // ? true si hay conflicto, false si está libre
}

const confirmBookingForId = async({id}) =>{
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new ApiError('ID_INVALID', 'Id inválido', '', 400)
    }

    let booking = await Booking.findByPk(parsedId)

    if(!booking){
      throw new ApiError('BOOKING_NOT_FOUND', 'La reserva no existe', '', 404);
    }

    if(booking.status !== "pending"){
      throw new ApiError('BOOKING_NOT_CONFIRM', 'Solo se pueden confirmar reservas en estado pending', '', 409);
    }

    // ? update directo sobre la instancia — una sola query
    await booking.update({ status: 'confirmed' })

    return {id: parsedId,  status: "confirmed"}
}

const cancelledBookingForId = async({user, id}) =>{
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new ApiError('ID_INVALID', 'Id inválido', '', 400)
    }

    let booking = await Booking.findByPk(parsedId)

    if(!booking){
      throw new ApiError('BOOKING_NOT_FOUND', 'La reserva no existe', '', 404);
    }

    if(booking.userId !== user){
      throw new ApiError('BOOKING_NOT_YOURS', 'No tienes permiso para cancelar esta reserva', '', 403);
    }

    if(booking.status === "cancelled"){
      throw new ApiError('BOOKING_ALREADY_CANCELLED', 'la reserva ya está cancelada', '', 409);
    }

    // ? update directo sobre la instancia — una sola query
    await booking.update({ status: 'cancelled' })

    return {id,  status: "cancelled"}
}

export const methods = {
    getMyBookingsForUser,
    getAllBookingsFilter,
    registerBooking,
    confirmBookingForId,
    cancelledBookingForId,
}