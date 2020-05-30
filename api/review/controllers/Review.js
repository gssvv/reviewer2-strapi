'use strict'
const _pick = require('lodash.pick')
const { parseMultipartData } = require('strapi-utils')
const ObjectID = require('mongodb').ObjectID

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
        'work',
        'content',
        'photos',
        'positive'
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
  },
  load: async ctx => {
    let neededValues = ctx.request.body
    let companyId = neededValues.company

    let company = await strapi.query('company').findOne({
      companyId: Number(companyId)
    })

    if(!company || !company.id) {
      ctx.response.status = 403
      ctx.response.body = { 
        error: `No such company: ${companyId}`
      }
      return
    }
    

    let review = await strapi.query('review').findOne({
      content: neededValues.content,
      company: ObjectID(company.id)
    })

    if(review) {
      ctx.response.status = 403
      ctx.response.body = { 
        error: `Review with such content for this company (${companyId}) already exists`,
        content: neededValues.content 
      }
      return
    }
     
    let newReview = {
      ..._pick(neededValues, [
        'author',
        'work',
        'content',
        'positive',
        'date'
      ]),
      company: company.id,
      moderated: true
    }
    try {
      await strapi.services.review.create(newReview)
    } catch (e) {
      console.log(e.message)

      ctx.response.status = 403
      ctx.response.body = { message: e._message }
      return
    }

    ctx.send({ message: 'Отзыв добавлен в базу данных.' })
  },
}
