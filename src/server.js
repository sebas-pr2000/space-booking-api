import app from './app.js'
import { testConnection } from './config/database.js'
import { setupAssociations } from './models/index.js'

const PORT = process.env.PORT || 3000

async function bootstrap() {
  await testConnection()   // ? 1. verifica BD
  setupAssociations()      // ? 2. registra asociaciones
  app.listen(PORT, () => console.log(`Server on port ${PORT}`))
}

bootstrap()