document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById('fireCanvas');
	const ctx = canvas.getContext('2d');

	const width = canvas.width;
	const height = canvas.height;
	const imageData = ctx.createImageData(width, height);
	let pixels = imageData.data;

	let lastTime = 0;
	let timingInterval = 20;
	let magnitude = 9;
	let hueShift = 0;

	function hslToRgb(h, s, l) {
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

	const reseed = () => {
		for (let x = 0; x < width; x++) {
			let index = (x * 4) + 0 * (width * 4);
			let hue = (hueShift + (x / width / 8) * 360) % 360;
			let saturation = 30 + Math.random() * 50;
			let lightness = 9 + Math.random() * 40;


			let [r, g, b] = hslToRgb(hue, saturation, lightness);

			pixels[index] = r;
			pixels[index + 1] = g;
			pixels[index + 2] = b;
			pixels[index + 3] = 255;
		}
		hueShift = (hueShift + 1) % 360;
	}

	function updateCanvas(timestamp) {
		if (timestamp - lastTime > timingInterval) {
			for (let y = 1; y < height; y++) {
				for (let x = 0; x < width; x++) {
					let index = (x * 4) + y * (width * 4);
					let aboveIndex = (x * 4) + (y - 1) * (width * 4);
					let coolingEffect = 0.1 + 0.8 * (Math.sin(Math.PI + y) ** 2);
					let decay = Math.exp(-y / (height * coolingEffect * 3));
					let factor = 1 + magnitude * decay;

					pixels[index] = Math.max(0, (pixels[aboveIndex] * factor + pixels[index]) / (factor + .92) - 1);
					pixels[index + 1] = Math.max(0, (pixels[aboveIndex + 1] * factor + pixels[index + 1]) / (factor + .92) - 1);
					pixels[index + 2] = Math.max(0, (pixels[aboveIndex + 2] * factor + pixels[index + 2]) / (factor + .92) - 1);
					pixels[index + 3] = 255;
				}
			}
			ctx.putImageData(imageData, 0, 0);
			lastTime = timestamp;
			reseed();
		}
		requestAnimationFrame(updateCanvas);
	}
	reseed();
	console.log(
		` /\\_/\\
  ( o.o )
   > ^ <
`);
	console.log("Hey, I'm looking for a job! If you like this, please consider hiring me! https://johnstringer.com/");
	requestAnimationFrame(updateCanvas);
});
