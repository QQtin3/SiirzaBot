const config = require("../config.json");

function speedruncom(message, speedruncomNotifications) {
	if (config.BOT.ADMIN_ID.includes(parseInt(message.author.id))) {
		if (speedruncomNotifications) {
			message.channel.send('Les notifications concernant Speedrun.com ont été désactivées');
			return false;
		} else {
			message.channel.send('Les notifications concernant Speedrun.com ont été activées');
			return true;
		}
	} else {
		message.channel.send('Vous n\'avez pas les permissions requises pour effectuer cette action');
	}
}

module.exports = speedruncom;