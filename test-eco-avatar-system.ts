// Test script to verify the dynamic avatar evolution system

// Dynamic Avatar Evolution System 🌱➡️🌳
const getEcoAvatar = (level: number, points: number) => {
  const treeEvolution = [
    { emoji: '🌱', name: 'Seedling', desc: 'Just sprouted!' },
    { emoji: '🌿', name: 'Young Plant', desc: 'Growing strong!' },
    { emoji: '🌳', name: 'Mighty Tree', desc: 'Forest guardian!' },
    { emoji: '🌍', name: 'Earth Guardian', desc: 'Planet protector!' }
  ];
  
  const mobilityEvolution = [
    { emoji: '👟', name: 'Walker', desc: 'Every step counts!' },
    { emoji: '🚲', name: 'Cyclist', desc: 'Pedal power!' },
    { emoji: '⚡', name: 'E-Biker', desc: 'Electric rides!' },
    { emoji: '🚗', name: 'Electric Driver', desc: 'Zero emissions!' }
  ];

  const ecoEvolution = [
    { emoji: '♻️', name: 'Recycler', desc: 'Waste warrior!' },
    { emoji: '🍃', name: 'Green Guardian', desc: 'Nature lover!' },
    { emoji: '🛡️', name: 'Eco Defender', desc: 'Earth protector!' },
    { emoji: '👑', name: 'Eco Monarch', desc: 'Ultimate eco royalty!' }
  ];

  let evolution = treeEvolution;
  if (points > 500) evolution = mobilityEvolution;
  if (points > 1000) evolution = ecoEvolution;

  const avatarLevel = Math.min(Math.floor(level / 5), 3);
  return evolution[avatarLevel] || evolution[0];
};

// Calculate Eco Impact 📊
const calculateEcoImpact = (points: number, scans: number) => ({
  co2Reduced: Math.round(points * 0.05),
  treesPlanted: Math.floor(scans * 0.1),
  plasticRecycled: Math.round(points * 0.02),
  waterSaved: Math.round(points * 0.8)
});

const testUsers = [
  { level: 1, points: 50, name: "New User" },
  { level: 3, points: 200, name: "Growing User" }, 
  { level: 6, points: 600, name: "Experienced User" },
  { level: 10, points: 1200, name: "Expert User" },
  { level: 15, points: 2000, name: "Master User" }
];

console.log("🌱 Testing Dynamic Avatar Evolution System:");
console.log("=".repeat(50));

testUsers.forEach(user => {
  const avatar = getEcoAvatar(user.level, user.points);
  console.log(`${user.name} (Level ${user.level}, ${user.points} pts):`);
  console.log(`  Avatar: ${avatar.emoji} ${avatar.name}`);
  console.log(`  Description: ${avatar.desc}`);
  console.log();
});

console.log("📊 Testing Eco Impact Calculations:");
console.log("=".repeat(50));

const testImpacts = [
  { points: 100, scans: 5 },
  { points: 500, scans: 25 },
  { points: 1000, scans: 50 },
  { points: 2000, scans: 100 }
];

testImpacts.forEach(test => {
  const impact = calculateEcoImpact(test.points, test.scans);
  console.log(`${test.points} points, ${test.scans} scans:`);
  console.log(`  CO₂ Reduced: ${impact.co2Reduced}kg`);
  console.log(`  Trees Planted: ${impact.treesPlanted}`);
  console.log(`  Plastic Recycled: ${impact.plasticRecycled}kg`);
  console.log(`  Water Saved: ${impact.waterSaved}L`);
  console.log();
});

export {};