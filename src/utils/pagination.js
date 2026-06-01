import { ApiError } from './errors.js'

const MAX_LIMIT = 50

export const parsePagination = ({ page, limit }) => {
  const p = Number(page)
  const l = Number(limit)

  if (!p || p < 1 || isNaN(p)) throw new ApiError('PAGE_INVALID',  'Página inválida', '', 400)
  if (!l || l < 1 || isNaN(l)) throw new ApiError('LIMIT_INVALID', 'Límite inválido', '', 400)
  if (l > MAX_LIMIT) throw new ApiError('LIMIT_INVALID', `Límite máximo: ${MAX_LIMIT}`, '', 400)

  return {
    page: p,
    limit:l,
    offset:(p - 1) * l,
    buildMeta:(count) => ({
      total:count,
      page:p,
      lastPage:Math.ceil(count / l)
    })
  }
}