import express from "express"
import morgan from "morgan";
import cors    from 'cors'
import router  from './routes/index.js'
import dotenv from "dotenv";

const app = express();

dotenv.config();

// ? ── Middlewares globales ─────────────────────
app.use(morgan('dev'))
app.use(cors())
app.use(express.json()) // ? sin esto no lees req.body
app.use(express.urlencoded({ extended: true }))

// ? ── Rutas ────────────────────────────────────
app.use('/api/v1', router)

// ? ── 404 handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Ruta ${req.method} ${req.path} no existe` }
  })
})

// ? ── Error handler global ─────────────────────
// ? 4 parámetros = Express lo reconoce como error handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({
    success: false,
    error: {
      code:    err.code    || 'INTERNAL_ERROR',
      message: err.message || 'Error interno del servidor'
    }
  })
})

import { ApiError } from './utils/errors.js'

app.use((err, req, res, next) => {

  // ¿Es un error que nosotros lanzamos intencionalmente?
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code:    err.code,
        message: err.message,
        details: err.details
      }
    })
  }

  // Error inesperado (Sequelize, Node, bug nuestro)
  // En producción no exponemos el mensaje real — puede tener info sensible
  console.error('[UNHANDLED ERROR]', err)
  res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  })
})

export default app;
