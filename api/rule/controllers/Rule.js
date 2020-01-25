'use strict'
const _pick = require('lodash.pick')
const showdown = require('showdown')
const showdownConverter = new showdown.Converter()

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let entities = await strapi.services.rule.find()

    if (!entities.length) {
      ctx.response.status = 404
      ctx.response.body = { message: 'Информация не найдена.' }
      return
    }

    let entity = _pick(entities[0], ['content', 'desc'])
    entity.content = showdownConverter.makeHtml(entity.content)
    entity.content = entity.content.replace(/\n/g, '')

    return entity
  }
}
