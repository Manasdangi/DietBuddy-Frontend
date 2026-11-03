import { getDayKey } from '../store/useStore';

const shiftDay = (dayKey, days) => {
  const [y, m, d] = dayKey.split('-').map(Number);
  return getDayKey(new Date(y, m - 1, d + days));
};

// { "2026-11-03": { calories, protein, carbs, fat, meals } }
export const totalsByDay = (logs = []) => {
  const byDay = {};
  for (const log of logs) {
    if (!log?.dayKey) continue;
    const t = byDay[log.dayKey] || (byDay[log.dayKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 });
    t.calories += Number(log.macros?.calories) || 0;
    t.protein += Number(log.macros?.protein) || 0;
    t.carbs += Number(log.macros?.carbs) || 0;
    t.fat += Number(log.macros?.fat) || 0;
    t.meals += 1;
  }
  return byDay;
};

// Consecutive days (ending today, or yesterday if today has nothing yet) where test(day) is true.
// Counting from yesterday keeps the streak alive until the user logs today.
const countStreak = (byDay, test, today = getDayKey()) => {
  let day = test(byDay[today]) ? today : shiftDay(today, -1);
  let streak = 0;
  while (test(byDay[day])) {
    streak += 1;
    day = shiftDay(day, -1);
  }
  return streak;
};

export const loggingStreak = (logs, today) =>
  countStreak(totalsByDay(logs), (t) => Boolean(t?.meals), today);

export const proteinStreak = (logs, proteinGoal, today) =>
  proteinGoal > 0 ? countStreak(totalsByDay(logs), (t) => (t?.protein || 0) >= proteinGoal, today) : 0;

// This week's protein challenge: days (Mon-Sun) where the protein goal was hit
export const weeklyProteinChallenge = (logs, proteinGoal, now = new Date()) => {
  const byDay = totalsByDay(logs);
  const mondayOffset = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const key = getDayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    days.push({
      key,
      label: 'MTWTFSS'[i],
      hit: proteinGoal > 0 && (byDay[key]?.protein || 0) >= proteinGoal,
      isFuture: i > mondayOffset,
      isToday: i === mondayOffset,
    });
  }
  return { days, hitCount: days.filter((d) => d.hit).length };
};

// Common Indian-friendly protein sources, approximate values
export const PROTEIN_FOODS = [
  { name: 'Paneer', portion: '100 g', protein: 18, veg: true },
  { name: 'Soya chunks', portion: '50 g dry', protein: 26, veg: true },
  { name: 'Whey protein', portion: '1 scoop', protein: 24, veg: true },
  { name: 'Greek yogurt / hung curd', portion: '200 g', protein: 18, veg: true },
  { name: 'Moong dal chilla', portion: '2 pieces', protein: 14, veg: true },
  { name: 'Roasted chana', portion: '50 g', protein: 10, veg: true },
  { name: 'Eggs', portion: '3 whole', protein: 18, veg: false },
  { name: 'Chicken breast', portion: '150 g cooked', protein: 45, veg: false },
  { name: 'Fish', portion: '150 g cooked', protein: 33, veg: false },
];

// Picks 2-3 foods that roughly cover the remaining protein, best fit first
export const proteinSuggestions = (gap, { veg = false, max = 3 } = {}) => {
  if (gap <= 0) return [];
  const pool = PROTEIN_FOODS.filter((f) => !veg || f.veg);
  return [...pool]
    .sort((a, b) => Math.abs(a.protein - gap) - Math.abs(b.protein - gap))
    .slice(0, max);
};
