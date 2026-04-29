import { create } from 'zustand';

const useStore = create((set) => ({
  goal: null, // 'bulking' or 'cutting'
  theme: 'dark', // 'light' or 'dark'
  dailyGoal: {
    calories: 0,
    protein: 0,
    carbs: 0,
  },
  currentDay: {
    calories: 0,
    protein: 0,
    carbs: 0,
  },
  logs: [], // local cache of today's logs

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  })),

  setGoal: (newGoal) => set((state) => {
    // Default mock values for goals
    const dailyGoal = newGoal === 'bulking' 
      ? { calories: 3000, protein: 180, carbs: 400 } 
      : { calories: 2000, protein: 150, carbs: 200 };
    return { goal: newGoal, dailyGoal };
  }),

  addLog: (log) => set((state) => ({
    logs: [log, ...state.logs],
    currentDay: {
      calories: state.currentDay.calories + (log.macros?.calories || 0),
      protein: state.currentDay.protein + (log.macros?.protein || 0),
      carbs: state.currentDay.carbs + (log.macros?.carbs || 0),
    }
  })),

  resetDaily: () => set({
    currentDay: { calories: 0, protein: 0, carbs: 0 },
    logs: []
  })
}));

export default useStore;
