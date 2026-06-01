import { ApiError } from "../utils/errors.js"

// Fuera del middleware — utilidad pura, sin efectos secundarios
const VALID_ROLES = ["user", "admin"]

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const validDateISO =(dateISO) => {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

  if (!regex.test(dateISO)) {
    return false;
  }

  const date = new Date(dateISO);

  return !isNaN(date.getTime());
}

const validDateQuery =(date) => {
  const regex = /^\d{4}-\d{2}-\d{2}/;

  if (!regex.test(date)) {
    return false;
  }

  const dateC = new Date(date);

  return !isNaN(dateC.getTime());
}


const isValidRole = (role) =>
  VALID_ROLES.includes(role?.trim().toLowerCase())

// Sin async — no hay awaits
const checkFieldsRegister = (req, res, next) => {
  const { name, email, password } = req.body

  // ? Campos requeridos
  if (!name || !email || !password) {
    return next(new ApiError('INCOMPLETE_FIELDS', 'Todos los campos son requeridos', '', 400))
  }

  //  ?Formato de email
  if (!isValidEmail(email)) {
    return next(new ApiError('INVALID_EMAIL', 'El email no tiene un formato válido', '', 400))
  }

  // ? Longitud de password
  if (password.length < 8) {
    return next(new ApiError('INVALID_PASSWORD', 'La contraseña debe tener mínimo 8 caracteres', '', 400))
  }

  next() // todo válido — pasa al controller
}

const checkFieldsSpace = (req, res, next) =>{
  const { name, capacity } = req.body;

  // ? Campos requeridos
  if (!name || !capacity || capacity < 1) {
    return next(new ApiError('INCOMPLETE_FIELDS', 'name y capacity son requeridos. capacity debe ser mayor a 0', '', 400))
  }

  next() // todo válido — pasa al controller
}

const checkFieldsBooking = (req, res, next) =>{
  const { spaceId, startTime, endTime } = req.body;

  // ? Campos requeridos
  if (!spaceId || !startTime || !endTime) {
    return next(new ApiError('INCOMPLETE_FIELDS', 'Todos los campos son requeridos', '', 400))
  }

  const parsedId = Number(spaceId)

  if (!spaceId || spaceId < 1 || !Number.isInteger(parsedId)) return next( new ApiError('ID_INVALID', 'El spaceId debe ser un entero positivo', '', 400))

  if (!validDateISO(startTime) || !validDateISO(endTime) ) {
    return next(new ApiError('INVALID_DATE', 'fecha inválida sin Formato(ISO 8601)', '', 400))
  }

  if (new Date(endTime).getTime() <= new Date(startTime).getTime() ) {
    return next(new ApiError('INVALID_DATE', 'la fecha final debe ser mayor a la de incio', '', 400))
  }

  if (new Date(startTime) < new Date() ) {
    return next(new ApiError('INVALID_DATE', 'la fecha inicial no puede ser antes del horario actual', '', 400))
  }

  next() // todo válido — pasa al controller
}

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled']

const checkStatusQuery = (req, res, next) => {
  const { status } = req.query

  //? Si no viene status, es opcional — pasa sin filtro
  if (!status) return next()

  if (!VALID_STATUSES.includes(status)) {
    return next(new ApiError(
      'INVALID_STATUS',
      `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
      '',
      400
    ))
  }

  next()
}

const checkDateQuery = (req, res, next) => {
  const { date } = req.query

  //? Si no viene status, es opcional — pasa sin filtro
  if (!date) return next()

  if (!validDateQuery(date)) {
    return next(new ApiError(
      'INVALID_DATE', 'fecha inválida sin Formato YYYY-MM-DD',
      '',
      400
    ))
  }

  next()
}

export const methods ={
    checkFieldsRegister,
    checkFieldsSpace,
    checkFieldsBooking,
    checkDateQuery,
    checkStatusQuery
}