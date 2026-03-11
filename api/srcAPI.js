const config = require('../config.json');

async function fetchRunnerID() {
	try {
		const url = `https://www.speedrun.com/api/v1/profile`;
		const response = await fetch(url, {
			method: 'GET', headers: {
				'Accept': 'application/json', 'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
			},
		});
		let returnValue = await response.json();
		return returnValue.data.id;
	} catch (error) {
		console.error('Error fetching runner data:', error);
	}
}

async function fetchRuns() {
	try {
		const runnerID = await fetchRunnerID();
		if (!runnerID) {
			console.error('Invalid runner ID received');
			return [];
		}

		const url = `https://www.speedrun.com/api/v1/runs?user=${runnerID}`;
		const response = await fetch(url, {
			method: 'GET', headers: {
				'Accept': 'application/json', 'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
			},
		});
		const value = await response.json();
		return value.data;
	} catch (error) {
		console.error('Error fetching runs:', error);
		return [];
	}
}

async function processingRuns() {
	const runs = await fetchRuns();
	let newVerifiedRuns = [];

	for (const run of runs) {
		if (run.status.status === 'verified') {
			const verifiedDate = new Date(run.status['verify-date']);
			let currentDate = new Date();
			currentDate.setMinutes(currentDate.getMinutes() - 15);
			if (verifiedDate >= currentDate) {  // If verify the date was within 15 min from the current time
				const game = await gameById(run.game);
				const gameName = game.names.international;
				const category = await categoryById(run.category);
				const categoryName = category.name;
				const time = formatISODuration(run.times.primary);

				let currentRun = {
					name: gameName, link: run.weblink, categoryName: categoryName, time: time
				}
				newVerifiedRuns.push(currentRun);
			}
		}
	}
	return newVerifiedRuns;
}

async function gameIdByName(game) {
	try {
		const url = `https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(game)}&max=1`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
			},
		});
		const value = await response.json();
		return value.data[0].id;
	} catch (error) {
		console.error('Error fetching gameIdByName:', error);
	}
}

async function gameDataByName(game) {
	try {
		const url = `https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(game)}&max=1`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
			},
		});
		const value = await response.json();
		return value.data[0];
	} catch (error) {
		console.error('Error fetching gameIdByName:', error);
	}
}

async function gameById(id) {
	try {
		const url = `https://www.speedrun.com/api/v1/games/${id}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
			},
		});
		const value = await response.json();
		return value.data;
	} catch (error) {
		console.error('Error fetching gameById:', error);
	}
}

async function categoryById(id) {
	try {
		const url = `https://www.speedrun.com/api/v1/games/${id}/categories`;
		const response = await fetch(url, {
			method: 'GET', headers: {
				'Accept': 'application/json',
				'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
			},
		});
		const value = await response.json();
		return value.data;
	} catch (error) {
		console.error('Error fetching category:', error);
	}
}

async function getUserId(username) {
	const url = `https://www.speedrun.com/api/v1/users?lookup=${encodeURIComponent(username)}`;

	const res = await fetch(url);
	const data = await res.json();

	if (!data.data.length) {
		return null;
	}

	return data.data[0].id;
}

async function getCurrentLeaderboardData(gameName, gameCategory) {
	const gameId = await gameIdByName(gameName);
	const categories = await categoryById(gameId);
	// Seek each category name
	let categoryId = "";
	categories.forEach(category => {
		if (category.name === gameCategory) {
			categoryId = category.id;
		}
	})

	// If category id has been found
	if (categoryId !== "") {
		const userId = await getUserId(config.SPEEDRUNCOM_API.RUNNER_USERNAME);
		if (userId) {
			// Fetch
			const url = `https://www.speedrun.com/api/v1/users/${userId}/personal-bests`;
			const res = await fetch(url);
			const data = await res.json();
			if (data) {
				let personalBest = null;
				data.data.forEach(runObject => {
					if (runObject.run.game === gameId && runObject.run.category === categoryId) {
						personalBest = runObject;
					}
				})
				if (personalBest) {
					return {
						place: personalBest.place,
						time: personalBest.run.times.primary_t
					};
				} else {
					return null;
				}
			} else {
				throw new Error('No personal-bests data found.');
			}
		} else {
			throw new Error('No speedrun.com user found.');
		}
	} else {
		throw new Error('No speedrun.com category found.');
	}
}

function formatISODuration(duration) {
	const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?/;
	const matches = duration.match(regex);

	const hours = parseInt(matches[1] || 0, 10);
	const minutes = parseInt(matches[2] || 0, 10);
	const seconds = parseInt(matches[3] || 0, 10);

	// Build the formatted string based on available components
	let formattedDuration = '';
	if (hours > 0) formattedDuration += `${hours}h `;
	if (minutes > 0) formattedDuration += `${minutes}min `;
	if (seconds > 0) {
		formattedDuration += `${seconds}s`;
	}

	return formattedDuration.trim();
}

module.exports = {processingRuns, gameIdByName, gameDataByName, categoryById, getCurrentLeaderboardData};