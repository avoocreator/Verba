export interface LevelReward {
  level: number;
  title: string;
  description: string;
  type: "accessory" | "creature" | "frame" | "world" | "weather";
  worldUnlock?: string;
  iconName: string;
}

export const LEVEL_REWARDS: Record<number, LevelReward> = {
  1: {
    level: 1,
    title: "Tunas Pucuk",
    description: "Tunas kebun pertamamu siap tumbuh bersama kata-katamu.",
    type: "accessory",
    iconName: "sprout",
  },
  2: {
    level: 2,
    title: "Topi Daun Mungil",
    description: "Aksesori pelindung panas untuk Pucuk kesayanganmu.",
    type: "accessory",
    iconName: "leaf",
  },
  3: {
    level: 3,
    title: "Kupu-Kupu Hutan",
    description: "Kupu-kupu cantik mulai hinggap dan terbang di bannermu.",
    type: "creature",
    iconName: "flower",
  },
  4: {
    level: 4,
    title: "Bingkai Kayu Hangat",
    description: "Aksen kayu alami untuk kartu kosakata favoritmu.",
    type: "frame",
    iconName: "palette",
  },
  5: {
    level: 5,
    title: "Dunia Baru: Tepi Danau",
    description: "Selamat! Kamu membuka dunia 🏞️ Tepi Danau dengan riak air tenang.",
    type: "world",
    worldUnlock: "lake",
    iconName: "water",
  },
  6: {
    level: 6,
    title: "Syal Hangat Musim Gugur",
    description: "Syal rajut lembut untuk Pucuk saat angin danau berhembus.",
    type: "accessory",
    iconName: "sparkles",
  },
  7: {
    level: 7,
    title: "Bebek Danau Ceria",
    description: "Teman bebek kecil yang berenang riang di tepian danau.",
    type: "creature",
    iconName: "feather",
  },
  8: {
    level: 8,
    title: "Cuaca: Kabut Fajar",
    description: "Efek kabut fajar yang lembut dan menyejukkan di beranda.",
    type: "weather",
    iconName: "cloud",
  },
  10: {
    level: 10,
    title: "Dunia Baru: Padang Bunga",
    description: "Selamat! Kamu membuka dunia 🌼 Padang Bunga warna-warni.",
    type: "world",
    worldUnlock: "field",
    iconName: "sun",
  },
  11: {
    level: 11,
    title: "Tas Petualang Kebun",
    description: "Tas kecil tempat Pucuk menyimpan benih kata temuanmu.",
    type: "accessory",
    iconName: "bag",
  },
  15: {
    level: 15,
    title: "Dunia Baru: Kaki Gunung",
    description: "Selamat! Kamu membuka dunia ⛰️ Kaki Gunung bersalju tipis.",
    type: "world",
    worldUnlock: "mountain",
    iconName: "mountain",
  },
  20: {
    level: 20,
    title: "Dunia Baru: Pantai Senja",
    description: "Selamat! Kamu membuka dunia 🏖️ Pantai Senja berbayang oranye ungu.",
    type: "world",
    worldUnlock: "beach",
    iconName: "sunset",
  },
  25: {
    level: 25,
    title: "Dunia Baru: Malam Berbintang",
    description: "Selamat! Kamu membuka dunia 🌌 Malam Berbintang penuh kunang-kunang.",
    type: "world",
    worldUnlock: "night",
    iconName: "moon",
  },
  30: {
    level: 30,
    title: "Dunia Baru: Taman Langit",
    description: "Pencapaian legendaris! Kamu membuka dunia ☁️ Taman Langit emas bercahaya.",
    type: "world",
    worldUnlock: "sky",
    iconName: "award",
  },
};

export function getXpRequiredForLevel(currentLevel: number): number {
  return 80 + 40 * Math.max(0, currentLevel - 1);
}

export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  progressPercent: number;
} {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const required = getXpRequiredForLevel(level);
    if (remainingXp < required) {
      const progressPercent = Math.min(100, Math.round((remainingXp / required) * 100));
      return {
        level,
        currentLevelXp: remainingXp,
        nextLevelXpRequired: required,
        progressPercent,
      };
    }
    remainingXp -= required;
    level += 1;
  }
}
