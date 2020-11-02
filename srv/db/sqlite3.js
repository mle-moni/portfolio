const assert = require("assert");
const sqlite3 = require("sqlite3").verbose();
let _db = null;

function init(path, callback) {
    if (_db) {
        console.warn("Trying to init DB again!");
        return callback(null);
	}
	_db = new sqlite3.Database(path, err => {
		if (err) {
			return callback(err);
		}
		return callback(null);
	  });
}

function get() {
    assert.ok(_db, "Db has not been initialized. Please call initDb() first.");
    return _db;
}


module.exports = {
    get,
    init
};
