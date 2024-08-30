const express = require('express');
const bodyParser = require('body-parser');
const { sendAligo } = require('./sendAligo');  // sendAligo.js 파일에서 함수 불러오기

const app = express();
app.use(bodyParser.json());

app.post('/send', (req, res) => {
  const options = req.body;

  sendAligo(options, req)
    .then(result => {
      res.json({ success: result });
    })
    .catch(err => {
      res.status(500).json({ success: false, error: err });
    });
});

app.listen(3000, () => {
  console.log('SMS server running on port 3000');
});
