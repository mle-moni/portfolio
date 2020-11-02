const express = require('express');
const router = express.Router();

const db = require("../db/sqlite3").get();

/* GET projects listing. */
router.get('/', function(req, res, next) {
	const sql = "SELECT * FROM projects ORDER BY id";
	db.all(sql, [], (err, rows) => {
		if (err) return console.error(err.message);
		const modelContainer = {
			model: rows
		};
		res.render("projects/index", modelContainer);
	});
});

/* GET projects editing. */
router.get('/edit/:id', function(req, res, next) {
	const id = req.params.id;
	const sql = "SELECT * FROM projects WHERE id = ?";
	db.get(sql, id, (err, row) => {
		if (err) return console.error(err.message);
		res.render("projects/edit", { model: row });
	});
});

router.post("/edit/:id", (req, res) => {
	if (req.body.password != process.env.APP_PASSWD) {
		res.status(403);
		req.body.error = "bad password";
		res.render("projects/edit", { model: req.body });
		return ;
	}
	const id = req.params.id;
	// TODO upload image
	const project = [
		req.body.title,
		req.body.type,
		req.body.os,
		req.body.description,
		req.body.demo,
		req.body.github,
		req.body.content,
		req.body.interest,
		req.body.tags,		
		id
	];
	const sql = "UPDATE projects SET title = ?, type = ?, os = ?, description = ?, demo = ?, github = ?, content = ?, interest = ?, tags = ? WHERE (id = ?)";
	db.run(sql, project, err => {
		if (err) return console.error(err.message);
		res.redirect("/projects");
	});
});

router.get("/create", (req, res) => {
	res.render("projects/create", { model: {} });
});

router.post("/create", (req, res) => {
	// TODO upload image
	if (req.body.password != process.env.APP_PASSWD) {
		res.status(403);
		req.body.error = "bad password";
		res.render("projects/create", { model: req.body });
		return ;
	}
	const project = [
		req.body.title,
		req.body.type,
		req.body.os,
		req.body.description,
		req.body.demo,
		req.body.github,
		req.body.content,
		req.body.interest,
		req.body.tags
	];
	const sql = "INSERT INTO projects (title, type, os, description, demo, github, content, interest, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
	db.run(sql, project, err => {
		if (err) return console.error(err.message);
		res.redirect("/projects");
	});
});

router.get("/delete/:id", (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM projects WHERE id = ?";
	db.get(sql, id, (err, row) => {
		if (err) return console.error(err.message);
		res.render("projects/delete", { model: row });
	});
});

router.post("/delete/:id", (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM projects WHERE id = ?";
	db.get(sql, id, (err, row) => {
		if (err) return console.error(err.message);
		if (req.body.password != process.env.APP_PASSWD) {
			res.status(403);
			row.error = "bad password";
			res.render("projects/delete", { model: row});
			return ;
		}
		const id = req.params.id;
		const sql = "DELETE FROM projects WHERE id = ?";
		db.run(sql, id, err => {
			if (err) return console.error(err.message);
			res.redirect("/projects");
		});
	});
});

module.exports = router;
