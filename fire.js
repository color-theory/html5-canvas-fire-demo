document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById('fireCanvas');
	const ctx = canvas.getContext('2d');

	const lowResWidth = 640;
	const lowResHeight = 480;
	canvas.width = lowResWidth;
	canvas.height = lowResHeight;

	const imageData = ctx.createImageData(lowResWidth, lowResHeight);
	let pixels = imageData.data;

	let lastTime = 0;
	let timingInterval = 30;
	let magnitude = 9;
	let hueShift = 0;
	let heatMap = Array(lowResWidth * lowResHeight).fill(0);
	let isHolding = false;
	let holdX = 0;
	let holdY = 0;

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

	function rgbToHsl(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		let max = Math.max(r, g, b);
		let min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;

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

	const reseed = () => {
		for (let x = 0; x < lowResWidth; x++) {
			let index = (x * 4) + 0 * (lowResWidth * 4);
			let hue = (hueShift + (x / lowResWidth / 4) * 360) % 360;
			let saturation = 90 + Math.random() * 20;
			let lightness = 10 + Math.random() * 30;

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
			for (let y = 1; y < lowResHeight; y++) {
				for (let x = 0; x < lowResWidth; x++) {
					let index = (x * 4) + y * (lowResWidth * 4);
					let aboveIndex = (x * 4) + (y - 1) * (lowResWidth * 4);
					let coolingEffect = 0.1 + 0.9 * (Math.sin(Math.PI) ** 2);
					let decay = Math.exp(-y / (lowResHeight * coolingEffect * 10));
					let factor = 1 + magnitude * decay;

					heatMap[y * lowResWidth + x] *= 0.3;
					let heat = heatMap[y * lowResWidth + x];

					r = Math.max(0, (pixels[aboveIndex] * factor + pixels[index]) / (factor + .92) - 1) + heat / 4;
					g = Math.max(0, (pixels[aboveIndex + 1] * factor + pixels[index + 1]) / (factor + .92) - 1) + heat / 4;
					b = Math.max(0, (pixels[aboveIndex + 2] * factor + pixels[index + 2]) / (factor + .92) - 1) + heat / 4;

					if (heat > 0) {
						let [h, s, l] = rgbToHsl(r, g, b);
						h = (h + heat) % 360;
						[r, g, b] = hslToRgb(h, s, l);
					}

					pixels[index] = r;
					pixels[index + 1] = g;
					pixels[index + 2] = b;
					pixels[index + 3] = 255;

					heatMap[y * lowResWidth + x] *= 0.9;
				}
			}

			if (isHolding) {
				applyHeat(holdX, holdY);
			}

			ctx.putImageData(imageData, 0, 0);
			lastTime = timestamp;
			reseed();
		}
		requestAnimationFrame(updateCanvas);
	}

	function applyHeat(x, y) {
		let rect = canvas.getBoundingClientRect();

		let canvasX = Math.floor((x / rect.width) * lowResWidth);
		let canvasY = Math.floor((y / rect.height) * lowResHeight);

		let radius = 20;
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				let nx = canvasX + dx;
				let ny = canvasY + dy;

				if (nx >= 0 && nx < lowResWidth && ny >= 0 && ny < lowResHeight && (dx * dx + dy * dy <= radius * radius)) {
					heatMap[ny * lowResWidth + nx] = Math.min(heatMap[ny * lowResWidth + nx] + 30, 360);
				}
			}
		}
	}

	function startHold(event) {
		isHolding = true;
		holdX = event.clientX;
		holdY = event.clientY;
	}

	function stopHold() {
		isHolding = false;
	}

	function updateHoldPosition(event) {
		if (isHolding) {
			holdX = event.clientX;
			holdY = event.clientY;
		}
	}

	canvas.addEventListener('mousedown', startHold);
	canvas.addEventListener('mousemove', updateHoldPosition);
	canvas.addEventListener('mouseup', stopHold);

	canvas.addEventListener('touchstart', function (event) {
		let touch = event.touches[0];
		startHold(touch);
	});
	canvas.addEventListener('touchmove', function (event) {
		let touch = event.touches[0];
		updateHoldPosition(touch);
	});
	canvas.addEventListener('touchend', stopHold);

	console.log(`   /\\_/\\\n  ( o.o )\n   > ^ <`);
	console.log("Hey, I'm looking for a job! If you like this, please consider hiring me! https://johnstringer.com/");

	reseed();
	requestAnimationFrame(updateCanvas);
});
