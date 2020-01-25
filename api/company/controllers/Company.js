'use strict'
const _pick = require('lodash.pick')
const { parseMultipartData } = require('strapi-utils')

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  index: async ctx => {
    let neededValues = [
      'avatar',
      'title',
      'companyId',
      'rating',
      'pricing',
      'address'
    ]

    let data = await strapi.services.company.find({
      ...ctx.query,
      _sort: 'rating:ASC',
      moderated: true
    })
    let result = []

    for (let index in data) {
      let reviews = data[index].reviews.filter(e => e.moderated).length
      let reviewsPos = data[index].reviews.filter(
        e => e.positive && e.moderated
      ).length

      result[index] = _pick(data[index], neededValues)

      result[index].reviews = reviews
      result[index].reviewsNeg = reviews - reviewsPos
      result[index].reviewsPos = reviewsPos
    }

    ctx.send(result)
  },
  findOne: async ctx => {
    let maxReviews = 20
    let neededValues = [
      'avatar',
      'title',
      'companyId',
      'rating',
      'pricing',
      'address',
      'dateAdded',
      'phone',
      'pricing',
      'reviews',
      'desc',
      'id'
    ]

    let data = await strapi.services.company.findOne({
      companyId: ctx.params.id,
      moderated: true
    })

    if (!data) {
      ctx.response.status = 404
      ctx.response.body = { message: 'Компания не найдена.' }
      return
    }

    data = _pick(data, neededValues)

    data.reviews = data.reviews.filter(e => e.moderated)
    data.reviews.sort((first, second) => {
      return new Date(second.date) - new Date(first.date)
    })

    // TODO: Exclude dates from reviews (here and everywhere)

    // counting reviews
    let reviewsCount = data.reviews.length
    let reviewsCountPos = data.reviews.filter(e => e.positive).length

    data.reviewsCount = reviewsCount
    data.reviewsCountNeg = reviewsCount - reviewsCountPos
    data.reviewsCountPos = reviewsCountPos

    data.reviews.length =
      data.reviews.length > maxReviews ? maxReviews : data.reviews.length

    data.reviews = data.reviews.slice(0, 9)

    ctx.send(data)
  },
  create: async ctx => {
    let neededValues = JSON.parse(ctx.request.body.data)

    let latestCompany = await strapi.services.company.find({
      _limit: 1,
      _sort: 'companyId:DESC'
    })

    let companyId = latestCompany[0] ? latestCompany[0].companyId + 1 : 0

    let newCompany = {
      ..._pick(neededValues, [
        'desc',
        'title',
        'phone',
        'address',
        'email',
        'pricing'
      ]),
      dateAdded: new Date().toISOString(),
      companyId,
      moderated: false
    }

    try {
      const { files } = parseMultipartData(ctx)

      if (files.avatar.size > 1048576) {
        ctx.response.status = 403
        ctx.response.body = { message: 'Размер файла не должен привышать 1МБ' }
        return
      }

      await strapi.services.company.create(newCompany, { files })
    } catch (e) {
      console.log(e.message)

      ctx.response.status = 403
      ctx.response.body = { message: e._message }
      return
    }

    ctx.send({ message: 'Информация о компании отправлена на модерацию.' })
  }
}
