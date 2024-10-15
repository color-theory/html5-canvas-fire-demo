export const hslToRgb = (h: number, s: number, l: number) => {
	s /= 100;
	l /= 100;
	let c = (1 - Math.abs(2 * l - 1)) * s;
	let x = c * (1 - Math.abs((h / 60) % 2 - 1));
	let m = l - c / 2;
	let r = 0, g = 0, b = 0;

	if (0 <= h && h < 60) { r = c; g = x; b = 0; }
	else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
	else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
	else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
	else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
	else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	return [r, g, b];
}

export const rgbToHsl = (r: number, g: number, b: number) => {
	r /= 255;
	g /= 255;
	b /= 255;
	let max = Math.max(r, g, b);
	let min = Math.min(r, g, b);
	let h = 0, s = 0, l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h *= 60;
	}

	return [Math.round(h), s * 100, l * 100];
}