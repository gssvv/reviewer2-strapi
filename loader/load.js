const axios = require('axios')
// const reviews = require('./10-20--18-1.json')
const companies = require('./rev2/companies.json')
const FormData = require('form-data');
const fs = require('fs');

const reviews = []

async function loadCompanies() {
  console.log('Loading Companies...');

  companies.forEach(async company => {
    let formData = new FormData()
    const file = await fs.createReadStream(`${__dirname}/rev2/logos/${company.companyId}.png`)
    formData.append('data', JSON.stringify(company))
    formData.append(
      'files.avatar',
      file,
      file.name
    )
    
    axios.post('http://localhost:1337/companies/load', formData, {headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
    }}).then(res => console.log(res.data))
      .catch(err => console.log(company.companyId, err.response ? err.response.status : err.message, err.response ? err.response.data : null))
  })
}

async function loadReviews() {
  console.log('Loading Reviews...');
  
  await fs.readdir(`${__dirname}/rev2/reviews`, async (err, files) => {
    await files.forEach(async (file) => {
      if(!file.match(/json$/)) return 
      console.log(`Importing ${file}...`);
      const list = await require(`./rev2/reviews/${file}`)
      
      reviews.push(...list)
    });
  
    await reviews.forEach(async (el, index) => {
      try {
        const res = await axios.post('http://localhost:1337/reviews/load', el)
        console.log(res.data)
        console.log(`Loaded ${index + 1}/${reviews.length}`);
      } catch (err) {
        console.log(err.response.status, err.response.data)
        console.log(`Loaded ${index + 1}/${reviews.length}`);
      }
    })
    
  })
}

(
  async function start() {
    await loadReviews()
    // await loadCompanies()
  }
)()



// reviews.forEach(async el => {
//   axios.post('http://localhost:1337/reviews/load', el)
//     .then(res => console.log(res))
//     .catch(err => console.log(err.response.status, err.response.data));
// })