const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const uploadProject = multer({ dest: `./public/uploads/.tmp/` });

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

router.post("/edit/:id", uploadProject.single("image"), function (req, res) {
	const id = req.params.id;
	if (req.body.password != process.env.APP_PASSWD) {
		res.status(403);
		req.body.error = "bad password";
		res.render("projects/edit", { model: req.body });
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
		req.body.tags,		
		id
	];
	const sql = "UPDATE projects SET title = ?, type = ?, os = ?, description = ?, demo = ?, github = ?, content = ?, interest = ?, tags = ? WHERE (id = ?)";
	db.run(sql, project, err => {
		if (err) return console.error(err.message);
		const projectID = id;
		const targetPath = path.join(`./public/uploads/projects/${projectID}/`);
		console.log(req.file)
		if (!req.file) {
			res.redirect("/projects");
			return ;
		}
		checkAndRenameUpload(req, targetPath, "image", (fileExtname) => {
			const sql = "UPDATE projects SET imgname = ? WHERE (id = ?)";
			db.run(sql, [`image${fileExtname}`, projectID], err => {
				if (err) return console.error(err.message);
			});
			res.redirect("/projects");
			return ;
		}, (fileExtname) => {
			res.status(403);
			req.body.error = `File extension not allowed ${fileExtname}`;
			res.render("projects/edit", { model: req.body });
			return ;
		});
	});
});

router.get("/create", (req, res) => {
	res.render("projects/create", { model: {} });
});

router.post("/create", uploadProject.single("image"), function (req, res) {
	console.log(req.body)
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
	db.run(sql, project, function (err, data) {
		console.info(this)
		if (err) return console.error(err.message);
		const projectID = this.lastID;
		const targetPath = path.join(`./public/uploads/projects/${projectID}/`);
		console.log(req.file)
		if (!req.file) {
			res.redirect("/projects");
			return ;
		}
		checkAndRenameUpload(req, targetPath, "image", (fileExtname) => {
			const sql = "UPDATE projects SET imgname = ? WHERE (id = ?)";
			db.run(sql, [`image${fileExtname}`, projectID], err => {
				if (err) return console.error(err.message);
				res.redirect("/projects");
			});
		}, (fileExtname) => {
			res.status(403);
			req.body.error = `File extension not allowed ${fileExtname}`;
			res.render("projects/create", { model: req.body });
			return ;
		});
	});
});

router.get("/delete/:id", (req, res) => {
	// TODO delete images
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

function checkAndRenameUpload(req, targetPath, filenameBody, succescallback, failcallback) {
	const tempPath = req.file.path;
	const fileExtname = path.extname(req.file.originalname).toLowerCase();
	console.log(`fileExtname = ${fileExtname}`)
	switch (fileExtname) {
		case ".png":
		case ".jpg":
		case ".jpeg":
			console.log("will RENAME")
			fs.promises.mkdir(targetPath, { recursive: true })
			.then(() => {
				fs.rename(tempPath, `${targetPath}${filenameBody}${fileExtname}`, err => {
					if (err) return console.error(err);
					if (succescallback) {
						succescallback(fileExtname);
						return;
					}
				});
			});
			break;
		default:
			fs.unlink(tempPath, err => {
				if (err) return console.error(err);
			});
			failcallback(fileExtname);
			break;
	}
}

module.exports = router;
