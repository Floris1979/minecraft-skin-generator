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

function fillRegion(ctx, [x, y, w, h], color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function paintPart(ctx, part, color) {
  for (const box of Object.values(part)) {
    fillRegion(ctx, box, color);
  }
}

function drawFace(ctx) {
  // Simple eyes on the head's front face, box: [8, 8, 8, 8].
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(10, 11, 2, 2);
  ctx.fillRect(14, 11, 2, 2);
}

function paintSkin(ctx, palette) {
  ctx.clearRect(0, 0, 64, 64);

  paintPart(ctx, REGIONS.head, palette.skin);
  paintPart(ctx, REGIONS.body, palette.body);
  paintPart(ctx, REGIONS.rightArm, palette.arms);
  paintPart(ctx, REGIONS.leftArm, palette.arms);
  paintPart(ctx, REGIONS.rightLeg, palette.legs);
  paintPart(ctx, REGIONS.leftLeg, palette.legs);

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
  const { palette, recognizedAnything } = parsePrompt(prompt);
  paintSkin(skinCtx, palette);

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
