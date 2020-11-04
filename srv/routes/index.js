const express = require('express');
const router = express.Router();

const db = require("../db/sqlite3").get();

/* GET home page. */
router.get('/', function(req, res, next) {
	const sql = "SELECT * FROM projects ORDER BY id";
	db.all(sql, [], (err, rows) => {
		if (err) return console.error(err.message);
		const modelContainer = {
			model: rows,
			allProjects: JSON.stringify(rows)
		};
		res.render("portfolio", modelContainer);
	});
});

module.exports = router;
