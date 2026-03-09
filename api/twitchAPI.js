const config = require('../config.json');

let twitchApiToken = null;


/**
 * Fetch stream information from the official Twitch API
 * @param username
 * @return {Promise<any>}
 */
async function fetchStreamInfo(username = config.TWITCH_API.STREAMER_USERNAME) {
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
 * @return boolean True if streamer is live, false otherwise
 */
async function isCurrentlyOnLive() {
	const result = await fetchStreamInfo();
	console.log(result);
	return result.data.length > 0;
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

module.exports = {isCurrentlyOnLive, updateTwitchAPIToken};