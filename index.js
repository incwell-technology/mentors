const express = require('express')

const app = express()

app.get('/', (req, res)=> {
  res.json({"hey": "Are you looking for mentors"})
})

const PORT = process.env.PORT || 3000


app.listen(PORT, () =>
  console.log('Hello Mentors')
);
