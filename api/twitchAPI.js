const config = require('../config.json');
const {gameIdByName, categoryById, gameDataByName} = require("./srcAPI");
const {markdownFormat} = require("../functions/markdownFormat");

let twitchApiToken = null;


/**
 * Fetch stream information from the official Twitch API
 * @param username
 * @return {Promise<any>}
 */
async function fetchStreamInfo(username = config.BOT.STREAMER_USERNAME) {
	let response = await fetch(config.TWITCH_API.URL + '/streams?user_login=' + username, {
		method: "GET",
		headers: {
			"Client-Id": config.TWITCH_API.CLIENT_ID,
			"Authorization": `Bearer ${twitchApiToken}`,
		},
	})
	return response.json();
}


/**
 * Checks if streamer is currently on live
 * @param data If called with some data fetched in another function, doesn't API call again
 * @return boolean True if streamer is live, false otherwise
 */
async function isCurrentlyOnLive(data = null) {
	let result;
	if (data == null) {
		result = await fetchStreamInfo();
	} else {
		result = data;
	}
	return result.data.length > 0;
}

/**
 * Retrieves game name as string and allows to put it in bold & inline shape for Markdown
 * @param bold Bold for game name
 * @param inline Inline for game name
 * @return string Game name if live with prefix/suffix Markdown, empty string otherwise
 */
async function getGameNameString(bold = false, inline = false) {
	const result = await fetchStreamInfo();
	if (await isCurrentlyOnLive(result)) {
		const gameName = result.data[0].game_name;
		return markdownFormat(gameName, bold, inline);
	} else {
		return "";
	}
}

async function getGameCategoryString( bold = false, inline = false) {
	const streamData = await fetchStreamInfo();
	if (streamData.data.length > 0) {
		const gameName = streamData.data[0].game_name;
		const gameData = await gameDataByName(gameName);
		const gameId = gameData.id;

		// If a game has been found
		if (gameId) {
			const categories = await categoryById(gameId);

			// Seek each category name in the stream title
			const streamTitle = streamData.data[0].title;
			let currentCategory = null;
			categories.forEach(category => {
				if (streamTitle.includes(category.name) && currentCategory == null) {
					currentCategory = category.name;
				}
			})

			if (currentCategory) {
				return markdownFormat(currentCategory, bold, inline);
			} else {
				return null;
			}

		} else {
			throw new Error("Game ID not found.");
		}
	} else {
		throw new Error("Stream data not found.");
	}
}

/**
 * Makes a request to get a new fresh token from Twitch API using ClientID & Client Secret from configuration file
 * @return {Promise<void>}
 */
async function updateTwitchAPIToken() {
	const response = await fetch("https://id.twitch.tv/oauth2/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: config.TWITCH_API.CLIENT_ID,
			client_secret: config.TWITCH_API.CLIENT_SECRET,
			grant_type: "client_credentials"
		})
	});

	const data = await response.json();

	if (data.access_token) {
		twitchApiToken = data.access_token;
		console.log("Twitch token updated");
	} else {
		console.log('Twitch token not updated. Data = ' + data);
	}
}

module.exports = {isCurrentlyOnLive, updateTwitchAPIToken, getGameNameString, getGameCategoryString};