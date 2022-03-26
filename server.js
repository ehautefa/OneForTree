const express = require('express');
const serveIndex = require('serve-index');
const app = express();

app.get('/', (req, res) => {
//   res.send('Successful response.');
  res.sendFile('./index.html', { root: __dirname });
});

app.use('/public', express.static('public'));
app.use('/public', serveIndex('public'));

app.listen(3000, () => console.log('Example app is listening on port 3000.'));