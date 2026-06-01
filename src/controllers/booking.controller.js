import { json } from "sequelize";
import { methods as bookingService } from "../services/booking.service.js";
import { ApiResponse } from "../utils/response.js";

const getAllBookings = async(req, res, next) =>{
    try {
        const {page = 1, limit = 10, status = "",date = "", spaceId = null} = req.query;
        
        // const user = req.user;

        const result = await bookingService.getAllBookingsFilter({page: Number(page), limit: Number(limit), status, date, spaceId});

        return res.status(200).json(new ApiResponse(result.data, result.meta))
        
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const getMyBookings = async(req, res, next) =>{
    try {
        const {page = 1, limit = 10, status = ""} = req.query;
        
        const user = req.user;

        const result = await bookingService.getMyBookingsForUser({user: user.id,page: Number(page), limit: Number(limit), status});

        return res.status(200).json(new ApiResponse(result.data, result.meta))
        
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const createBooking = async(req, res, next) =>{
    try {
        //? El body ya viene validado por el middleware — aquí confiamos en los datos
        const { spaceId, startTime, endTime } = req.body

        const user = req.user;
                
        // ? El service se encarga de creacion de Booking:
        const result = await bookingService.registerBooking({ spaceId, startTime, endTime, userId: user.id })
                
        return res.status(201).json(new ApiResponse(result));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }

}

const confirmBooking = async(req, res, next) =>{
    try {
        const {id} = req.params;

        const result = await bookingService.confirmBookingForId({id});

        return res.status(200).json(new ApiResponse(result));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error)
    }
}

const cancelledBooking = async(req, res, next) =>{
    try {
        const {id} = req.params;

        const user = req.user;

        const result = await bookingService.cancelledBookingForId({user: user.id, id});

        return res.status(200).json(new ApiResponse(result));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error)
    }
}



export const methods = {
    getMyBookings,
    getAllBookings,
    createBooking,
    confirmBooking,
    cancelledBooking,
}