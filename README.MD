# Space Booking API

REST API para gestión de reservas de espacios (salas, canchas, consultorios). Construida con Node.js, Express y Sequelize sobre MySQL.

## Stack técnico

- **Runtime:** Node.js con ES Modules
- **Framework:** Express
- **ORM:** Sequelize + MySQL
- **Autenticación:** JWT + bcrypt
- **Logging:** Morgan

## Estructura del proyecto

```
src/
├── config/
│   └── database.js        # Conexión Sequelize con pool
├── models/
│   ├── index.js           # Asociaciones entre modelos
│   ├── User.js
│   ├── Space.js
│   └── Booking.js
├── routes/
│   ├── index.js           # Ensamblador de rutas
│   ├── auth.routes.js
│   ├── space.routes.js
│   └── booking.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── space.controller.js
│   └── booking.controller.js
├── services/
│   ├── auth.service.js
│   ├── space.service.js
│   └── booking.service.js
├── middlewares/
│   ├── auth.middleware.js      # JWT verify + isAdmin
│   └── validate.middleware.js  # Validación de campos
├── utils/
│   ├── errors.js          # Clase ApiError
│   ├── response.js        # Clase ApiResponse
│   ├── jwt.js             # Generación de tokens
│   └── pagination.js      # parsePagination reutilizable
└── app.js                 # Configuración Express
server.js                  # Bootstrap y arranque
```

## Requisitos

- Node.js >= 18
- MySQL >= 8

## Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/sebas-pr2000/space-booking-api.git
cd space-booking-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 4. Crear la base de datos en MySQL
mysql -u root -p
CREATE DATABASE booking_db;
exit;

# 5. Arrancar el servidor
npm run dev
```

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Servidor
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=booking_db
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_muy_largo_y_seguro
JWT_EXPIRES_IN=7d
```

---

## Endpoints

Base URL: `/api/v1`

> 🔒 Requiere token JWT en header: `Authorization: Bearer <token>`  
> 🛡️ Requiere rol admin

---

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Registro de usuario |
| POST | `/auth/login` | — | Login, devuelve JWT |
| GET | `/auth/me` | 🔒 | Perfil del usuario actual |

**POST /auth/register**
```json
// Body
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "minimo8chars"
}

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Juan Pérez", "email": "juan@email.com", "role": "user" },
    "token": "eyJhbGci..."
  }
}
```

**POST /auth/login**
```json
// Body
{ "email": "juan@email.com", "password": "minimo8chars" }

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Juan Pérez", "email": "juan@email.com", "role": "user" },
    "token": "eyJhbGci..."
  }
}
```

---

### Spaces

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/spaces` | 🔒 | Lista espacios activos (paginado + búsqueda) |
| GET | `/spaces/:id` | 🔒 | Detalle de un espacio |
| POST | `/spaces` | 🛡️ | Crear espacio |
| PATCH | `/spaces/:id` | 🛡️ | Editar espacio |

**GET /spaces** — Query params opcionales:
```
?page=1&limit=10&search=sala
```

```json
// Response 200
{
  "success": true,
  "data": {
    "spaces": [
      { "id": 1, "name": "Sala A", "description": "...", "capacity": 10 }
    ]
  },
  "meta": { "total": 25, "page": 1, "lastPage": 3 }
}
```

**POST /spaces**
```json
// Body
{ "name": "Sala A", "description": "Sala de reuniones", "capacity": 10 }

// Response 201
{ "success": true, "data": { "id": 1, "name": "Sala A", "capacity": 10, "isActive": true } }
```

**PATCH /spaces/:id** — Todos los campos opcionales:
```json
// Body (envía solo lo que quieres cambiar)
{ "name": "Sala B", "capacity": 15, "isActive": false }
```

---

### Bookings

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/bookings` | 🔒 | Crear reserva |
| GET | `/bookings/my` | 🔒 | Mis reservas |
| PATCH | `/bookings/:id/cancel` | 🔒 | Cancelar mi reserva |
| GET | `/bookings` | 🛡️ | Todas las reservas (admin) |
| PATCH | `/bookings/:id/confirm` | 🛡️ | Confirmar reserva (admin) |

**POST /bookings**
```json
// Body — fechas en formato ISO 8601 UTC
{
  "spaceId": 1,
  "startTime": "2025-06-10T10:00:00Z",
  "endTime":   "2025-06-10T12:00:00Z"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 1, "spaceId": 1, "startTime": "...", "endTime": "...", "status": "pending"
  }
}
```

**GET /bookings/my** — Query params opcionales:
```
?page=1&limit=10&status=pending
```
Status permitidos: `pending` | `confirmed` | `cancelled`

**GET /bookings** (admin) — Query params opcionales:
```
?page=1&limit=10&status=confirmed&spaceId=1&date=2025-06-10
```

---

## Códigos de error

Todas las respuestas de error siguen el mismo formato:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_CONFLICT",
    "message": "El espacio ya tiene una reserva en ese horario",
    "details": ""
  }
}
```

| Code | Status | Descripción |
|------|--------|-------------|
| `INCOMPLETE_FIELDS` | 400 | Campos requeridos faltantes |
| `INVALID_EMAIL` | 400 | Formato de email inválido |
| `INVALID_PASSWORD` | 400 | Password menor a 8 caracteres |
| `INVALID_DATE` | 400 | Fecha fuera de formato ISO 8601 |
| `ID_INVALID` | 400 | Id debe ser entero positivo |
| `PAGE_INVALID` | 400 | Página inválida |
| `LIMIT_INVALID` | 400 | Límite fuera de rango (máx 50) |
| `INVALID_STATUS` | 400 | Status no permitido |
| `MISSING_TOKEN` | 401 | Token no enviado |
| `INVALID_TOKEN` | 401 | Token inválido o expirado |
| `INVALID_CREDENTIALS` | 401 | Email o password incorrectos |
| `NO_ACCESS` | 403 | Se requiere rol admin |
| `BOOKING_NOT_YOURS` | 403 | No tienes permiso sobre esta reserva |
| `SPACE_NOT_FOUND` | 404 | Espacio no encontrado |
| `BOOKING_NOT_FOUND` | 404 | Reserva no encontrada |
| `EMAIL_EXISTS` | 409 | Email ya registrado |
| `SLOT_CONFLICT` | 409 | Conflicto de horario en el espacio |
| `BOOKING_ALREADY_CANCELLED` | 409 | La reserva ya está cancelada |
| `BOOKING_NOT_PENDING` | 409 | Solo se confirman reservas en pending |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## Decisiones técnicas

- **Arquitectura en capas** (routes → middlewares → controllers → services → models) para separar responsabilidades y facilitar mantenimiento.
- **Services sin try/catch** — los errores se propagan al controller y llegan al error handler global de Express, que los formatea de forma consistente.
- **JWT con rol embebido** — el rol viaja en el token para evitar queries extra a la BD en cada request protegida.
- **findAndCountAll con distinct: true** — garantiza un count correcto cuando hay joins.
- **parsePagination utilitario** — lógica de paginación centralizada, reutilizada en todos los endpoints con listado.
- **ENUM para status** — restricción a nivel de BD, no solo de aplicación.

---

## Licencia

MIT