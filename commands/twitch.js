const config = require("../config.json");

function twitch(message, twitchNotifications) {
	if (config.BOT.ADMIN_ID.includes(parseInt(message.author.id))) {
		if (twitchNotifications) {
			message.channel.send('Les notifications Twitch ont été désactivées');
			return false;
		} else {
			message.channel.send('Les notifications Twitch ont été activées');
			return true;
		}
	} else {
		message.channel.send('Vous n\'avez pas les permissions requises pour effectuer cette action');
	}
}

module.exports = twitch;