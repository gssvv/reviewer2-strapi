'use strict'
const _pick = require('lodash.pick')

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let entities = await strapi.services.about.find()

    if (!entities.length) {
      ctx.response.status = 404
      ctx.response.body = { message: 'Информация не найдена.' }
      return
    }

    let entity = _pick(entities[0], ['title', 'blocks'])

    return entity
  }
}
