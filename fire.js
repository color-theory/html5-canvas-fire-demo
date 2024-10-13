document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById('fireCanvas');
	const ctx = canvas.getContext('2d');

	const imageData = ctx.createImageData(canvas.width, canvas.height);
	let pixels = imageData.data;

	let lastTime = 0;
	let timingInterval = 100;

	function updateCanvas(timestamp) {
		if (timestamp - lastTime > timingInterval) {
			for (let i = 0; i < pixels.length; i += 4) { // Step through rgba values
				pixels[i] = Math.floor(Math.random() * 255);
				pixels[i + 1] = 0;
				pixels[i + 2] = Math.floor(Math.random() * 50);
				pixels[i + 3] = 255;
			}
			ctx.putImageData(imageData, 0, 0);
			lastTime = timestamp;
		}
		requestAnimationFrame(updateCanvas);
	}

	requestAnimationFrame(updateCanvas);
});
