export interface UserStats {
  totalScans: number;
  avgEcoScore: number;
  co2Saved: number;
  pointsEarned: number;
  level: number;
  levelProgress: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export const mockUserStats: UserStats = {
  totalScans: 247,
  avgEcoScore: 68,
  co2Saved: 45.6,
  pointsEarned: 3420,
  level: 5,
  levelProgress: 65,
  achievements: [
    {
      id: "first-scan",
      name: "First Steps",
      description: "Complete your first eco scan",
      icon: "🌱",
      unlocked: true,
      unlockedDate: "2024-01-15"
    },
    {
      id: "eco-warrior",
      name: "Eco Warrior",
      description: "Scan 100 products",
      icon: "⚡",
      unlocked: true,
      unlockedDate: "2024-02-10"
    },
    {
      id: "green-champion",
      name: "Green Champion",
      description: "Save 50kg of CO2",
      icon: "🏆",
      unlocked: false
    }
  ]
};

export const mockChartData = [
  { month: "Jan", scans: 12, co2Saved: 3.2 },
  { month: "Feb", scans: 19, co2Saved: 5.1 },
  { month: "Mar", scans: 28, co2Saved: 7.8 },
  { month: "Apr", scans: 35, co2Saved: 9.4 },
  { month: "May", scans: 42, co2Saved: 11.6 },
  { month: "Jun", scans: 38, co2Saved: 10.3 },
];