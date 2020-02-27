'use strict'
const _pick = require('lodash.pick')
const { sanitizeEntity } = require('strapi-utils')
const showdown = require('showdown')
const showdownConverter = new showdown.Converter({ openLinksInNewWindow: true })

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let entities = await strapi.services.article.find({
      ...ctx.query,
      _limit: 9999,
      published: true,
      _sort: 'date:ASC'
    })

    let result = { pagination: { length: entities.length } }

    entities.length = entities.length > 9 ? 9 : entities.length

    result.articles = entities.map(entity => {
      let result = sanitizeEntity(entity, { model: strapi.models.article })
      return _pick(result, ['title', 'desc', 'date', 'articleLink'])
    })

    return result
  },
  findOne: async ctx => {
    console.log(ctx.params.id)

    let data = await strapi.services.article.findOne({
      articleLink: ctx.params.id,
      published: true
    })

    if (!data) {
      ctx.response.status = 404
      ctx.response.body = { message: 'Статья не найдена.' }
      return
    }

    data.content = showdownConverter.makeHtml(data.content)
    data.content = data.content.replace(/\n/g, '')

    sanitizeEntity(data, { model: strapi.models.article })

    ctx.send(data)
  }
}
