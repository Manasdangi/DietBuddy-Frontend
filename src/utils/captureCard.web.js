// Web: draws the share card straight onto a 1080x1920 canvas and returns a PNG data URI.
// (react-native-view-shot can't take a ref on web, and DOM screenshot libraries mangle
// custom-font spacing, so we draw it ourselves. Layout mirrors components/ShareCard.js.)

const W = 360; // layout units, same as ShareCard (CARD_WIDTH x CARD_HEIGHT)
const H = 640;
const SCALE = 3; // 360x640 -> 1080x1920
const PAD = 28;

const FONTS = {
  extra: 'Outfit_800ExtraBold',
  bold: 'Outfit_700Bold',
  semi: 'Outfit_600SemiBold',
  medium: 'Outfit_500Medium',
};

const loadFonts = () =>
  Promise.all(Object.values(FONTS).map((f) => document.fonts.load(`20px ${f}`).catch(() => null)));

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const circle = (ctx, cx, cy, r, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
};

// Splits text into lines that fit maxWidth using the current ctx.font
const wrap = (ctx, str, maxWidth, maxLines) => {
  const words = String(str).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:!?\s]+$/, '')}…`;
    return kept;
  }
  return lines;
};

const draw = (ctx, str, x, y, { font, size, color, align = 'left', spacing }) => {
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing ? `${spacing}px` : '0px';
  ctx.fillText(str, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
};

export default async function captureCard(_ref, props) {
  const { dateLabel, currentDay, dailyGoal, streak, proteinHit, roastLine } = props;
  await loadFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // Background (full-bleed, so it looks right as an Instagram story)
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1A0B12');
  bg.addColorStop(0.5, '#09090B');
  bg.addColorStop(1, '#0B1220');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  circle(ctx, 310, 30, 110, 'rgba(244, 63, 94, 0.25)');
  circle(ctx, 50, 610, 120, 'rgba(59, 130, 246, 0.18)');

  // Header
  let y = PAD + 18;
  draw(ctx, 'DietBuddy', PAD, y, { font: FONTS.extra, size: 20, color: '#F43F5E' });
  draw(ctx, dateLabel, W - PAD, y - 2, { font: FONTS.medium, size: 13, color: '#A1A1AA', align: 'right' });

  // Headline
  const headline = proteinHit
    ? 'Protein goal smashed 💪'
    : streak > 1
      ? `${streak} days of tracking 🔥`
      : 'Tracking my macros today';
  y += 40 + 28;
  ctx.font = `30px ${FONTS.extra}`;
  for (const line of wrap(ctx, headline, W - PAD * 2, 2)) {
    draw(ctx, line, PAD, y, { font: FONTS.extra, size: 30, color: '#FAFAFA' });
    y += 36;
  }

  // Streak pill (only when the headline isn't already about the streak)
  if (proteinHit && streak > 0) {
    const label = `🔥 ${streak}-day streak`;
    ctx.font = `14px ${FONTS.semi}`;
    const w = ctx.measureText(label).width + 24;
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    roundRect(ctx, PAD, y - 8, w, 30, 15);
    ctx.fill();
    draw(ctx, label, PAD + 12, y + 12, { font: FONTS.semi, size: 14, color: '#FDA4AF' });
    y += 14 + 30;
  }

  // Calories
  y += 32 + 50;
  draw(ctx, String(currentDay.calories), PAD, y, { font: FONTS.extra, size: 64, color: '#FAFAFA', spacing: -1 });
  y += 22;
  draw(ctx, `kcal of ${dailyGoal.calories}`, PAD, y, { font: FONTS.medium, size: 15, color: '#A1A1AA' });

  // Macro bars
  y += 28 + 6;
  const bars = [
    ['PROTEIN', currentDay.protein, dailyGoal.protein, '#10B981'],
    ['CARBS', currentDay.carbs, dailyGoal.carbs, '#3B82F6'],
    ['FAT', currentDay.fat || 0, dailyGoal.fat || 0, '#F59E0B'],
  ];
  for (const [label, value, target, color] of bars) {
    draw(ctx, label, PAD, y + 12, { font: FONTS.semi, size: 12, color: '#A1A1AA', spacing: 1 });
    if (target > 0) {
      ctx.font = `15px ${FONTS.medium}`;
      const targetStr = ` / ${target}`;
      const targetW = ctx.measureText(targetStr).width;
      draw(ctx, targetStr, W - PAD, y + 13, { font: FONTS.medium, size: 15, color: '#71717A', align: 'right' });
      draw(ctx, String(value), W - PAD - targetW, y + 13, { font: FONTS.bold, size: 15, color: '#FAFAFA', align: 'right' });
    } else {
      draw(ctx, String(value), W - PAD, y + 13, { font: FONTS.bold, size: 15, color: '#FAFAFA', align: 'right' });
    }
    y += 20 + 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, PAD, y, W - PAD * 2, 8, 4);
    ctx.fill();
    const pct = target > 0 ? Math.min(value / target, 1) : 0;
    if (pct > 0) {
      ctx.fillStyle = color;
      roundRect(ctx, PAD, y, Math.max((W - PAD * 2) * pct, 8), 8, 4);
      ctx.fill();
    }
    y += 8 + 16;
  }

  // Roast
  if (roastLine) {
    y += 2;
    ctx.font = `14px ${FONTS.medium}`;
    const lines = wrap(ctx, `"${roastLine}"`, W - PAD * 2 - 28, 3);
    const boxH = 14 + 11 + 6 + lines.length * 20 + 14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRect(ctx, PAD, y, W - PAD * 2, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    draw(ctx, "TODAY'S ROAST 🔥", PAD + 14, y + 14 + 11, { font: FONTS.bold, size: 11, color: '#F43F5E', spacing: 1 });
    lines.forEach((line, i) => {
      draw(ctx, line, PAD + 14, y + 14 + 11 + 6 + 15 + i * 20, { font: FONTS.medium, size: 14, color: '#E4E4E7' });
    });
  }

  // Footer
  draw(ctx, 'Snap. Log. Done. — DietBuddy', W / 2, H - 28, { font: FONTS.semi, size: 13, color: '#71717A', align: 'center' });

  return canvas.toDataURL('image/png');
}
