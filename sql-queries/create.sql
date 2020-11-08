-- SQLite
CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title VARCHAR(100) NOT NULL,
	type VARCHAR(100),
	os VARCHAR(255),
	description VARCHAR(255),
	demo VARCHAR(255),
	github VARCHAR(255),
	imgname VARCHAR(255),
	content TEXT,
	interest INTEGER,
	tags TEXT,
	carrousel_images TEXT
);