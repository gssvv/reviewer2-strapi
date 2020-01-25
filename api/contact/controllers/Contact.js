'use strict'
const _pick = require('lodash.pick')

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let data = await strapi.services.contact.find()

    let result = {}

    for (let entry of data) {
      result[entry.name] = entry.value
    }

    ctx.send(result)
  }
}
