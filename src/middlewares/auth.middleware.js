import jwt from "jsonwebtoken";
import { ApiError } from "../utils/errors.js";

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        // ? 1.Verificar que el header existe y tiene el formato correcto:
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(
            'MISSING_TOKEN',
            'Se requiere token de autenticación',
            '',
            401
        ))
        }

        // ? 2. Extraer el token — solo después de confirmar que el header existe
        let token = authHeader.split(" ")[1];

        // ? 3. Verificar — si falla, lanza excepción y va al catch
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ? 4. Adjuntar al request para que los controllers lo usen
        req.user = decoded;

        next();
    } catch (err) {
        // ? jwt.verify lanza aquí si el token es inválido, expirado, o manipulado
        // ?  Mensaje genérico al cliente — detalles solo en logs internos
        console.error('[AUTH]', err.message)
        next(new ApiError('INVALID_TOKEN', 'Token inválido o expirado', '', 401))
    }
        
}

// ? isAdmin — middleware pequeño que solo verifica el rol:
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError('NO_ACCESS', 'Se requiere ser admin', '', 403))
  }
  next()
}

export const methods = {
    authenticate,
    isAdmin
}