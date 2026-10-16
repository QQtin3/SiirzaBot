/** speedrun.com public API (v1). Read-only requests, no API key needed. */
const API_URL = "https://www.speedrun.com/api/v1";

export interface SpeedrunCategory {
	gameId: string;
	categoryId: string;
	name: string;
}

export interface PersonalBest {
	place: number;
	seconds: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

/** Calls an endpoint and returns its `data` field. */
const getData = async (path: string, params: Record<string, string> = {}): Promise<unknown> => {
	const url = new URL(`${API_URL}/${path}`);
	for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);

	const response = await fetch(url, {
		headers: { Accept: "application/json", "User-Agent": "zaxbot-live-announcer" },
	});
	if (!response.ok) {
		throw new Error(`speedrun.com ${path} request failed with status ${response.status}`);
	}

	const body: unknown = await response.json();
	if (!isRecord(body)) throw new Error(`Unexpected speedrun.com ${path} response`);

	return body.data;
};

const getRecords = async (path: string, params: Record<string, string> = {}): Promise<Record<string, unknown>[]> => {
	const data = await getData(path, params);
	return Array.isArray(data) ? data.filter(isRecord) : [];
};

const readPrimaryTime = (run: unknown): number | null => {
	if (!isRecord(run) || !isRecord(run.times)) return null;

	return typeof run.times.primary_t === "number" ? run.times.primary_t : null;
};

/** The category of the current run, and the runner's PB in it (null when they have no run in it yet). */
export interface CurrentRun {
	category: SpeedrunCategory;
	personalBest: PersonalBest | null;
}

const findUserId = async (profile: string): Promise<string | null> => {
	const [user] = await getRecords("users", { lookup: profile });
	return typeof user?.id === "string" ? user.id : null;
};

/** Embedded resources are wrapped in a `data` object. */
const readEmbedded = (value: unknown): Record<string, unknown> | null =>
	isRecord(value) && isRecord(value.data) ? value.data : null;

/** A speedrun.com game is linked to the Twitch game through its Twitch name, or its international name. */
const isLinkedToTwitchGame = (game: Record<string, unknown> | null, twitchGameName: string): boolean => {
	if (game === null || !isRecord(game.names)) return false;

	return game.names.twitch === twitchGameName || game.names.international === twitchGameName;
};

const getGameCategories = async (gameId: string): Promise<SpeedrunCategory[]> =>
	(await getRecords(`games/${gameId}/categories`))
		.filter(({ type }) => type === "per-game")
		.flatMap(({ id, name }) =>
			typeof id === "string" && typeof name === "string" ? [{ gameId, categoryId: id, name }] : [],
		);

const readPersonalBest = (entry: Record<string, unknown> | undefined): PersonalBest | null => {
	const seconds = readPrimaryTime(entry?.run);
	if (typeof entry?.place !== "number" || seconds === null) return null;

	return { place: entry.place, seconds };
};

/**
 * The run written in the live title, searched in the games of the speedrun.com profile only.
 * Every game of the profile linked to the Twitch game is checked (main game, category extensions...).
 * The longest matching category name wins, so "Any% No RBA" is preferred over "Any%". Null when none is found.
 */
export const getGamecategoryRaw = async (
	profile: string,
	gameName: string,
	streamTitle: string,
): Promise<CurrentRun | null> => {
	if (gameName === "" || streamTitle === "") return null;

	const userId = await findUserId(profile);
	if (userId === null) {
		console.warn(`speedrun.com profile "${profile}" not found`);
		return null;
	}

	const personalBests = await getRecords(`users/${userId}/personal-bests`, { embed: "game" });
	const gameIds = [
		...new Set(
			personalBests
				.map(({ game }) => readEmbedded(game))
				.filter((game) => isLinkedToTwitchGame(game, gameName))
				.map((game) => game?.id)
				.filter((id): id is string => typeof id === "string"),
		),
	];
	if (gameIds.length === 0) {
		console.warn(`No run of "${profile}" on speedrun.com for the Twitch game "${gameName}"`);
		return null;
	}

	const title = streamTitle.toLowerCase();
	const category = (await Promise.all(gameIds.map(getGameCategories)))
		.flat()
		.filter(({ name }) => title.includes(name.toLowerCase()))
		.reduce<SpeedrunCategory | null>(
			(longest, current) => (current.name.length > (longest?.name.length ?? 0) ? current : longest),
			null,
		);
	if (category === null) return null;

	const personalBest = personalBests.find(
		({ run }) => isRecord(run) && run.game === category.gameId && run.category === category.categoryId,
	);
	return { category, personalBest: readPersonalBest(personalBest) };
};

/** World record time in seconds, null when the leaderboard is empty. */
export const getWorldRecord = async (category: SpeedrunCategory): Promise<number | null> => {
	const leaderboard = await getData(`leaderboards/${category.gameId}/category/${category.categoryId}`, { top: "1" });
	if (!isRecord(leaderboard) || !Array.isArray(leaderboard.runs)) return null;

	const first: unknown = leaderboard.runs.find((entry: unknown) => isRecord(entry) && entry.place === 1);
	return isRecord(first) ? readPrimaryTime(first.run) : null;
};
