const config = require('../config.json');
const {streamButton, createTwitchEmbed} = require("./twitchEmbed");

async function postTwitchNotif(client) {
	try {
		const channel = await client.channels.fetch(config.TWITCH_NOTIF.DISCORD_CHANNEL_ID);
		await channel.send({
			embeds: [await createTwitchEmbed()],
			components: [streamButton]
		});
		console.log("Twitch notification - POSTED")
	} catch (e) {
		console.log(e);
	}
}

module.exports = {postTwitchNotif};