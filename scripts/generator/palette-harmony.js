const CHROMATIC_SATURATION = 15;
export const MAXIMUM_HUE_DELTA = 25;
export const LEGAL_MINIMUM_ACCENT_DISTANCE = 50;
export const LEGAL_MAXIMUM_ACCENT_DISTANCE = 90;

function hexToRgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

export function colorDistance(first, second) {
  const firstRgb = hexToRgb(first);
  const secondRgb = hexToRgb(second);

  return Math.hypot(
    firstRgb.red - secondRgb.red,
    firstRgb.green - secondRgb.green,
    firstRgb.blue - secondRgb.blue,
  );
}

export function rgbToHsl(hex) {
  const { red, green, blue } = hexToRgb(hex);
  const redNorm = red / 255;
  const greenNorm = green / 255;
  const blueNorm = blue / 255;
  const max = Math.max(redNorm, greenNorm, blueNorm);
  const min = Math.min(redNorm, greenNorm, blueNorm);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === redNorm) {
      hue =
        ((greenNorm - blueNorm) / delta + (greenNorm < blueNorm ? 6 : 0)) / 6;
    } else if (max === greenNorm) {
      hue = ((blueNorm - redNorm) / delta + 2) / 6;
    } else {
      hue = ((redNorm - greenNorm) / delta + 4) / 6;
    }
  }

  return {
    hue: hue * 360,
    saturation: saturation * 100,
    lightness: lightness * 100,
  };
}

export function hueDifference(firstHue, secondHue) {
  const delta = Math.abs(firstHue - secondHue);

  return Math.min(delta, 360 - delta);
}

export function getAccentHueDelta(primary, accent) {
  const primaryHsl = rgbToHsl(primary);
  const accentHsl = rgbToHsl(accent);

  return hueDifference(primaryHsl.hue, accentHsl.hue);
}

export function isHarmoniousAccent(primary, accent) {
  const primaryHsl = rgbToHsl(primary);
  const accentHsl = rgbToHsl(accent);
  const primaryIsChromatic = primaryHsl.saturation >= CHROMATIC_SATURATION;
  const accentIsChromatic = accentHsl.saturation >= CHROMATIC_SATURATION;

  if (!primaryIsChromatic && !accentIsChromatic) {
    return true;
  }

  if (primaryIsChromatic !== accentIsChromatic) {
    return false;
  }

  return hueDifference(primaryHsl.hue, accentHsl.hue) <= MAXIMUM_HUE_DELTA;
}

export function isNeonAccent(primary, accent) {
  const primaryHsl = rgbToHsl(primary);
  const accentHsl = rgbToHsl(accent);
  const primaryRgb = hexToRgb(primary);
  const accentRgb = hexToRgb(accent);
  const maxAccentChannel = Math.max(
    accentRgb.red,
    accentRgb.green,
    accentRgb.blue,
  );
  const maxPrimaryChannel = Math.max(
    primaryRgb.red,
    primaryRgb.green,
    primaryRgb.blue,
  );

  if (maxAccentChannel >= 235 && maxPrimaryChannel <= 220) {
    return true;
  }

  if (maxAccentChannel >= 210 && maxPrimaryChannel <= 170) {
    return true;
  }

  if (
    accentHsl.lightness > primaryHsl.lightness + 14 &&
    accentHsl.saturation > primaryHsl.saturation * 1.08 &&
    maxAccentChannel >= 200
  ) {
    return true;
  }

  return false;
}

export function isLegalQualityAccent(primary, accent) {
  if (!isHarmoniousAccent(primary, accent)) {
    return false;
  }

  const distance = colorDistance(primary, accent);

  if (
    distance < LEGAL_MINIMUM_ACCENT_DISTANCE ||
    distance > LEGAL_MAXIMUM_ACCENT_DISTANCE
  ) {
    return false;
  }

  if (isNeonAccent(primary, accent)) {
    return false;
  }

  return true;
}
