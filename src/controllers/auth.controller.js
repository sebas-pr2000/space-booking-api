import {ApiResponse} from "../utils/response.js"
import { methods as authService  } from "../services/auth.service.js";


const obtainUser = async(req, res, next)=>{
    try {

        const user = req.user;
        
        // const result = await authService.login({email, password});
        
        return res.status(200).json(new ApiResponse(user))
    } catch (error) {
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const registerUser = async(req, res, next)=>{
    try {
        //? El body ya viene validado por el middleware — aquí confiamos en los datos
        const { name, email, password, role } = req.body

        // ? El service se encarga de: verificar email, hashear, crear, generar token
        const result = await authService.register({ name, email, password, role })

        // ? El controller solo decide el status y envía
        return res.status(201).json(new ApiResponse(result))
    } catch (error) {
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

const loginUser = async(req, res, next)=>{
    try {

        const {  email, password } = req.body;
        
        const result = await authService.login({email, password});
        
        return res.status(200).json(new ApiResponse(result))
    } catch (error) {
        // ? delega al error handler global — no repetir lógica de error aquí
        next(error) 
    }
}

export const methods = {
    registerUser,
    loginUser,
    obtainUser
}