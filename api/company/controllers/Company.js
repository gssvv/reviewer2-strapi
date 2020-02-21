'use strict'
const _pick = require('lodash.pick')
const { parseMultipartData } = require('strapi-utils')

/**
 * Read the documentation () to implement custom controller functions
 */

function getReviewsStats(reviews, total) {
  let stats = Array(
    { total: 0, percent: '0%' },
    { total: 0, percent: '0%' },
    { total: 0, percent: '0%' },
    { total: 0, percent: '0%' },
    { total: 0, percent: '0%' }
  )

  reviews.forEach((el, index) => {
    el.rate = el.rate || 3
    stats[el.rate - 1].total++
  })
  if (total)
    stats.forEach((el, index) => {
      console.log(((100 / total) * el.total).toFixed(0))

      stats[index].percent = ((100 / total) * el.total).toFixed(0) + '%'
    })

  return stats.reverse()
}

module.exports = {
  index: async ctx => {
    let neededValues = [
      'avatar',
      'title',
      'companyId',
      'rating',
      'pricing',
      'address',
      'phone',
      'email',
      'reviews',
      'avgRate',
      'reviewsTotal'
    ]

    let customValues = [
      'price1_gte',
      'price1_lte',
      'price2_gte',
      'price2_lte',
      'price3_gte',
      'price3_lte',
      '_start'
      // SET PAGINATION
    ]

    let customQuery = _pick(ctx.query, customValues)
    for (let val of customValues) delete ctx.query[val]

    let data = await strapi.services.company.find({
      ...ctx.query,
      _limit: 9999,
      _sort: 'rating:ASC',
      moderated: true
    })

    data = data.filter(el => {
      for (let i = 1; i <= 3; i++) {
        if (
          (customQuery[`price${i}_gte`] &&
            el.pricing[i - 1].value < customQuery[`price${i}_gte`]) ||
          (customQuery[`price${i}_lte`] &&
            el.pricing[i - 1].value > customQuery[`price${i}_lte`])
        )
          return false
      }
      return true
    })

    let result = []

    for (let index in data) {
      let reviews = data[index].reviews.filter(e => e.moderated)

      result[index] = _pick(data[index], neededValues)

      result[index].reviews = reviews
        .filter(e => e.photos && e.photos[0])
        .slice(0, 2)
    }

    let pagination = {
      length: result.length
    }

    if (!customQuery._start) customQuery._start = 0

    result = result.slice(
      Number(customQuery._start),
      Number(customQuery._start) + 10
    )

    ctx.send({ list: result, pagination })
  },
  findOne: async ctx => {
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
      'avgRate',
      'reviewsTotal',
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

    data.reviewsStats = getReviewsStats(data.reviews, data.reviewsTotal)
    // counting reviews
    data.reviews = data.reviews.slice(0, 9)

    data.reviewsPhotos = data.reviews
      .filter(e => e.photos && e.photos[0])
      .slice(0, 4)

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
      await strapi.services.company.create(newCompany)
    } catch (e) {
      console.log(e.message)

      ctx.response.status = 403
      ctx.response.body = { message: e._message }
      return
    }

    ctx.send({ message: 'Информация о компании отправлена на модерацию.' })
  }
}
