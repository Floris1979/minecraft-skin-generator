// Prompt-based Minecraft skin generator (CSR-001, MVP).
// Rule-based: no AI/image-generation model involved, see docs/tasks/csr/CSR-001-*.md

const COLOR_KEYWORDS = {
  red: "#c0392b",
  blue: "#2e5fa3",
  green: "#3a7d3a",
  yellow: "#d4b106",
  orange: "#d2691e",
  purple: "#7b4397",
  pink: "#e07ba0",
  black: "#1b1b1b",
  white: "#e8e8e8",
  gray: "#808080",
  grey: "#808080",
  brown: "#6b4423",
  cyan: "#2fa5a5",
  teal: "#2fa5a5",
  gold: "#c9a227",
  silver: "#b0b4b8",
  navy: "#1f3864",
  maroon: "#6b1f28",
};

// Theme keyword -> default palette, used when the prompt doesn't name explicit colors.
const THEMES = {
  knight: { skin: "#d9a066", body: "#8a8f98", legs: "#5a5e66", arms: "#8a8f98" },
  robot: { skin: "#9aa0a6", body: "#6c7278", legs: "#53575c", arms: "#9aa0a6" },
  wizard: { skin: "#d9a066", body: "#5a2d82", legs: "#3d1e5c", arms: "#5a2d82" },
  zombie: { skin: "#4f9b42", body: "#3c6e35", legs: "#2e4a7a", arms: "#4f9b42" },
  pirate: { skin: "#d9a066", body: "#5a3a22", legs: "#1f3864", arms: "#5a3a22" },
  ninja: { skin: "#d9a066", body: "#1b1b1b", legs: "#1b1b1b", arms: "#1b1b1b" },
  skeleton: { skin: "#e8e0d0", body: "#cfc7b8", legs: "#b8b0a0", arms: "#e8e0d0" },
  alien: { skin: "#6fd1a6", body: "#3f8f6f", legs: "#2f6b53", arms: "#6fd1a6" },
  astronaut: { skin: "#d9a066", body: "#e8e8e8", legs: "#c7c9cc", arms: "#e8e8e8" },
  vampire: { skin: "#e3d6d6", body: "#1b1b1b", legs: "#1b1b1b", arms: "#6b1f28" },
  witch: { skin: "#d9a066", body: "#2d1b4e", legs: "#1b1230", arms: "#2d1b4e" },
  cowboy: { skin: "#d9a066", body: "#6b4423", legs: "#4a3220", arms: "#6b4423" },
  soldier: { skin: "#d9a066", body: "#4b5320", legs: "#3b4019", arms: "#4b5320" },
  villager: { skin: "#d9a066", body: "#8a5a3c", legs: "#5a3a22", arms: "#8a5a3c" },
  adventurer: { skin: "#d9a066", body: "#3a7d3a", legs: "#2e5fa3", arms: "#3a7d3a" },
};

const THEME_KEYWORDS = Object.keys(THEMES).filter((t) => t !== "adventurer");

// Standard 64x64 Minecraft skin UV layout, base layer only (no overlay/hat layer).
const REGIONS = {
  head: {
    top: [8, 0, 8, 8],
    bottom: [16, 0, 8, 8],
    right: [0, 8, 8, 8],
    front: [8, 8, 8, 8],
    left: [16, 8, 8, 8],
    back: [24, 8, 8, 8],
  },
  body: {
    top: [20, 16, 8, 4],
    bottom: [28, 16, 8, 4],
    right: [16, 20, 4, 12],
    front: [20, 20, 8, 12],
    left: [28, 20, 4, 12],
    back: [32, 20, 8, 12],
  },
  rightArm: {
    top: [44, 16, 4, 4],
    bottom: [48, 16, 4, 4],
    right: [40, 20, 4, 12],
    front: [44, 20, 4, 12],
    left: [48, 20, 4, 12],
    back: [52, 20, 4, 12],
  },
  leftArm: {
    top: [36, 48, 4, 4],
    bottom: [40, 48, 4, 4],
    right: [32, 52, 4, 12],
    front: [36, 52, 4, 12],
    left: [40, 52, 4, 12],
    back: [44, 52, 4, 12],
  },
  rightLeg: {
    top: [4, 16, 4, 4],
    bottom: [8, 16, 4, 4],
    right: [0, 20, 4, 12],
    front: [4, 20, 4, 12],
    left: [8, 20, 4, 12],
    back: [12, 20, 4, 12],
  },
  leftLeg: {
    top: [20, 48, 4, 4],
    bottom: [24, 48, 4, 4],
    right: [16, 52, 4, 12],
    front: [20, 52, 4, 12],
    left: [24, 52, 4, 12],
    back: [28, 52, 4, 12],
  },
};

function parsePrompt(text) {
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z]+/g) || [];

  const theme = THEME_KEYWORDS.find((t) => words.includes(t)) || "adventurer";
  const foundColors = words
    .filter((w) => COLOR_KEYWORDS[w])
    .map((w) => COLOR_KEYWORDS[w]);

  const palette = { ...THEMES[theme] };
  const recognizedAnything = foundColors.length > 0 || theme !== "adventurer";

  if (foundColors.length === 1) {
    palette.body = foundColors[0];
    palette.legs = foundColors[0];
    palette.arms = foundColors[0];
  } else if (foundColors.length >= 2) {
    palette.body = foundColors[0];
    palette.legs = foundColors[0];
    palette.arms = foundColors[1];
  }

  return { theme, palette, recognizedAnything };
}

// Lighten (percent > 0) or darken (percent < 0) a "#rrggbb" color, percent in [-1, 1].
function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  if (percent >= 0) {
    r += (255 - r) * percent;
    g += (255 - g) * percent;
    b += (255 - b) * percent;
  } else {
    r *= 1 + percent;
    g *= 1 + percent;
    b *= 1 + percent;
  }

  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function fillRegion(ctx, [x, y, w, h], color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Deterministic pseudo-random value in [0, 1) for a pixel coordinate, so the
// same prompt always renders identically (no Math.random noise).
function hashNoise(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Per-pixel brightness dither across a region, so flat fills read as a woven,
// grainy material instead of a solid block of color even with no theme
// accent on top. Subtle by default (amount is the max +/- shade shift).
function ditherRegion(ctx, [x, y, w, h], color, amount) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const n = hashNoise(xx, yy);
      if (n < 0.35) {
        ctx.fillStyle = shade(color, -amount * ((0.35 - n) / 0.35));
        ctx.fillRect(xx, yy, 1, 1);
      } else if (n > 0.8) {
        ctx.fillStyle = shade(color, amount * ((n - 0.8) / 0.2));
        ctx.fillRect(xx, yy, 1, 1);
      }
    }
  }
}

// Flat fill, a per-pixel noise dither, a top highlight / bottom shadow strip,
// and a thin outline -- each region reads as a beveled, textured block
// instead of a flat rectangle.
function paintPart(ctx, part, color) {
  const light = shade(color, 0.22);
  const dark = shade(color, -0.28);
  const outline = shade(color, -0.45);

  for (const box of Object.values(part)) {
    const [x, y, w, h] = box;
    fillRegion(ctx, box, color);
    ditherRegion(ctx, box, color, 0.12);

    const hl = Math.max(1, Math.round(h * 0.2));
    fillRegion(ctx, [x, y, w, hl], light);
    ditherRegion(ctx, [x, y, w, hl], light, 0.1);

    const sh = Math.max(1, Math.round(h * 0.25));
    fillRegion(ctx, [x, y + h - sh, w, sh], dark);
    ditherRegion(ctx, [x, y + h - sh, w, sh], dark, 0.1);

    ctx.strokeStyle = outline;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
}

// The four faces a slowly-rotating 3D preview actually shows, in practice
// (top/bottom are tiny slivers almost never seen and are skipped).
function sideFaces(part) {
  return [part.front, part.left, part.right, part.back];
}

function drawDots(ctx, [x, y, w, h], color, spacing) {
  ctx.fillStyle = color;
  for (let yy = y + 1; yy < y + h - 1; yy += spacing) {
    for (let xx = x + 1; xx < x + w - 1; xx += spacing) {
      ctx.fillRect(xx, yy, 1, 1);
    }
  }
}

function drawDiamonds(ctx, [x, y, w, h], color, spacing) {
  ctx.fillStyle = color;
  let row = 0;
  for (let yy = y + 1; yy < y + h - 1; yy += spacing, row++) {
    const offset = row % 2 === 0 ? 0 : Math.floor(spacing / 2);
    for (let xx = x + 1 + offset; xx < x + w - 1; xx += spacing) {
      ctx.fillRect(xx, yy, 1, 1);
    }
  }
}

function drawHorizontalLines(ctx, [x, y, w, h], color, count) {
  ctx.fillStyle = color;
  for (let i = 1; i <= count; i++) {
    const ly = y + Math.round((h / (count + 1)) * i);
    ctx.fillRect(x, ly, w, 1);
  }
}

function drawVerticalTicks(ctx, [x, y, w, h], color, atFraction) {
  ctx.fillStyle = color;
  const ty = y + Math.round(h * atFraction);
  for (let xx = x; xx < x + w; xx += 2) {
    ctx.fillRect(xx, ty, 1, Math.min(2, y + h - ty));
  }
}

function drawStripe(ctx, [x, y, w, h], color, atFraction, thickness) {
  ctx.fillStyle = color;
  const sy = y + Math.round(h * atFraction);
  ctx.fillRect(x, sy, w, thickness);
}

function drawPatches(ctx, box, color) {
  const [x, y, w, h] = box;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 2, Math.max(1, Math.floor(w / 3)), 1);
  ctx.fillRect(x + Math.max(1, Math.floor(w / 2)), y + h - 3, Math.max(1, Math.floor(w / 3)), 1);
}

function drawBlotches(ctx, [x, y, w, h], colorA, colorB) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const n = hashNoise(xx * 2, yy * 2);
      if (n > 0.82) {
        ctx.fillStyle = n > 0.91 ? colorB : colorA;
        ctx.fillRect(xx, yy, 1, 1);
      }
    }
  }
}

// Theme -> accent pass drawn on top of the shaded, dithered fill, using
// shades derived from the actual painted colors so accents still read
// correctly when a prompt's color keyword has overridden the theme's default
// palette. Applied to front/left/right/back of each part so the detail is
// visible from every angle as the 3D preview rotates, not just face-on.
const PATTERNS = {
  knight(ctx, palette) {
    const dot = shade(palette.body, -0.5);
    [REGIONS.body, REGIONS.rightArm, REGIONS.leftArm, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawDots(ctx, box, dot, 2));
  },
  robot(ctx, palette) {
    sideFaces(REGIONS.body).forEach((box) => drawHorizontalLines(ctx, box, shade(palette.body, 0.35), 1));
    ctx.fillStyle = "#2fa5a5";
    ctx.fillRect(REGIONS.body.front[0] + 1, REGIONS.body.front[1] + 1, 2, 2);
    const rivet = shade(palette.arms, -0.5);
    [REGIONS.rightArm, REGIONS.leftArm, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawDots(ctx, box, rivet, 3));
  },
  zombie(ctx, palette) {
    const bodyPatch = shade(palette.body, -0.35);
    const limbPatch = shade(palette.arms, -0.35);
    sideFaces(REGIONS.body).forEach((box) => drawPatches(ctx, box, bodyPatch));
    [REGIONS.rightArm, REGIONS.leftArm].flatMap(sideFaces).forEach((box) => drawPatches(ctx, box, limbPatch));
  },
  skeleton(ctx, palette) {
    const rib = shade(palette.body, -0.3);
    sideFaces(REGIONS.body).forEach((box) => drawHorizontalLines(ctx, box, rib, 3));
    [REGIONS.rightArm, REGIONS.leftArm, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawHorizontalLines(ctx, box, shade(palette.arms, -0.3), 2));
  },
  pirate(ctx) {
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, "#f2e9d8", 0.4, 2));
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(REGIONS.body.front[0] + 3, REGIONS.body.front[1] + 9, 2, 2);
  },
  wizard(ctx) {
    [REGIONS.body, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawStripe(ctx, box, "#c9a227", 0.85, 1));
    drawDiamonds(ctx, REGIONS.body.front, "#c9a227", 4);
  },
  witch(ctx) {
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, "#c9a227", 0.85, 1));
    drawDots(ctx, REGIONS.body.front, "#c9a227", 3);
  },
  ninja(ctx) {
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, "#8a1f1f", 0.5, 1));
  },
  alien(ctx, palette) {
    const scale = shade(palette.body, -0.3);
    [REGIONS.head, REGIONS.body, REGIONS.rightArm, REGIONS.leftArm, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawDiamonds(ctx, box, scale, 2));
  },
  astronaut(ctx, palette) {
    const seam = shade(palette.body, -0.25);
    [REGIONS.body, REGIONS.rightArm, REGIONS.leftArm, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawHorizontalLines(ctx, box, seam, 2));
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(REGIONS.body.front[0] + 1, REGIONS.body.front[1] + 2, 2, 2);
    const rivet = shade(palette.arms, -0.4);
    [REGIONS.rightArm, REGIONS.leftArm].flatMap(sideFaces).forEach((box) => drawDots(ctx, box, rivet, 3));
  },
  vampire(ctx, palette) {
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, shade(palette.body, -0.4), 0.1, 1));
    drawStripe(ctx, REGIONS.body.back, shade(palette.arms, 0.1), 0.15, 9);
  },
  cowboy(ctx, palette) {
    [REGIONS.rightLeg, REGIONS.leftLeg].flatMap(sideFaces).forEach((box) => drawVerticalTicks(ctx, box, shade(palette.legs, -0.4), 0.9));
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, shade(palette.body, -0.35), 0.75, 1));
  },
  soldier(ctx, palette) {
    const a = shade(palette.body, -0.25);
    const b = shade(palette.body, 0.15);
    [REGIONS.body, REGIONS.rightArm, REGIONS.leftArm, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawBlotches(ctx, box, a, b));
  },
  villager(ctx, palette) {
    [REGIONS.body, REGIONS.rightLeg, REGIONS.leftLeg]
      .flatMap(sideFaces)
      .forEach((box) => drawStripe(ctx, box, shade(palette.body, -0.35), 0.85, 1));
  },
  // Used for any theme without a bespoke pattern above (including the generic
  // "adventurer" fallback for unrecognized prompts) so results are never just
  // flat shading: a collar line, a belt + buckle, and sleeve cuffs.
  default(ctx, palette) {
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, shade(palette.body, -0.4), 0.08, 1));
    sideFaces(REGIONS.body).forEach((box) => drawStripe(ctx, box, shade(palette.legs, -0.4), 0.62, 1));
    ctx.fillStyle = shade(palette.legs, -0.5);
    ctx.fillRect(REGIONS.body.front[0] + 3, REGIONS.body.front[1] + 8, 2, 2);
    [REGIONS.rightArm, REGIONS.leftArm].flatMap(sideFaces).forEach((box) => drawStripe(ctx, box, shade(palette.arms, -0.4), 0.85, 1));
  },
};

function drawFace(ctx) {
  // Eyes and a mouth on the head's front face, box: [8, 8, 8, 8].
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(10, 11, 2, 2);
  ctx.fillRect(14, 11, 2, 2);
  ctx.fillRect(11, 14, 4, 1);
}

function paintSkin(ctx, theme, palette) {
  ctx.clearRect(0, 0, 64, 64);

  paintPart(ctx, REGIONS.head, palette.skin);
  paintPart(ctx, REGIONS.body, palette.body);
  paintPart(ctx, REGIONS.rightArm, palette.arms);
  paintPart(ctx, REGIONS.leftArm, palette.arms);
  paintPart(ctx, REGIONS.rightLeg, palette.legs);
  paintPart(ctx, REGIONS.leftLeg, palette.legs);

  const pattern = PATTERNS[theme] || PATTERNS.default;
  pattern(ctx, palette);

  drawFace(ctx);
}

const form = document.getElementById("prompt-form");
const input = document.getElementById("prompt-input");
const output = document.getElementById("output");
const fallbackNote = document.getElementById("fallback-note");
const skinCanvas = document.getElementById("skin-canvas");
const skinCtx = skinCanvas.getContext("2d");
const downloadLink = document.getElementById("download-link");

let skinViewer = null;

function ensureViewer() {
  if (skinViewer) return skinViewer;
  skinViewer = new skinview3d.SkinViewer({
    canvas: document.getElementById("preview-canvas"),
    width: 400,
    height: 500,
  });
  skinViewer.autoRotate = true;
  skinViewer.controls.enableZoom = true;
  return skinViewer;
}

function generate(prompt) {
  const { theme, palette, recognizedAnything } = parsePrompt(prompt);
  paintSkin(skinCtx, theme, palette);

  const dataUrl = skinCanvas.toDataURL("image/png");
  downloadLink.href = dataUrl;

  const viewer = ensureViewer();
  viewer.loadSkin(dataUrl);

  output.hidden = false;
  fallbackNote.hidden = recognizedAnything;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;
  generate(prompt);
});
