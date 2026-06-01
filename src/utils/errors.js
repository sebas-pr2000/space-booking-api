//? extiende Error nativo para poder indicar el error:
export class ApiError extends Error {
  constructor(code, message, details, status = 500) {
    super(message)  // ?inicializa Error con el mensaje
    this.name    = 'ApiError' // ? identifica el tipo
    this.code    = code
    this.details = details || ""
    this.status  = status     // ? el HTTP status viaja con el error
  }
}