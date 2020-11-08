const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const MULTER_TMP = "./public/uploads/.tmp/";
fs.promises.mkdir(MULTER_TMP, { recursive: true });
const uploadProject = multer({ dest: MULTER_TMP });

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

router.post("/edit/:id", uploadProject.fields([
	{name: "image", maxCount: 1},
	{name: "carrousel_images", maxCount: 10}
]), function (req, res) {
	const id = req.params.id;
	console.log(req.body)
	if (req.body.password != process.env.APP_PASSWD) {
		res.status(401);
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
		console.log("--------------------------------------")
		console.log(req.files)
		console.log("--------------------------------------")
		if (req.files["image"]) {
			let badExtname = checkExtnames(req.files["image"]);
			if (badExtname.length) {
				badExtnameError(req, res, badExtname, projectID);
				return ;
			}
			renameUpload(req.files["image"][0], targetPath, "image", () => {
				const sql = "UPDATE projects SET imgname = ? WHERE (id = ?)";
				db.run(sql, ["image.jpg", projectID], err => {
					if (err) return console.error(err.message);
				});
				return ;
			});
		}
		if (req.files["carrousel_images"]) {
			let badExtname = checkExtnames(req.files["carrousel_images"]);
			if (badExtname.length) {
				badExtnameError(req, res, badExtname, projectID);
				return ;
			}
			const totalFiles = req.files["carrousel_images"].length;
			for (let i = 0; i < totalFiles; i++) {
				renameUpload(req.files["carrousel_images"][i], targetPath, `carrousel${i}`);
			}
			const sql = "UPDATE projects SET carrousel_images = ? WHERE (id = ?)";
			db.run(sql, [`${totalFiles}`, projectID], err => {
				if (err) return console.error(err.message);
			});
		}
		res.redirect("/projects");
	});
}, (err) => {
	console.log(err)
});

router.get("/create", (req, res) => {
	res.render("projects/create", { model: {} });
});

router.post("/create", uploadProject.single("image"), function (req, res) {
	if (req.body.password != process.env.APP_PASSWD) {
		res.status(401);
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
		req.body.tags,
		"0"
	];
	const sql = "INSERT INTO projects (title, type, os, description, demo, github, content, interest, tags, carrousel_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	db.run(sql, project, function (err, data) {
		console.info(this)
		if (err) return console.error(err.message);
		const projectID = this.lastID;
		const targetPath = path.join(`./public/uploads/projects/${projectID}/`);
		if (!req.file) {
			res.redirect("/projects");
			return ;
		}
		let badExtname = checkExtnames([req.file]);
		if (badExtname.length) {
			badExtnameError(req, res, badExtname, projectID);
			return ;
		}
		renameUpload(req.file, targetPath, "image", () => {
			const sql = "UPDATE projects SET imgname = ? WHERE (id = ?)";
			db.run(sql, ["image.jpg", projectID], err => {
				if (err) return console.error(err.message);
				res.redirect("/projects");
			});
		});
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
			res.status(401);
			row.error = "bad password";
			res.render("projects/delete", { model: row});
			return ;
		}
		const id = req.params.id;
		const pathToDel = `./public/uploads/projects/${id}/`;
		fs.rmdir(pathToDel, { recursive: true }, () => {console.log(`deleted ${pathToDel}`)});
		const sql = "DELETE FROM projects WHERE id = ?";
		db.run(sql, id, err => {
			if (err) return console.error(err.message);
			res.redirect("/projects");
		});
	});
});

function checkExtnames(files) {
	for (let i = 0; i < files.length; i++) {
		const tempPath = files[i].path;
		const fileExtname = path.extname(files[i].originalname).toLowerCase();
		switch (fileExtname) {
			case ".png":
			case ".jpg":
			case ".jpeg":
				break;
			default:
				fs.unlink(tempPath, err => {
					if (err) return console.error(err);
				});
				return (fileExtname); // bad extname
		}
	}
	return (""); // no errors
}

function badExtnameError(req, res, fileExtname, id) {
	res.status(403);
	req.body.error = `File extension not allowed ${fileExtname}`;
	req.body.id = id;
	res.render("projects/edit", { model: req.body });
}

function renameUpload(file, targetPath, filenameBody, succescallback) {
	const tempPath = file.path;
	fs.promises.mkdir(targetPath, { recursive: true })
	.then(() => {
		let finalPath = `${targetPath}${filenameBody}.jpg`;
		fs.rename(tempPath, finalPath, err => {
			if (err) return console.error(err);
			if (succescallback) {
				succescallback();
				return;
			}
		});
	});
}

module.exports = router;
