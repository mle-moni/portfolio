module.exports = {
	apps : [{
		name: "portfolio",
		script: 'npm start',
		watch: '.',
		ignore_watch : ["node_modules", "public", "data", ".gitignore", ".git"]
	}],
};
