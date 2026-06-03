import { methods as spaceService } from "../services/space.service.js";
import { ApiResponse } from "../utils/response.js";

const getSpaces = async(req, res, next) =>{
    try {
        //? El body ya viene validado por el middleware — aquí confiamos en los datos
        const { page = 1, limit = 50, search = "" } = req.query;
                
        // ? El service se encarga de creacion de Space:
        const result = await spaceService.getSpacesForFilters({page: Number(page), limit:Number(limit), search })
                
        return res.status(200).json(new ApiResponse(result.spaces, result.meta));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const getSpaceForId = async(req, res, next) =>{
    try {
        const {id} = req.params;
                
        // ? El service se encarga de creacion de Space:
        const result = await spaceService.getSpaceForId(id)
                
        return res.status(200).json(new ApiResponse(result));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const createSpace = async(req, res, next) =>{
    try {
        //? El body ya viene validado por el middleware — aquí confiamos en los datos
        const { name, description, capacity } = req.body
                
        // ? El service se encarga de creacion de Space:
        const result = await spaceService.registerSpace({  name, description, capacity })
                
        return res.status(201).json(new ApiResponse(result));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const editSpace = async(req, res, next) =>{
    try {
        const {id} = req.params;
        //? El body ya viene validado por el middleware — aquí confiamos en los datos
        const { name, description, capacity, isActive ,image } = req.body
                
        // ? El service se encarga de creacion de Space:
        const result = await spaceService.editSpaceForId({ id, name, image, description, capacity, isActive})
                
        return res.status(200).json(new ApiResponse(result));
    } catch (error) {
        console.error(error);
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

export const methods = {
    createSpace,
    editSpace,
    getSpaces,
    getSpaceForId
}