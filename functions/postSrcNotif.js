const config = require('../config.json');

async function postSrcNotif(client, gameName, category, time, link) {
	try {
		const channel = await client.channels.fetch(config.SPEEDRUN_NOTIF.DISCORD_CHANNEL_ID);
		await channel.send(`${config.SPEEDRUN_NOTIF.MESSAGE} \n🎮[**${gameName}** - **${category}**](${link}) \n⏱️ **${time}**`);
		console.log("Speedrun.com notification - POSTED")
	} catch (e) {
		console.log(e);
	}
}

module.exports = {postSrcNotif};