const fs = require('fs');
const path = require('path');

const functions = {};

// Loads every command in this folder
fs.readdirSync(__dirname).forEach(file => {
	if (file !== 'autoload.js') {
		const name = file.replace('.js', '');
		functions[name] = require(path.join(__dirname, file));
	}
});

module.exports = functions;