import { Space } from "../models/Space.js"
import { Op, where } from "sequelize";
import { ApiError } from "../utils/errors.js";
import { parsePagination } from "../utils/pagination.js";

const getSpaceForId = async (id) =>{
    const parsedId = Number(id)

    if (!id || id < 1 || !Number.isInteger(parsedId)) throw new ApiError('ID_INVALID', 'El id debe ser un entero positivo', '', 400)

    let space = await Space.findByPk(parsedId,{
        attributes: { exclude: [ 'createdAt', 'updatedAt'] },
    });

    if (!space) throw new ApiError('SPACE_NOT_FOUND', 'El espacio no existe', '', 404)

    return space
}

const getSpacesForFilters = async ({page, limit, search}) =>{
    
    // ? usando utils para comprobacion y obtener parametros:
    const { offset, buildMeta } = parsePagination({ page, limit })

    const where = { isActive: true }
    if(search){
        where.name ={
            [Op.like]: `%${search}%`,
        }
    }

    // ? Una sola query — devuelve { count, rows }
    const { count, rows } = await Space.findAndCountAll({
        where,
        attributes: { exclude: ['isActive', 'createdAt', 'updatedAt'] },
        limit,
        offset,
        distinct: true,  // ? importante si en el futuro se agrega includes/joins
    })

    return {
    spaces: rows,
    meta: buildMeta(count)
  }
}

// ? Service sin try/catch — deja que los errores suban al controller:
const registerSpace = async({ name, description, capacity, image }) => {
  return await Space.create({ name, description, capacity, image })
  // ? Si Sequelize falla → lanza excepción → controller la atrapa → next(err) → handler global
}

// ? Service sin try/catch — deja que los errores suban al controller:
const editSpaceForId = async({ id, name, image, description, capacity, isActive }) => {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    throw new ApiError('ID_INVALID', 'El id debe ser un entero positivo', '', 400)
  }

  // ? Construir solo los campos que vienen — evita sobrescribir con undefined
  const fields = {}
  if (name        !== undefined) fields.name = name
  if (description !== undefined) fields.description = description
  if (capacity    !== undefined) fields.capacity = capacity
  if (isActive    !== undefined) fields.isActive = isActive
  if (image    !== undefined) fields.image = image

  // ? Al menos un campo debe venir
  if (Object.keys(fields).length === 0) {
    throw new ApiError('NO_FIELDS', 'Debes enviar al menos un campo para actualizar', '', 400)
  }

  const space = await Space.findByPk(parsedId);

  if (!space) throw new ApiError('SPACE_NOT_FOUND', 'El espacio no existe', '', 404)

  await space.update(fields)

  const updated = space.toJSON();

  delete updated.createdAt
  delete updated.updatedAt
  return updated
}
  
// ?Solo agrega try/catch en el service cuando necesitas lógica específica de recuperación:
// ?try { ... } catch (err) {
// ?  if (err.name === 'SequelizeUniqueConstraintError') {
// ?    throw new ApiError('SPACE_EXISTS', 'Ya existe un espacio con ese nombre', '', 409)
// ?  }
// ?  throw err  // ← siempre relanza lo que no manejas
// ?}

export const methods = {
    getSpaceForId,
    getSpacesForFilters,
    registerSpace,
    editSpaceForId,
}