// Pure manual image processing algorithms for Hephaestus

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 1. Core adjustments: Brightness, Contrast, Hue, Saturation, RGB Gains
export function applyAdjustments(
  srcData: ImageData,
  destData: ImageData,
  brightness: number,
  contrast: number,
  hue: number,
  saturation: number,
  redChannel: number = 0,
  greenChannel: number = 0,
  blueChannel: number = 0,
  gamma: number = 100,
  vignette: number = 0,
  pixelate: number = 0,
  invert: boolean = false
) {
  const src = srcData.data;
  const dest = destData.data;
  const len = src.length;
  const w = srcData.width;
  const h = srcData.height;

  // Contrast factor
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < len; i += 4) {
    let r, g, b, a;
    
    // 1. Pixelate (Mosaic block lookup)
    if (pixelate > 1) {
      const pxIdx = Math.floor(i / 4);
      const x = pxIdx % w;
      const y = Math.floor(pxIdx / w);
      
      const blockX = Math.floor(x / pixelate) * pixelate;
      const blockY = Math.floor(y / pixelate) * pixelate;
      
      const srcOff = (blockY * w + blockX) * 4;
      r = src[srcOff];
      g = src[srcOff + 1];
      b = src[srcOff + 2];
      a = src[srcOff + 3];
    } else {
      r = src[i];
      g = src[i + 1];
      b = src[i + 2];
      a = src[i + 3];
    }

    // 2. Invert colors
    if (invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // 3. Brightness
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    // 4. Contrast
    if (contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 5. Manual Channel Offsets (Color Grading / White Balance Calibration)
    if (redChannel !== 0) r += redChannel;
    if (greenChannel !== 0) g += greenChannel;
    if (blueChannel !== 0) b += blueChannel;

    // 6. Gamma Correction (maps 10..300 to 0.1..3.0 exponent)
    if (gamma !== 100) {
      const gammaVal = gamma / 100;
      r = Math.pow(Math.max(0, r) / 255, gammaVal) * 255;
      g = Math.pow(Math.max(0, g) / 255, gammaVal) * 255;
      b = Math.pow(Math.max(0, b) / 255, gammaVal) * 255;
    }

    // Clip RGB
    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;

    // 7. Vignette Effect
    if (vignette > 0) {
      const pxIdx = Math.floor(i / 4);
      const x = pxIdx % w;
      const y = Math.floor(pxIdx / w);
      
      const dx = x - w / 2;
      const dy = y - h / 2;
      const maxDist = Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2));
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / maxDist; // 0 to 1
      
      // Cosine falloff for smooth darkening
      const vignetteFactor = 1 - (normDist * normDist * (vignette / 100));
      r *= vignetteFactor;
      g *= vignetteFactor;
      b *= vignetteFactor;
    }

    // 8. Hue & Saturation
    if (hue !== 0 || saturation !== 0) {
      const [hVal, sVal, lVal] = rgbToHsl(r, g, b);
      let newH = hVal + hue;
      if (newH < 0) newH += 360;
      if (newH >= 360) newH -= 360;

      let newS = sVal + saturation;
      newS = newS < 0 ? 0 : newS > 100 ? 100 : newS;

      const [nr, ng, nb] = hslToRgb(newH, newS, lVal);
      dest[i] = nr;
      dest[i + 1] = ng;
      dest[i + 2] = nb;
    } else {
      dest[i] = Math.round(r);
      dest[i + 1] = Math.round(g);
      dest[i + 2] = Math.round(b);
    }
    dest[i + 3] = a;
  }
}

// 2. Convolution (Sharpen, Blur)
export function applyConvolution(
  srcData: ImageData,
  destData: ImageData,
  weights: number[],
  side: number
) {
  const src = srcData.data;
  const dest = destData.data;
  const w = srcData.width;
  const h = srcData.height;
  const halfSide = Math.floor(side / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * w + x) * 4;

      // Calculate convolution sum
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let weightTotal = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide;
          const scx = sx + cx - halfSide;

          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * side + cx];
            rSum += src[srcOff] * wt;
            gSum += src[srcOff + 1] * wt;
            bSum += src[srcOff + 2] * wt;
            weightTotal += wt;
          }
        }
      }

      if (weightTotal <= 0) weightTotal = 1;

      dest[dstOff] = Math.min(Math.max(rSum / weightTotal, 0), 255);
      dest[dstOff + 1] = Math.min(Math.max(gSum / weightTotal, 0), 255);
      dest[dstOff + 2] = Math.min(Math.max(bSum / weightTotal, 0), 255);
      dest[dstOff + 3] = src[dstOff + 3]; // Preserve alpha
    }
  }
}

// Fast Box Blur (separable pass for high performance)
export function applyBoxBlur(srcData: ImageData, destData: ImageData, radius: number) {
  if (radius <= 0) {
    destData.data.set(srcData.data);
    return;
  }

  const src = srcData.data;
  const dest = destData.data;
  const w = srcData.width;
  const h = srcData.height;

  // Copy alpha and basic colors initially
  dest.set(src);

  // We can construct a simple blur weights array
  // E.g. 5x5 kernel box blur for radius 2
  const side = radius * 2 + 1;
  const weights = new Array(side * side).fill(1);
  applyConvolution(srcData, destData, weights, side);
}

// Sharpen Filter (with intensity slider)
export function applySharpen(srcData: ImageData, destData: ImageData, amount: number) {
  if (amount <= 0) {
    destData.data.set(srcData.data);
    return;
  }

  // Create sharpen kernel
  // Normal sharpen kernel is:
  // [  0, -1,  0 ]
  // [ -1,  5, -1 ]
  // [  0, -1,  0 ]
  // We can interpolate it with identity:
  // [  0,  0,  0 ]
  // [  0,  1,  0 ]
  // [  0,  0,  0 ]
  const factor = amount / 100; // 0 to 1
  const c = 1 + 4 * factor;
  const e = -factor;
  const weights = [
    0, e, 0,
    e, c, e,
    0, e, 0
  ];

  applyConvolution(srcData, destData, weights, 3);
}

// 3. Noise Reduction: Median Filter
// A median filter of radius 1 (3x3 window) or 2 (5x5 window)
export function applyMedianFilter(srcData: ImageData, destData: ImageData, radius: number) {
  if (radius <= 0) {
    destData.data.set(srcData.data);
    return;
  }

  const src = srcData.data;
  const dest = destData.data;
  const w = srcData.width;
  const h = srcData.height;
  const side = radius * 2 + 1;
  const halfSide = radius;

  const rValues = new Uint8Array(side * side);
  const gValues = new Uint8Array(side * side);
  const bValues = new Uint8Array(side * side);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let count = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;

          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            rValues[count] = src[srcOff];
            gValues[count] = src[srcOff + 1];
            bValues[count] = src[srcOff + 2];
            count++;
          }
        }
      }

      // Sort subarrays to find median
      const rSub = rValues.subarray(0, count).sort();
      const gSub = gValues.subarray(0, count).sort();
      const bSub = bValues.subarray(0, count).sort();

      const mid = Math.floor(count / 2);
      const dstOff = (y * w + x) * 4;

      dest[dstOff] = rSub[mid];
      dest[dstOff + 1] = gSub[mid];
      dest[dstOff + 2] = bSub[mid];
      dest[dstOff + 3] = src[dstOff + 3];
    }
  }
}

// 4. Color Depth Quantization & Dithering
// We can quantize the channels into specific depths and apply Floyd-Steinberg dithering.
export function applyColorDepth(
  srcData: ImageData,
  destData: ImageData,
  depth: 'original' | '16bit' | '8bit' | '4bit' | '2bit' | '1bit',
  dither: 'none' | 'floyd-steinberg' | 'ordered'
) {
  if (depth === 'original') {
    destData.data.set(srcData.data);
    return;
  }

  const src = srcData.data;
  const dest = destData.data;
  const w = srcData.width;
  const h = srcData.height;

  // Clone initially
  dest.set(src);

  // Set up channel bit masks
  let rBits = 8;
  let gBits = 8;
  let bBits = 8;

  switch (depth) {
    case '16bit': // RGB 565
      rBits = 5;
      gBits = 6;
      bBits = 5;
      break;
    case '8bit': // RGB 332 or 332
      rBits = 3;
      gBits = 3;
      bBits = 2;
      break;
    case '4bit': // 1 bit red, 2 bit green, 1 bit blue (or equal)
      rBits = 1;
      gBits = 2;
      bBits = 1;
      break;
    case '2bit': // 1 bit red, 1 bit green, 0 bit blue
      rBits = 1;
      gBits = 1;
      bBits = 0;
      break;
    case '1bit': // Monochrome (r, g, b either 0 or 255 based on intensity)
      rBits = 1;
      gBits = 1;
      bBits = 1;
      break;
  }

  const quantizeChannel = (val: number, bits: number): number => {
    if (bits === 0) return 0;
    const steps = (1 << bits) - 1;
    const stepSize = 255 / steps;
    return Math.round(Math.round(val / stepSize) * stepSize);
  };

  if (dither === 'none') {
    for (let i = 0; i < src.length; i += 4) {
      if (depth === '1bit') {
        const gray = 0.299 * dest[i] + 0.587 * dest[i + 1] + 0.114 * dest[i + 2];
        const val = gray > 127 ? 255 : 0;
        dest[i] = val;
        dest[i + 1] = val;
        dest[i + 2] = val;
      } else {
        dest[i] = quantizeChannel(dest[i], rBits);
        dest[i + 1] = quantizeChannel(dest[i + 1], gBits);
        dest[i + 2] = quantizeChannel(dest[i + 2], bBits);
      }
    }
  } else if (dither === 'floyd-steinberg') {
    // Copy pixels to temporary buffer of floats to accumulate error
    const len = src.length;
    const rBuffer = new Float32Array(w * h);
    const gBuffer = new Float32Array(w * h);
    const bBuffer = new Float32Array(w * h);

    for (let i = 0; i < len / 4; i++) {
      rBuffer[i] = dest[i * 4];
      gBuffer[i] = dest[i * 4 + 1];
      bBuffer[i] = dest[i * 4 + 2];
    }

    const distributeError = (x: number, y: number, rErr: number, gErr: number, bErr: number, weight: number) => {
      if (x >= 0 && x < w && y >= 0 && y < h) {
        const offset = y * w + x;
        rBuffer[offset] += rErr * weight;
        gBuffer[offset] += gErr * weight;
        bBuffer[offset] += bErr * weight;
      }
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const oldR = Math.max(0, Math.min(255, rBuffer[idx]));
        const oldG = Math.max(0, Math.min(255, gBuffer[idx]));
        const oldB = Math.max(0, Math.min(255, bBuffer[idx]));

        let newR = 0;
        let newG = 0;
        let newB = 0;

        if (depth === '1bit') {
          const gray = 0.299 * oldR + 0.587 * oldG + 0.114 * oldB;
          const val = gray > 127 ? 255 : 0;
          newR = val;
          newG = val;
          newB = val;
        } else {
          newR = quantizeChannel(oldR, rBits);
          newG = quantizeChannel(oldG, gBits);
          newB = quantizeChannel(oldB, bBits);
        }

        const dstOff = idx * 4;
        dest[dstOff] = newR;
        dest[dstOff + 1] = newG;
        dest[dstOff + 2] = newB;

        const errR = oldR - newR;
        const errG = oldG - newG;
        const errB = oldB - newB;

        // Distribute error
        // x+1, y: 7/16
        distributeError(x + 1, y, errR, errG, errB, 7 / 16);
        // x-1, y+1: 3/16
        distributeError(x - 1, y + 1, errR, errG, errB, 3 / 16);
        // x, y+1: 5/16
        distributeError(x, y + 1, errR, errG, errB, 5 / 16);
        // x+1, y+1: 1/16
        distributeError(x + 1, y + 1, errR, errG, errB, 1 / 16);
      }
    }
  } else if (dither === 'ordered') {
    // 4x4 Bayer Ordered Dither Matrix
    const bayer4x4 = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const bayerVal = bayer4x4[y % 4][x % 4];
        // Normalize Bayer value to -16..16 range
        const threshold = (bayerVal - 7.5) * 4;

        if (depth === '1bit') {
          const gray = 0.299 * dest[idx] + 0.587 * dest[idx + 1] + 0.114 * dest[idx + 2] + threshold;
          const val = gray > 127 ? 255 : 0;
          dest[idx] = val;
          dest[idx + 1] = val;
          dest[idx + 2] = val;
        } else {
          dest[idx] = quantizeChannel(Math.max(0, Math.min(255, dest[idx] + threshold)), rBits);
          dest[idx + 1] = quantizeChannel(Math.max(0, Math.min(255, dest[idx + 1] + threshold)), gBits);
          dest[idx + 2] = quantizeChannel(Math.max(0, Math.min(255, dest[idx + 2] + threshold)), bBits);
        }
      }
    }
  }
}

// 5. Resolution scaling: Nearest Neighbor vs Bilinear interpolation
export function scaleImageData(
  srcData: ImageData,
  factor: number,
  interpolation: 'nearest' | 'bilinear'
): ImageData {
  if (factor === 1.0) {
    // Return a copy
    const dest = new ImageData(srcData.width, srcData.height);
    dest.data.set(srcData.data);
    return dest;
  }

  const src = srcData.data;
  const w1 = srcData.width;
  const h1 = srcData.height;

  const w2 = Math.max(1, Math.round(w1 * factor));
  const h2 = Math.max(1, Math.round(h1 * factor));

  const destData = new ImageData(w2, h2);
  const dest = destData.data;

  if (interpolation === 'nearest') {
    const xRatio = w1 / w2;
    const yRatio = h1 / h2;

    for (let y = 0; y < h2; y++) {
      for (let x = 0; x < w2; x++) {
        const px = Math.floor(x * xRatio);
        const py = Math.floor(y * yRatio);
        const srcOff = (py * w1 + px) * 4;
        const dstOff = (y * w2 + x) * 4;

        dest[dstOff] = src[srcOff];
        dest[dstOff + 1] = src[srcOff + 1];
        dest[dstOff + 2] = src[srcOff + 2];
        dest[dstOff + 3] = src[srcOff + 3];
      }
    }
  } else {
    // Bilinear Interpolation
    const xRatio = (w1 - 1) / w2;
    const yRatio = (h1 - 1) / h2;

    for (let y = 0; y < h2; y++) {
      for (let x = 0; x < w2; x++) {
        const dstOff = (y * w2 + x) * 4;

        // Coordinates in source space
        const xL = x * xRatio;
        const yL = y * yRatio;

        const xMin = Math.floor(xL);
        const yMin = Math.floor(yL);
        const xMax = Math.ceil(xL);
        const yMax = Math.ceil(yL);

        const xWeight = xL - xMin;
        const yWeight = yL - yMin;

        const idx00 = (yMin * w1 + xMin) * 4;
        const idx10 = (yMin * w1 + xMax) * 4;
        const idx01 = (yMax * w1 + xMin) * 4;
        const idx11 = (yMax * w1 + xMax) * 4;

        // Linearly interpolate each channel
        for (let c = 0; c < 4; c++) {
          const val00 = src[idx00 + c];
          const val10 = src[idx10 + c];
          const val01 = src[idx01 + c];
          const val11 = src[idx11 + c];

          const top = val00 + (val10 - val00) * xWeight;
          const bottom = val01 + (val11 - val01) * xWeight;
          const finalVal = top + (bottom - top) * yWeight;

          dest[dstOff + c] = Math.round(finalVal);
        }
      }
    }
  }

  return destData;
}

// 6. Healing Brush calculation:
// Blends pixel content from source to target with custom feathering/averaging
export function applyHealBrush(
  ctx: CanvasRenderingContext2D,
  srcX: number,
  srcY: number,
  destX: number,
  destY: number,
  radius: number
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const side = Math.round(radius * 2);
  radius = Math.round(radius);

  // Source Box Clipping
  const sLeft = Math.round(srcX - radius);
  const sTop = Math.round(srcY - radius);
  const sClipLeft = Math.max(0, sLeft);
  const sClipTop = Math.max(0, sTop);
  const sClipRight = Math.min(w, sLeft + side);
  const sClipBottom = Math.min(h, sTop + side);
  const sClipW = sClipRight - sClipLeft;
  const sClipH = sClipBottom - sClipTop;

  // Dest Box Clipping
  const dLeft = Math.round(destX - radius);
  const dTop = Math.round(destY - radius);
  const dClipLeft = Math.max(0, dLeft);
  const dClipTop = Math.max(0, dTop);
  const dClipRight = Math.min(w, dLeft + side);
  const dClipBottom = Math.min(h, dTop + side);
  const dClipW = dClipRight - dClipLeft;
  const dClipH = dClipBottom - dClipTop;

  if (sClipW <= 0 || sClipH <= 0 || dClipW <= 0 || dClipH <= 0) return;

  const sData = ctx.getImageData(sClipLeft, sClipTop, sClipW, sClipH);
  const dData = ctx.getImageData(dClipLeft, dClipTop, dClipW, dClipH);

  const sPixels = sData.data;
  const dPixels = dData.data;

  // Let's create virtual src and dest arrays of size (side * side * 4) representing clamped pixels
  const src = new Uint8ClampedArray(side * side * 4);
  const dest = new Uint8ClampedArray(side * side * 4);

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const idx = (y * side + x) * 4;

      // Source pixel
      const sCanvasX = Math.max(sClipLeft, Math.min(sClipRight - 1, sLeft + x));
      const sCanvasY = Math.max(sClipTop, Math.min(sClipBottom - 1, sTop + y));
      const sOff = ((sCanvasY - sClipTop) * sClipW + (sCanvasX - sClipLeft)) * 4;
      src[idx] = sPixels[sOff];
      src[idx + 1] = sPixels[sOff + 1];
      src[idx + 2] = sPixels[sOff + 2];
      src[idx + 3] = sPixels[sOff + 3];

      // Dest pixel
      const dCanvasX = Math.max(dClipLeft, Math.min(dClipRight - 1, dLeft + x));
      const dCanvasY = Math.max(dClipTop, Math.min(dClipBottom - 1, dTop + y));
      const dOff = ((dCanvasY - dClipTop) * dClipW + (dCanvasX - dClipLeft)) * 4;
      dest[idx] = dPixels[dOff];
      dest[idx + 1] = dPixels[dOff + 1];
      dest[idx + 2] = dPixels[dOff + 2];
      dest[idx + 3] = dPixels[dOff + 3];
    }
  }

  // 1. Calculate average lighting/color of source and destination margins
  let srcRSum = 0, srcGSum = 0, srcBSum = 0;
  let destRSum = 0, destGSum = 0, destBSum = 0;
  let count = 0;

  // Measure only around the boundaries (the circle outline)
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Boundary check (the outer 25% of the brush circle)
      if (dist > radius * 0.75 && dist <= radius) {
        const off = (y * side + x) * 4;
        srcRSum += src[off];
        srcGSum += src[off + 1];
        srcBSum += src[off + 2];

        destRSum += dest[off];
        destGSum += dest[off + 1];
        destBSum += dest[off + 2];
        count++;
      }
    }
  }

  const srcAvgR = count > 0 ? srcRSum / count : 128;
  const srcAvgG = count > 0 ? srcGSum / count : 128;
  const srcAvgB = count > 0 ? srcBSum / count : 128;

  const destAvgR = count > 0 ? destRSum / count : 128;
  const destAvgG = count > 0 ? destGSum / count : 128;
  const destAvgB = count > 0 ? destBSum / count : 128;

  const rOffset = destAvgR - srcAvgR;
  const gOffset = destAvgG - srcAvgG;
  const bOffset = destAvgB - srcAvgB;

  // 2. Perform the blemish repair blend with radial feathering
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        const off = (y * side + x) * 4;

        // Feather amount: 1 in center, 0 at boundary
        const feather = Math.cos((dist / radius) * (Math.PI / 2));

        // Source pixel texture with color offset shifted to dest brightness
        const sR = Math.min(Math.max(src[off] + rOffset, 0), 255);
        const sG = Math.min(Math.max(src[off + 1] + gOffset, 0), 255);
        const sB = Math.min(Math.max(src[off + 2] + bOffset, 0), 255);

        // Blend with destination background based on feather
        dest[off] = Math.round(dest[off] * (1 - feather) + sR * feather);
        dest[off + 1] = Math.round(dest[off + 1] * (1 - feather) + sG * feather);
        dest[off + 2] = Math.round(dest[off + 2] * (1 - feather) + sB * feather);
      }
    }
  }

  // Draw back to context, clipping writes specifically to canvas bounds
  const outData = ctx.createImageData(dClipW, dClipH);
  const outPixels = outData.data;

  for (let cy = 0; cy < dClipH; cy++) {
    const canvasY = dClipTop + cy;
    const destGridY = canvasY - dTop;

    for (let cx = 0; cx < dClipW; cx++) {
      const canvasX = dClipLeft + cx;
      const destGridX = canvasX - dLeft;

      const destGridOff = (destGridY * side + destGridX) * 4;
      const outOff = (cy * dClipW + cx) * 4;

      outPixels[outOff] = dest[destGridOff];
      outPixels[outOff + 1] = dest[destGridOff + 1];
      outPixels[outOff + 2] = dest[destGridOff + 2];
      outPixels[outOff + 3] = dest[destGridOff + 3];
    }
  }

  ctx.putImageData(outData, dClipLeft, dClipTop);
}
