const express = require('express');
const router = express.Router();

const db = require("../db/sqlite3").get();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

module.exports = router;
