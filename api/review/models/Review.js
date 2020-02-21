'use strict'

/**
 * Lifecycle callbacks for the `Review` model.
 */

let updateRating = async (model, result) => {
  setTimeout(async () => {
    let allCompanies = await strapi.services.company.find({
      _limit: 1000,
      moderated: true
    })

    const reducer = (red, el) => {
      let val = 0
      if (el.rate) {
        val = el.rate > 3 ? 1 : el.rate < 3 ? -1 : 0
      } else {
        val = el.positive ? 1 : -1
      }

      return red + val
    }

    allCompanies.sort((first, second) => {
      let ratingFirst = first.reviews.reduce(reducer, 0)
      let ratingSecond = second.reviews.reduce(reducer, 0)

      return ratingSecond - ratingFirst
    })

    for (let index in allCompanies) {
      let totalRate = allCompanies[index].reviews.reduce(
        (red, val) => red + (val.rate || 3),
        0
      )
      let avgRate = totalRate / (allCompanies[index].reviews.length || 1)

      let reviewsTotal = allCompanies[index].reviews.filter(e => e.moderated)
        .length

      await strapi.services.company.update(
        { companyId: allCompanies[index].companyId },
        {
          rating: Number(index) + 1,
          avgRate: avgRate || 0,
          reviewsTotal
        }
      )
    }
  }, 100)
}

module.exports = {
  afterSave: updateRating,
  afterDestroy: updateRating,
  afterUpdate: updateRating
  // Before saving a value.
  // Fired before an `insert` or `update` query.
  // beforeSave: async (model) => {},

  // After saving a value.
  // Fired after an `insert` or `update` query.
  // afterSave: async (model, result) => {},

  // Before fetching all values.
  // Fired before a `fetchAll` operation.
  // beforeFetchAll: async (model) => {},

  // After fetching all values.
  // Fired after a `fetchAll` operation.
  // afterFetchAll: async (model, results) => {},

  // Fired before a `fetch` operation.
  // beforeFetch: async (model) => {},

  // After fetching a value.
  // Fired after a `fetch` operation.
  // afterFetch: async (model, result) => {},

  // Before creating a value.
  // Fired before an `insert` query.
  // beforeCreate: async (model) => {},

  // After creating a value.
  // Fired after an `insert` query.
  // afterCreate: async (model, result) => {},

  // Before updating a value.
  // Fired before an `update` query.
  // beforeUpdate: async (model) => {},

  // After updating a value.
  // Fired after an `update` query.
  // afterUpdate: async (model, result) => {},

  // Before destroying a value.
  // Fired before a `delete` query.
  // beforeDestroy: async (model) => {},

  // After destroying a value.
  // Fired after a `delete` query.
  // afterDestroy: async (model, result) => {}
}
