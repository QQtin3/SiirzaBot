import { readStream, toStream } from "./bytes";
import { encodeTransparentPixel } from "./png";
import type { TextLayer } from "./text-layer";

/** A blurred shadow bitmap, with `padding` transparent pixels added on every side to hold the blur. */
export interface ShadowLayer {
	bytes: Uint8Array;
	padding: number;
}

const PADDING_PER_BLUR_PIXEL = 3;

/**
 * Text bitmaps are cropped tight around the letters, so blurring one directly would cut the blur at
 * its edges. The shadow text is first drawn on a larger transparent canvas, then the canvas is blurred.
 */
export const createSoftShadow = async (
	images: ImagesBinding,
	shadow: TextLayer,
	blur: number,
): Promise<ShadowLayer> => {
	const padding = Math.ceil(blur * PADDING_PER_BLUR_PIXEL);

	const result = await images
		.input(toStream(encodeTransparentPixel()))
		.transform({ width: shadow.width + padding * 2, height: shadow.height + padding * 2, fit: "squeeze" })
		.draw(toStream(shadow.bytes), { left: padding, top: padding })
		.transform({ blur })
		.output({ format: "image/png" });

	return { bytes: await readStream(result.image()), padding };
};
