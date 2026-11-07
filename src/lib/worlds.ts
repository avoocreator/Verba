export interface WorldInfo {
  id: string;
  name: string;
  emoji: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  dominantColors: string[];
  bannerScene: string;
  elements: string[];
}

export const WORLDS: WorldInfo[] = [
  {
    id: "forest",
    name: "Hutan Pagi",
    emoji: "🌲",
    minLevel: 1,
    maxLevel: 4,
    description: "Hutan sage yang asri dengan kabut fajar sejuk dan tunas kebun yang mulai tumbuh.",
    dominantColors: ["#F4EFE0", "#4A7A45", "#5C6752"],
    bannerScene: "morning_forest",
    elements: ["Kabut tipis", "Burung pipit", "Tunas Pucuk bergoyang"],
  },
  {
    id: "lake",
    name: "Tepi Danau",
    emoji: "🏞️",
    minLevel: 5,
    maxLevel: 9,
    description: "Danau zamrud yang jernih dengan riak air tenang dan pasir krem hangat.",
    dominantColors: ["#EBF2F0", "#2E7979", "#49635C"],
    bannerScene: "lakeside",
    elements: ["Riak air danau", "Ikan kecil", "Bebek danau berenang"],
  },
  {
    id: "field",
    name: "Padang Bunga",
    emoji: "🌼",
    minLevel: 10,
    maxLevel: 14,
    description: "Padang bunga liar beraneka warna yang semerbak dan diterpa angin musim semi.",
    dominantColors: ["#F7F3E6", "#6C8B22", "#D46A8E"],
    bannerScene: "flower_field",
    elements: ["Kupu-kupu warna-warni", "Lebah madu", "Bunga bermekaran"],
  },
  {
    id: "mountain",
    name: "Kaki Gunung",
    emoji: "⛰️",
    minLevel: 15,
    maxLevel: 19,
    description: "Lereng bukit sejuk dengan pemandangan puncak berselimut kabut dan pondok kayu.",
    dominantColors: ["#E8ECEF", "#4A6572", "#344955"],
    bannerScene: "mountain_slope",
    elements: ["Embun beku", "Asap cerobong pondok", "Cemara gunung"],
  },
  {
    id: "beach",
    name: "Pantai Senja",
    emoji: "🏖️",
    minLevel: 20,
    maxLevel: 24,
    description: "Pantai tenang berselimut langit senja jingga keemasan dan suara deburan ombak.",
    dominantColors: ["#F4EBE2", "#8E4A49", "#DDA77B"],
    bannerScene: "sunset_beach",
    elements: ["Ombak tenang", "Burung camar", "Cahaya matahari terbenam"],
  },
  {
    id: "night",
    name: "Malam Berbintang",
    emoji: "🌌",
    minLevel: 25,
    maxLevel: 29,
    description: "Malam magis bertabur bintang gemerlap dan kerlap-kerlip ribuan kunang-kunang.",
    dominantColors: ["#161A29", "#6B5B95", "#E0B589"],
    bannerScene: "starry_night",
    elements: ["Kunang-kunang bercahaya", "Rasi bintang", "Cahaya bulan lembut"],
  },
  {
    id: "sky",
    name: "Taman Langit",
    emoji: "☁️",
    minLevel: 30,
    maxLevel: 99,
    description: "Taman surga di atas awan keemasan, tempat berkumpulnya bunga Bloom abadi.",
    dominantColors: ["#F9F9FB", "#D4AF37", "#7FB069"],
    bannerScene: "sky_garden",
    elements: ["Awan emas", "Bunga Bloom bercahaya", "Kristal embun"],
  },
];

export function getWorldById(worldId: string): WorldInfo {
  return WORLDS.find((w) => w.id === worldId) || WORLDS[0];
}

export function getUnlockedWorlds(level: number): WorldInfo[] {
  return WORLDS.filter((w) => level >= w.minLevel);
}
