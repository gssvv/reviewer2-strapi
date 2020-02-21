'use strict'
const _pick = require('lodash.pick')
const { parseMultipartData } = require('strapi-utils')

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let neededValues = [
      'author',
      'positive',
      'date',
      'content',
      'work',
      'photos'
    ]
    let companyId = ctx.params.id
    let _limit = ctx.query._limit || 10
    let _start = ctx.query._start || 0
    let _sort = ctx.query._sort || 'date:DESC'

    if (!companyId) {
      ctx.response.status = 403
      ctx.response.body = { message: 'Идентификатор компании не предоставлен.' }
      return
    }

    let reviews = await strapi.services.review.find({
      'company.companyId': companyId,
      moderated: true,
      _sort,
      _limit,
      _start
    })

    reviews = reviews.map(val => _pick(val, neededValues))

    ctx.send(reviews)
  },
  create: async ctx => {
    let neededValues = JSON.parse(ctx.request.body.data)

    let companyId = neededValues.companyId
    let newReview = {
      ..._pick(neededValues, [
        'author',
        'summary',
        'content',
        'photos',
        'rate'
      ]),
      company: companyId,
      date: new Date().toISOString(),
      moderated: false
    }
    try {
      const { files } = parseMultipartData(ctx)

      for (let i of Object.keys(files)) {
        if (files[i].size > 2097152) {
          ctx.response.status = 403
          ctx.response.body = {
            message: 'Размер файла не должен привышать 2МБ'
          }
          return
        }
      }
      console.log(newReview)

      await strapi.services.review.create(newReview, { files })
    } catch (e) {
      console.log(e.message)

      ctx.response.status = 403
      ctx.response.body = { message: e._message }
      return
    }

    ctx.send({ message: 'Отзыв отправлен на модерацию.' })
  }
}
