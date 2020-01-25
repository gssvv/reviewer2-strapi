'use strict'
const _pick = require('lodash.pick')

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let entities = await strapi.services.announce.find()

    entities = entities.map(e => {
      return _pick(e, ['content'])
    })

    return entities
  }
}
