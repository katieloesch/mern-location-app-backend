const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('get request in places');

  res.json({ msg: 'get route working' });
});

module.exports = router;
