import { ApiResponse } from "../utils/response.js"
import {  ApiError } from "../utils/errors.js"
import bcrypt from "bcrypt"
import { generateTokenJWT } from "../utils/jwt.js";
import { User } from "../models/User.js"

const getUserForId = async (Id) =>{
    return await User.findByPk(Id,{})
}

const getUserForEmail = async (email) =>{
    return await User.findOne({
        where: {
            email: email
        },
    })
}

const register = async({ name, email, password, role }) => {

  // ? 1. ¿Ya existe el email? — lógica de negocio, vive aquí
  const existing = await getUserForEmail(email)
  if (existing) {
    const err = new ApiError('EMAIL_EXISTS', 'El email ya está registrado')
    err.status = 409
    throw err   // el controller lo atrapa con next(err)
  }

  // ? 2. Hashear — lógica de seguridad, vive aquí
  const hashedPassword = await bcrypt.hash(password, 12)

  // ? 3. Crear usuario
  const created = await User.create({ name, email, password: hashedPassword, role:'user' })

  // ? 4. Limpiar datos sensibles
  const user = created.toJSON()
  delete user.password
  delete user.createdAt
  delete user.updatedAt

  // ? 5. Generar token — responsabilidad del service de auth
  const token = generateTokenJWT(user)

  //? devuelve datos, no res ni status
  return { user, token }  
}

const login = async({email, password}) =>{

// ? Comprobar Email
  const existing = await getUserForEmail(email)
//   if (!existing) {
//     const err = new ApiError('EMAIL_NOT_EXISTS', 'El email no está registrado')
//     err.status = 409
//     throw err   // ? el controller lo atrapa con next(err)
//   }

  let isMatch = false;

// ? comparar la contraseña plana con la que esta en BD
    if(existing){
        isMatch  = await bcrypt.compare(password, existing?.password);
    }
//     if (!isMatch) {
//     const err = new ApiError('INCORRECT_PASSWORD', 'La contraseña no coincide')
//     err.status = 401
//     throw err   // ? el controller lo atrapa con next(err)
//   }

  // ? Lo correcto — mismo error para ambos casos
    if (!existing || !isMatch) {
    throw new ApiError(
        'INVALID_CREDENTIALS',
        'Credenciales inválidas',
        '',
        401
    )
    }

// ?  Limpiar datos sensibles
  const user = existing.toJSON()
  delete user.password
  delete user.createdAt
  delete user.updatedAt

  // ?  Generar token — responsabilidad del service de auth
  const token = generateTokenJWT(user)

  //? devuelve datos, no res ni status
  return { user, token }  
}

export const methods = {
    getUserForId,
    register,
    login
}