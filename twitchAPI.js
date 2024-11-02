const config = require('./config.json');
const STREAMER_USERNAME = config.TWITCH_NOTIF.STREAMER_USERNAME;
const BODY = `[
  {
      "operationName": "VideoPlayerStreamMetadata",
      "variables": {
          "channel": "${STREAMER_USERNAME}"
      },
      "extensions": {
          "persistedQuery": {
              "version": 1,
              "sha256Hash": "248fee6868e983c4e7b69074e888960f77735bd21a1d4a1d882b55f45d30a420"
          }
      }
  }
]`

async function fetchTwitchAPI() {
    let response = await fetch(config.TWITCH_API.URL, {
        method: "POST", headers: config.TWITCH_API.HEADERS, body: BODY
    })
    return response.json();
}


async function isCurrentlyOnLive() {
    const result = await fetchTwitchAPI();
    return !!result[0]?.data?.user?.stream?.id; // Bool
}

module.exports = {isCurrentlyOnLive};