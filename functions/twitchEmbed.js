const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const config = require('../config.json');
const embedConfig = require('../embedConfig.json');
const {getGameNameString, getGameCategoryString} = require("../api/twitchAPI");


async function createTwitchEmbed() {
	const gamename = await getGameNameString(true);
	const gamecategory = await getGameCategoryString( true);

	const twitchEmbed = new EmbedBuilder()
		.setAuthor({
			name: embedConfig.GENERAL.AUTHOR.NAME,
			url: embedConfig.GENERAL.AUTHOR.URL,
			iconURL: embedConfig.GENERAL.AUTHOR.ICONURL
		})
		.setTitle(embedConfig.GENERAL.TITLE)
		.setURL("https://twitch.tv/" + config.BOT.STREAMER_USERNAME)
		.setDescription('Rejoins nous sur ' + gamename +  ' pour du speedrun ' + gamecategory + '\nActuellement "numéro sur le leaderboard" avec un "temps"\nRecord du monde: "temps du record"')
		.setColor(embedConfig.GENERAL.COLOR)
		.setImage("https://media.discordapp.net/attachments/1128439320097869966/1479841497812570345/annonce_mst.jpg")
		.addFields({
			name: "Place + Temps",
			value: "WR:",
			inline: false
		});
	return twitchEmbed;
}

const button = new ButtonBuilder()
	.setLabel("Regarder le stream")
	.setStyle(ButtonStyle.Link)
	.setURL(`https://twitch.tv/${config.BOT.STREAMER_USERNAME}`);

const streamButton = new ActionRowBuilder().addComponents(button);

module.exports = {createTwitchEmbed, streamButton};