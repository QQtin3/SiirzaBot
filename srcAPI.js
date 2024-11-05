const config = require('./config.json');

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
            throw new Error('Invalid runner ID received');
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
            if (verifiedDate >= currentDate) {  // If verify date was -15min from current time
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

async function gameById(id) {
    try {
        const url = `https://www.speedrun.com/api/v1/games/${id}`;
        const response = await fetch(url, {
            method: 'GET', headers: {
                'Accept': 'application/json', 'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
            },
        });
        const value = await response.json();
        return value.data;
    } catch (error) {
        console.error('Error fetching game:', error);
    }
}

async function categoryById(id) {
    try {
        const url = `https://www.speedrun.com/api/v1/categories/${id}`;
        const response = await fetch(url, {
            method: 'GET', headers: {
                'Accept': 'application/json', 'X-API-Key': config.SPEEDRUNCOM_API.RUNNER_APIKEY,
            },
        });
        const value = await response.json();
        return value.data;
    } catch (error) {
        console.error('Error fetching category:', error);
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

module.exports = {processingRuns};