export interface Env {
	IMAGES: ImagesBinding;
	STATE: KVNamespace;
	TWITCH_LOGIN: string;
	/** speedrun.com profile of the runner, where the run category and the PB are searched. */
	SPEEDRUN_PROFILE: string;
	TWITCH_CLIENT_ID: string;
	TWITCH_CLIENT_SECRET: string;
	DISCORD_WEBHOOK_URL: string;
	/** Password protecting the announcement page. */
	ADMIN_PASSWORD: string;
	/** Public URL of the Montserrat Black font file (.ttf, .otf, .woff or .woff2). */
	FONT_URL: string;
}
