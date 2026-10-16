import { sendAnnouncement } from "./announcement";
import type { Env } from "./env";
import { handlePageRequest } from "./page/handlers";
import { getLiveStream } from "./twitch";

const LAST_ANNOUNCED_KEY = "last_announced_stream_id";

const announceLiveIfNeeded = async (env: Env): Promise<void> => {
	const stream = await getLiveStream(env, env.TWITCH_LOGIN);
	if (!stream) return;

	const lastAnnouncedId = await env.STATE.get(LAST_ANNOUNCED_KEY);
	if (lastAnnouncedId === stream.id) return;

	await sendAnnouncement(env, env.TWITCH_LOGIN, stream);
	await env.STATE.put(LAST_ANNOUNCED_KEY, stream.id);
};

export default {
	// The announcement page (preview and sending)
	async fetch(request, env): Promise<Response> {
		return handlePageRequest(request, env);
	},

	// Automatic announcement when the Twitch stream goes live
	async scheduled(_controller, env): Promise<void> {
		await announceLiveIfNeeded(env);
	},
} satisfies ExportedHandler<Env>;
