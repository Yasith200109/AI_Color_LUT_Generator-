export interface ColorGradeParameters {
  name: string;
  lift: [number, number, number]; // RGB adjustments for shadows (-0.1 to 0.1)
  gamma: [number, number, number]; // RGB adjustments for midtones (0.8 to 1.2)
  gain: [number, number, number]; // RGB adjustments for highlights (0.8 to 1.2)
  contrast: number; // 0.8 to 1.5
  saturation: number; // 0.0 to 2.0
  cssFilter: string; // CSS filter string for preview approximation
}

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

function applyContrast(color: number, contrast: number) {
  return (color - 0.5) * contrast + 0.5;
}

export function generateCubeLUT(params: ColorGradeParameters, size: number = 17): string {
  let content = `TITLE "${params.name} - AI Generated"\n`;
  content += `LUT_3D_SIZE ${size}\n\n`;

  // Saturation weights (luminance)
  const lumaR = 0.2126;
  const lumaG = 0.7152;
  const lumaB = 0.0722;

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        // Normalized input (0.0 to 1.0)
        let ir = r / (size - 1);
        let ig = g / (size - 1);
        let ib = b / (size - 1);

        // Apply Lift, Gamma, Gain (simplified ASC CDL)
        // out = (in * gain + lift) ^ (1/gamma)
        ir = Math.pow(Math.max(0, ir * params.gain[0] + params.lift[0]), 1 / params.gamma[0]);
        ig = Math.pow(Math.max(0, ig * params.gain[1] + params.lift[1]), 1 / params.gamma[1]);
        ib = Math.pow(Math.max(0, ib * params.gain[2] + params.lift[2]), 1 / params.gamma[2]);

        // Apply Contrast
        ir = applyContrast(ir, params.contrast);
        ig = applyContrast(ig, params.contrast);
        ib = applyContrast(ib, params.contrast);

        // Apply Saturation
        const luma = ir * lumaR + ig * lumaG + ib * lumaB;
        ir = luma + params.saturation * (ir - luma);
        ig = luma + params.saturation * (ig - luma);
        ib = luma + params.saturation * (ib - luma);

        // Clamp to 0-1
        ir = Math.max(0, Math.min(1, ir));
        ig = Math.max(0, Math.min(1, ig));
        ib = Math.max(0, Math.min(1, ib));

        content += `${ir.toFixed(6)} ${ig.toFixed(6)} ${ib.toFixed(6)}\n`;
      }
    }
  }

  return content;
}
