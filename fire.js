document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById('fireCanvas');
	const ctx = canvas.getContext('2d');

	const width = canvas.width;
	const height = canvas.height;
	const imageData = ctx.createImageData(width, height);
	let pixels = imageData.data;

	let lastTime = 0;
	let timingInterval = 30;
	let magnitude = 8;

	const reseed = () => {
		for (let x = 0; x < width; x++) {
			let index = (x * 4) + 0 * (width * 4);
			pixels[index] = Math.floor(Math.random() * 200);
			pixels[index + 1] = Math.floor(Math.random() * 200);
			pixels[index + 2] = Math.floor(Math.random() * 200);
			pixels[index + 3] = 255;
		}
	}

	function updateCanvas(timestamp) {
		if (timestamp - lastTime > timingInterval) {
			for (let y = 1; y < height; y++) {
				for (let x = 0; x < width; x++) {
					let index = (x * 4) + y * (width * 4);
					let aboveIndex = (x * 4) + (y - 1) * (width * 4);
					let centerEffect = Math.abs(width / 2 - x) / (width / 2);
					let coolingEffect = 0.1 + 0.9 * (Math.sin(Math.PI * centerEffect) ** 2);
					let decay = Math.exp(-y / (height * coolingEffect * 10));
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

	requestAnimationFrame(updateCanvas);
});
