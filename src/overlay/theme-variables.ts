import themeCss from "../../theme.css";

/**
 * theme.css is read as text and its custom properties are extracted here, so it stays
 * the single source of truth for the Worker and for the overlay.html browser preview.
 */
const COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const BLOCK_PATTERN = /([^{}]+)\{([^{}]*)\}/g;
const DECLARATION_PATTERN = /(--[\w-]+)\s*:\s*([^;]+);/g;
const ALPHA_PATTERN = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*([\d.]+)\s*)?\)/;

const THEME_CSS = themeCss.replace(COMMENT_PATTERN, "");

export type ThemeVariables = Readonly<Record<string, string>>;

/** Returns the variables of the `:root` block, then the ones of `[data-game="<gameId>"]` on top of it. */
export const getThemeVariables = (gameId?: string): ThemeVariables => {
	const selectors = gameId === undefined ? [":root"] : [":root", `[data-game="${gameId}"]`];

	const entries = [...THEME_CSS.matchAll(BLOCK_PATTERN)]
		.filter(([, selector]) => selectors.includes(selector?.trim() ?? ""))
		.flatMap(([, , declarations]) => [...(declarations ?? "").matchAll(DECLARATION_PATTERN)])
		.map(([, name, value]): [string, string] => [name ?? "", (value ?? "").trim()]);

	// Later entries win, so the game block overrides :root
	return Object.fromEntries(entries);
};

export const readVariable = (variables: ThemeVariables, name: string): string => {
	const value = variables[name];
	if (value === undefined) {
		throw new Error(`Missing ${name} in theme.css`);
	}

	return value;
};

export const readPixelVariable = (variables: ThemeVariables, name: string): number => {
	const value = Number.parseInt(readVariable(variables, name), 10);
	if (Number.isNaN(value)) {
		throw new Error(`Invalid pixel value for ${name} in theme.css`);
	}

	return value;
};

/** Reads the alpha channel of an rgba() variable, 1 when there is none. */
export const readAlphaVariable = (variables: ThemeVariables, name: string): number => {
	const alpha = ALPHA_PATTERN.exec(readVariable(variables, name))?.[1];
	return alpha === undefined ? 1 : Number.parseFloat(alpha);
};
