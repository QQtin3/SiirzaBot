# SiirzaBot
A DiscordJS bot sending messages in a specific Discord channel if a specific streamer is online, can also be configured to query verified runs posted by somebody on speedrun.com 


# How to setup?
There is no need to be an expert for that since it's a Discord Bot so if you follow these guidelines you should be fine :

1. Dowload the last version (in release section)
2. Open the folder and edit the `config.default.json` file to match your settings (see the section below for more details)
3. Rename your configuration file to `config.json`
4. Use `npm install` to install needed dependencies.
5. Run `index.js`

There you go!

# What to put in my configuration file?
Some more details :
- `ADMIN_ID` is an array fullfilled with Discord IDs as integer, so no need to put them as a string.
- `DISCORD_CHANNEL_ID`s are where your notifications will be sent **IDs need to be a string so keep the quotes**.
- About Twitch API, just take a look at (this repository)[https://github.com/mauricew/twitch-graphql-api] for more details and how to fill `HEADERS` section.
- `RUNNER_APIKEY` is found on your (speedrun.com)[https://www.speedrun.com] profile in the Developper section which you can find by scrolling down a bit.
