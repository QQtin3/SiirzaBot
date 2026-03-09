const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const config = require('../config.json');

const twitchEmbed = new EmbedBuilder()
	.setAuthor({
		name: "Zax",
		url: "https://zaxpeaks.fr",
		iconURL: "https://files.zaxpeaks.fr/files/img/logo.png"
	})
	.setTitle("SiirZax est en live !")
	.setURL("https://twitch.tv/siirzax")
	.setDescription('Rejoins nous sur "jeu" pour du speedrun "catégorie"\nActuellement "numéro sur le leaderboard" avec un "temps"\nRecord du monde: "temps du record"')
	.setColor(16716856)
	.setImage("https://media.discordapp.net/attachments/1128439320097869966/1479841497812570345/annonce_mst.jpg")
	.addFields({
		name: "Place + Temps",
		value: "WR:",
		inline: false
	});

const button = new ButtonBuilder()
	.setLabel("Regarder le stream")
	.setStyle(ButtonStyle.Link)
	.setURL(`https://twitch.tv/${config.TWITCH_NOTIF.STREAMER_USERNAME}`);

const streamButton = new ActionRowBuilder().addComponents(button);

module.exports = {twitchEmbed, streamButton};