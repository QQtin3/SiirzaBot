const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const config = require('../config.json');
const embedConfig = require('../embedConfig.json');
const {getGameNameString, getGameCategoryString} = require("../api/twitchAPI");
const {getCurrentLeaderboardData} = require("../api/srcAPI");
const {formatSpeedrunTime} = require("./util");


async function createTwitchEmbed() {
	const gamenameRaw = await getGameNameString();
	const gamecategoryRaw = await getGameCategoryString();

	const gamename = "**" + gamenameRaw + "**";
	const gamecategory = "**" + gamecategoryRaw + "**";

	const embed = new EmbedBuilder();
	embed.setAuthor({
		name: embedConfig.GENERAL.AUTHOR.NAME,
		url: embedConfig.GENERAL.AUTHOR.URL,
		iconURL: embedConfig.GENERAL.AUTHOR.ICONURL
	})
		.setTitle(embedConfig.GENERAL.TITLE)
		.setURL("https://twitch.tv/" + config.BOT.STREAMER_USERNAME)
		.setDescription('Rejoins nous sur ' + gamename + ' pour du speedrun ' + gamecategory)
		.setColor(embedConfig.GENERAL.COLOR)
		.setImage("https://media.discordapp.net/attachments/1128439320097869966/1479841497812570345/annonce_mst.jpg")

	// Adding time only if the user already has a run in the leaderboard
	const lbdata = await getCurrentLeaderboardData(gamenameRaw, gamecategoryRaw);
	let currentTimeText = "Pas encore de PB existant pour cette catégorie !";
	if (lbdata) {
		const suffixPlace = lbdata.place === 1 ? 'er' : 'ème';
		const txtTime = formatSpeedrunTime(lbdata.time);
		currentTimeText= `Actuellement **${lbdata.place + suffixPlace}** avec un **${txtTime}**`
	}

	embed.addFields({
			name: "",
			value: `${currentTimeText}`,
			inline: false
		},
		{
			name: "",
			value: `Record du monde: "temps du record"`,
			inline: false
		}
	);
	return embed;
}

const button = new ButtonBuilder()
	.setLabel("Regarder le stream")
	.setStyle(ButtonStyle.Link)
	.setURL(`https://twitch.tv/${config.BOT.STREAMER_USERNAME}`);

const streamButton = new ActionRowBuilder().addComponents(button);

module.exports = {createTwitchEmbed, streamButton};