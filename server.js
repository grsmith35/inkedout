const express = require('express');

const app = express();

app.get('/api/animals', (req, res) => {
    res.send('Hello animales!');
  });

app.listen(3001, () => {
    console.log('Now listening on port 3001')
});