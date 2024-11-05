const config = require('./config.json');

function ping(message) {
    message.channel.send(`pong`);
}

function twitch(message, twitchNotifications) {
    if (config.BOT.ADMIN_ID.includes(parseInt(message.author.id))) {
        if (twitchNotifications) {
            message.channel.send('Les notifications concernant Twitch ont été désactivées');
            return false;
        } else {
            message.channel.send('Les notifications concernant Twitch ont été activées');
            return true;
        }
    } else {
        message.channel.send('Vous n\'avez pas les permissions requises pour effectuer cette action');
    }
}

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

function commandNotFound(message) {
    message.channel.send('Commande non trouvée ! Essayez \`' + config.BOT.PREFIX + 'commandes\` pour voir les commandes disponibles');
}

async function postTwitchNotif(client) {
    try {
        const channel = await client.channels.fetch(config.TWITCH_NOTIF.DISCORD_CHANNEL_ID);
        await channel.send(config.TWITCH_NOTIF.MESSAGE + " :  https://twitch.com/" + config.TWITCH_NOTIF.STREAMER_USERNAME);
        console.log("Twitch notification - POSTED")
    } catch (e) {
        console.log(e);
    }
}

async function postSrcNotif(client, gameName, category, time, link) {
    try {
        const channel = await client.channels.fetch(config.SPEEDRUN_NOTIF.DISCORD_CHANNEL_ID);
        await channel.send(`${config.SPEEDRUN_NOTIF.MESSAGE} \n🎮[**${gameName}** - **${category}**](${link}) \n⏱️ **${time}**`);
        console.log("Speedrun.com notification - POSTED")
    } catch (e) {
        console.log(e);
    }
}

module.exports = {commandNotFound, twitch, speedruncom, ping, postTwitchNotif, postSrcNotif};