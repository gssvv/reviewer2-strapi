const axios = require('axios')
const reviews = require('./10-20--18-1.json')


reviews.forEach(async el => {
  axios.post('http://localhost:1337/reviews/load', el)
    .then(res => console.log(res))
    .catch(err => console.log(err));
})