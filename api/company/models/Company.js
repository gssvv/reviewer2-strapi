'use strict'

/**
 * Lifecycle callbacks for the `Company` model.
 */

let updateRating = async (model, result) => {
  setTimeout(async () => {
    let allCompanies = await strapi.services.company.find({
      _limit: 1000,
      moderated: true
    })

    allCompanies.sort((first, second) => {
      let reviewsCountPosFirst = first.reviews.filter(
        e => e.positive && e.moderated
      ).length
      let reviewsCountFirst = first.reviews.filter(e => e.moderated).length
      let ratingFirst =
        reviewsCountPosFirst - reviewsCountFirst + reviewsCountPosFirst

      let reviewsCountPosSecond = second.reviews.filter(
        e => e.positive && e.moderated
      ).length
      let reviewsCountSecond = second.reviews.filter(e => e.moderated).length

      let ratingSecond =
        reviewsCountPosSecond - reviewsCountSecond + reviewsCountPosSecond

      return ratingSecond - ratingFirst
    })

    for (let index in allCompanies) {
      await strapi.services.company.update(
        { companyId: allCompanies[index].companyId },
        {
          rating: Number(index) + 1
        }
      )
    }
  }, 100)
}

module.exports = {
  // Before saving a value.
  // Fired before an `insert` or `update` query.
  // beforeSave: async (model) => {},

  // After saving a value.
  // Fired after an `insert` or `update` query.
  afterSave: updateRating,
  afterDestroy: updateRating

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
