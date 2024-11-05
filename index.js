const {Client, GatewayIntentBits} = require('discord.js');
const config = require('./config.json');
const {commandNotFound, twitch, speedruncom, ping, postTwitchNotif, postSrcNotif} = require('./botFunctions.js');
const {isCurrentlyOnLive} = require('./twitchAPI.js');
const {processingRuns} = require('./srcAPI.js');

// DiscordJS client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Define a mapping of command names to functions
const functionMapping = {
    "ping": ping,
    "twitch": twitch,
    "speedruncom": speedruncom
};

// Both notifications will be sent by default
let twitchNotifications = true;
let speedruncomNotifications = true;

let hasNotificationBeenSent = false;
let isOnLive = false;
client.once('ready', () => {
    console.log('Bot is online!');

    // Check API Twitch et gère les notifications
    loopTwitchAPI();
    loopSrcAPI();
});

let securityCooldownTriggered = false;  // If streamer disconnects make a security not to send notification again
async function loopTwitchAPI() {
    if (twitchNotifications) {      // Do not loop if notifications are off
        isOnLive = await isCurrentlyOnLive();
        if (isOnLive && !hasNotificationBeenSent) {
            await postTwitchNotif(client);
            hasNotificationBeenSent = true;
        } else if (!isOnLive && hasNotificationBeenSent) {
            if (securityCooldownTriggered) {    // If security has already been triggered (already 5min streamer is offline)
                hasNotificationBeenSent = false;
                securityCooldownTriggered = false;
            } else {
                securityCooldownTriggered = true;
                setTimeout(loopTwitchAPI, 300000)  // Loop 5min
            }
        }
        setTimeout(loopTwitchAPI, 10000)  // Loop 10s
    } else {
        setTimeout(loopTwitchAPI, 1800000) // Loop each 30min if notifications are off
    }
}

async function loopSrcAPI() {
    if (speedruncomNotifications) {
        const runs = await processingRuns();
        runs.forEach(async (run) => {
            await postSrcNotif(client, run.name, run.categoryName, run.time, run.link);
        })
        setTimeout(loopSrcAPI, 900000)  // Loop each 15min
    } else {
        setTimeout(loopSrcAPI, 3600000)  // Loop each hour if notifications are off
    }
}


client.on('messageCreate', message => {

    // Ignore bot's own messages
    if (message.author.bot) return;

    if (message.content.startsWith(config.BOT.PREFIX)) {  // Check if message starts with defined prefix
        // Get the command name by removing the prefix and any extra spaces
        const commandName = message.content.slice(1).trim().split(' ')[0];
        const commandFunction = functionMapping[commandName];

        if (commandFunction) {
            const notificationMap = {
                "twitch": { notifications: twitchNotifications, setter: (value) => { twitchNotifications = value; } },
                "speedruncom": { notifications: speedruncomNotifications, setter: (value) => { speedruncomNotifications = value; } }
            };

            if (notificationMap[commandName]) {
                const { notifications, setter } = notificationMap[commandName];
                const newValue = commandFunction(message, notifications);
                setter(newValue);
            } else {
                commandFunction(message);
            }
        } else {
            commandNotFound(message);
        }
    }
});


// Log in to Discord with your bot's token
client.login(config.BOT.APPLICATION_TOKEN);