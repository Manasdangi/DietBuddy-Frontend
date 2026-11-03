import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Daily targets per goal (fat ~25-30% of calories)
export const GOAL_TARGETS = {
  bulking: { calories: 3000, protein: 180, carbs: 400, fat: 85 },
  cutting: { calories: 2000, protein: 150, carbs: 200, fat: 60 },
};

// Keep history bounded so AsyncStorage doesn't grow forever
const MAX_LOGS = 500;

const EMPTY_DAY = { calories: 0, protein: 0, carbs: 0, fat: 0 };

// Local calendar day, e.g. "2026-11-03"
export const getDayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const useStore = create(
  persist(
    (set, get) => ({
      goal: null, // 'bulking' or 'cutting'
      theme: 'dark', // 'light' or 'dark'
      dailyGoal: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      roastMode: false, // funny, savage AI comments on meals
      dayKey: getDayKey(),
      currentDay: { ...EMPTY_DAY },
      logs: [], // all logged meals, newest first (each has loggedAt + dayKey)
      hasHydrated: false, // true once saved data has loaded from storage

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),

      toggleRoastMode: () => set((state) => ({ roastMode: !state.roastMode })),

      setGoal: (newGoal) => set(() => ({
        goal: newGoal,
        dailyGoal: { ...(GOAL_TARGETS[newGoal] || GOAL_TARGETS.cutting) },
      })),

      // Reset today's totals if the calendar day changed. History is kept.
      ensureToday: () => {
        const today = getDayKey();
        if (get().dayKey !== today) {
          set({ dayKey: today, currentDay: { ...EMPTY_DAY } });
        }
      },

      addLog: (log) => {
        get().ensureToday();
        const now = new Date();
        const entry = {
          ...log,
          id: log.id || `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
          loggedAt: now.toISOString(),
          dayKey: getDayKey(now),
        };
        set((state) => ({
          logs: [entry, ...state.logs].slice(0, MAX_LOGS),
          currentDay: {
            calories: state.currentDay.calories + num(log.macros?.calories),
            protein: state.currentDay.protein + num(log.macros?.protein),
            carbs: state.currentDay.carbs + num(log.macros?.carbs),
            fat: num(state.currentDay.fat) + num(log.macros?.fat),
          },
        }));
      },

      // Clears today's totals and today's entries only
      resetDaily: () => set((state) => {
        const today = getDayKey();
        return {
          dayKey: today,
          currentDay: { ...EMPTY_DAY },
          logs: state.logs.filter((l) => l.dayKey !== today),
        };
      }),
    }),
    {
      name: 'dietbuddy-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // Save data only, not the hydration flag or functions
      partialize: ({ goal, theme, dailyGoal, roastMode, dayKey, currentDay, logs }) => ({
        goal, theme, dailyGoal, roastMode, dayKey, currentDay, logs,
      }),
      migrate: (persisted, version) => {
        const state = persisted || {};
        if (version < 2) {
          // v2 added fat targets
          if (state.goal && !state.dailyGoal?.fat) {
            state.dailyGoal = { ...state.dailyGoal, fat: GOAL_TARGETS[state.goal]?.fat || 0 };
          }
          state.currentDay = { ...EMPTY_DAY, ...state.currentDay };
        }
        return state;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('Could not load saved data:', error);
        // Runs after saved data loads (or fails to load)
        state?.ensureToday();
        useStore.setState({ hasHydrated: true });
      },
    }
  )
);

export default useStore;
