# zaxbot: Twitch live announcer (Cloudflare Worker)

Cloudflare Worker that generates a 1920x1080 Discord announcement image and posts it through a Discord webhook.
Everything runs on Cloudflare: nothing has to run on the PC.

## Language

- Talk to the user in French.
- Code is only written in English: names, comments, commit messages.
- Only focus on one solution at a time. If unsure about something, say "I don't know".

## How it works

- `src/index.ts`: `fetch` serves the admin page, `scheduled` (Cron) polls Twitch and announces a new live.
- `src/announcement.ts`: shared logic. Picks the theme from the Twitch game id, gets the run with `getGamecategoryRaw(profile, gameName, title)` (profile from the `SPEEDRUN_PROFILE` var), draws the image, fetches PB/WR for the embed. speedrun.com failures never block an announcement.
- `src/games.ts`: one entry per Twitch `game_id` (background, logo, `displayName`). Unknown games use the default theme.
- `src/speedrun.ts`: speedrun.com API (public, no key). `getGamecategoryRaw(profile, gameName, streamTitle)` looks only at the games of the speedrun.com profile (from its PBs) linked to the Twitch game, and returns the category whose name is in the live title with the PB, or null = no subtitle drawn and no PB/WR fields. Categories and subcategories (speedrun.com variables) are matched by name or acronym of 3+ letters ("AFR" = "All Fairy Rewards", "NMG" = "No Major Glitches"), the speedrun.com default value is used when the title names none. Best match = most title characters explained, then the main game over "Category Extensions". Individual-level PBs are ignored. `getWorldRecord(category)` uses the same subcategories.
- `wrangler.toml` `SPEEDRUN_PROFILE`: speedrun.com profile name of the runner.
- `src/twitch.ts`: client-credentials token cached in KV, `getLiveStream` (Cron), `getChannelInfo` (page, works offline).
- `src/discord.ts`: webhook with multipart (`payload_json` + `files[0]`), embed image is `attachment://overlay.png`. Same embed as the old SiirzaBot (author, title, color, description, PB and WR fields) plus a "Regarder le stream" link button (`?with_components=true`). Embed texts are edited here.
- `src/page/`: admin page (streamer name + password only), server-rendered HTML strings.
- `src/overlay/`: image drawing with the Cloudflare Images binding (`env.IMAGES`).
- `category-names.json`: speedrun.com category name, with the subcategories found in the title (e.g. "Any% No Major Glitches"), -> text drawn on the image (e.g. "MST" -> "Medallions Stones Trials"). Checked by `render.ts`, the embed keeps the speedrun.com name. Keys are case-sensitive.
- `theme.css`: single source of truth for colors, sizes and layout. Parsed at runtime and also used by `overlay.html` (browser preview). Per-game accent gradients live in `[data-game="<twitch game_id>"]` blocks, with the game name in a comment above each one.

## Cloudflare Images constraints

- `draw` / `text` only work with `npx wrangler dev --remote` (local mode does not support them).
- Max 10 transforms per chain: layers are drawn in batches (`MAX_DRAWS_PER_CHAIN = 8`).
- Text bitmaps are cropped tight around the letters: vertical alignment is done per piece.
- Gradient text: white text + generated gradient PNG drawn with `composite: "in"`.
- Font file comes from `FONT_URL` (Lemon Milk Bold). Weight and stretch cannot be changed from code.
- Logos are transparent PNGs, one per color: `logo-{red,orange,blue,purple,green}.png`.
- Backgrounds and logos are hosted on the user's server (`files.zaxpeaks.fr`) and downloaded at each render.

## Commands

```
npx wrangler dev --remote      # test with the real Images binding
npx wrangler deploy            # publish the Worker
npx wrangler tail              # logs (shows the Twitch game_id of each announcement)
npx wrangler secret put <NAME> # TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, DISCORD_WEBHOOK_URL, ADMIN_PASSWORD
npx tsc --noEmit               # type-check
```

`[triggers]` in `wrangler.toml` enables the Cron. Remove it to announce only from the page (otherwise announcements are doubled).

## Code style

- TypeScript strict. Use strict types or `unknown`, never `any`.
- Tab indentation.
- Functional array methods (`map`, `filter`, `reduce`) instead of loops when clearer. Prefer `for...of` over `forEach`.
- Early returns instead of nested `if`.
- `===` only. `Array.includes()` instead of `indexOf() !== -1`.
- `async`/`await` instead of `.then()` chains.
- Optional chaining (`?.`) and nullish coalescing (`??`).
- `Number.parseInt()` instead of global `parseInt()`.
- Modern code, split into small components for websites. Prefer Server Components and Server Actions, avoid `useEffect` / `useState` when possible.

## CSS

- Follow good CSS practices. All theme values are CSS variables in `theme.css` (and `src/page/page-theme.css` for the admin page) so the look can be edited quickly from one place.
- Do not hardcode colors or sizes in other CSS files.
