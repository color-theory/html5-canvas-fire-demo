import { hslToRgb, rgbToHsl } from './rgbhsl';
function initializeFireCanvas() {
    const canvas = document.getElementById('fireCanvas');
    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas context not found!");
        return;
    }
    const lowResWidth = 320;
    const lowResHeight = 200;
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
    };
    function updateCanvas(timestamp) {
        if (timestamp - lastTime > timingInterval) {
            for (let y = 1; y < lowResHeight; y++) {
                for (let x = 0; x < lowResWidth; x++) {
                    let index = (x * 4) + y * (lowResWidth * 4);
                    let aboveIndex = (x * 4) + (y - 1) * (lowResWidth * 4);
                    let coolingEffect = 0.1 + 0.9 * (Math.pow(Math.sin(Math.PI), 2));
                    let decay = Math.exp(-y / (lowResHeight * coolingEffect * 10));
                    let factor = 1 + magnitude * decay;
                    heatMap[y * lowResWidth + x] *= 0.3;
                    let heat = heatMap[y * lowResWidth + x];
                    let heatintensity = Math.min(heat / 5, 20);
                    let r = Math.max(0, (pixels[aboveIndex] * factor + pixels[index]) / (factor + .92) - 1) + heatintensity;
                    let g = Math.max(0, (pixels[aboveIndex + 1] * factor + pixels[index + 1]) / (factor + .92) - 1) + heatintensity;
                    let b = Math.max(0, (pixels[aboveIndex + 2] * factor + pixels[index + 2]) / (factor + .92) - 1) + heatintensity;
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
            ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imageData, 0, 0);
            lastTime = timestamp;
            reseed();
        }
        requestAnimationFrame(updateCanvas);
    }
    function applyHeat(x, y) {
        let rect = canvas.getBoundingClientRect();
        let canvasX = Math.floor((x / rect.width) * lowResWidth);
        let canvasY = Math.floor((y / rect.height) * lowResHeight);
        const aspectX = rect.width / lowResWidth;
        const aspectY = rect.height / lowResHeight;
        let radius = 50;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                let nx = canvasX + dx;
                let ny = canvasY + dy;
                let distance = Math.pow((Math.pow((dx * aspectX), 2) + Math.pow((dy * aspectY), 2)), 0.5);
                if (nx >= 0 && nx < lowResWidth && ny >= 0 && ny < lowResHeight && distance <= radius) {
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
}
document.addEventListener("DOMContentLoaded", initializeFireCanvas);
//# sourceMappingURL=fire.js.map