const express = require('express')

const app = express()

app.get('/', (req, res)=> {
  res.json({"hey": "Are you looking for mentors"})
})

app.listen(3000, () =>
  console.log('Hello Mentors')
);
