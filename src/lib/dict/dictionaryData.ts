export interface DictWord {
  id: string;
  lemma: string;
  pos: "verb" | "noun" | "adjective" | "adverb";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  meaning: string;
  definition: string;
  ipa: string;
  forms?: {
    verb?: { v1: string; v2: string; v3: string; ving: string };
    noun?: { singular: string; plural: string };
    adjective?: { comparative: string; superlative: string };
  };
  examples: Array<{ sentence: string; translation: string }>;
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  collocations: string[];
  usageNotes: string;
  commonMistakes: string;
}

export const DICTIONARY_DATABASE: DictWord[] = [
  {
    id: "dict_achieve",
    lemma: "achieve",
    pos: "verb",
    level: "B1",
    meaning: "mencapai / meraih",
    definition: "to successfully finish something or reach an aim, especially after a lot of effort.",
    ipa: "/əˈtʃiːv/",
    forms: {
      verb: { v1: "achieve", v2: "achieved", v3: "achieved", ving: "achieving" },
    },
    examples: [
      {
        sentence: "She worked diligently to achieve her dream of becoming a software engineer.",
        translation: "Dia bekerja keras dengan tekun untuk meraih impiannya menjadi seorang insinyur perangkat lunak.",
      },
      {
        sentence: "You can achieve great results with regular daily practice.",
        translation: "Kamu bisa meraih hasil luar biasa dengan latihan rutin setiap hari.",
      },
      {
        sentence: "We achieved all our quarterly goals ahead of schedule.",
        translation: "Kami mencapai semua target kuartal kami lebih cepat dari jadwal.",
      },
    ],
    synonyms: ["attain", "accomplish", "reach", "fulfill", "realize"],
    antonyms: ["fail", "abandon", "lose", "neglect"],
    relatedWords: ["achievement", "achievable", "achiever"],
    collocations: ["achieve a goal", "achieve success", "achieve greatness", "hard to achieve"],
    usageNotes: "Gunakan 'achieve' untuk hasil yang membutuhkan usaha nyata dan waktu, bukan sesuatu yang terjadi secara kebetulan.",
    commonMistakes: "Banyak pembelajar menulis 'achieve to do something'. Yang tepat adalah 'achieve a goal' atau 'manage to do something'.",
  },
  {
    id: "dict_eloquent",
    lemma: "eloquent",
    pos: "adjective",
    level: "B2",
    meaning: "fasih / piawai berbicara",
    definition: "giving a clear, strong message; able to express ideas well and persuasively.",
    ipa: "/ˈel.ə.kwənt/",
    forms: {
      adjective: { comparative: "more eloquent", superlative: "most eloquent" },
    },
    examples: [
      {
        sentence: "The student gave an eloquent speech at the university graduation ceremony.",
        translation: "Mahasiswa itu menyampaikan pidato yang sangat fasih pada upacara wisuda universitas.",
      },
      {
        sentence: "His silence was more eloquent than any words could be.",
        translation: "Keheningannya jauh lebih bermakna daripada kata-kata apa pun.",
      },
    ],
    synonyms: ["articulate", "fluent", "persuasive", "expressive"],
    antonyms: ["inarticulate", "hesitant", "clumsy"],
    relatedWords: ["eloquence", "eloquently"],
    collocations: ["eloquent speech", "eloquent speaker", "eloquent silence"],
    usageNotes: "'Eloquent' bukan sekadar lancar (fluent), melainkan memiliki gaya penyampaian yang anggun dan menyentuh.",
    commonMistakes: "Jangan keliru memakai 'eloquent' untuk kecepatan berbicara; ini merujuk pada keindahan dan ketepatan kata.",
  },
  {
    id: "dict_resilient",
    lemma: "resilient",
    pos: "adjective",
    level: "B2",
    meaning: "tangguh / cepat bangkit dari kesulitan",
    definition: "able to be happy, successful, etc. again after something difficult or bad has happened.",
    ipa: "/rɪˈzɪl.jənt/",
    forms: {
      adjective: { comparative: "more resilient", superlative: "most resilient" },
    },
    examples: [
      {
        sentence: "Plants in the desert are remarkably resilient to harsh weather.",
        translation: "Tumbuhan di gurun luar biasa tangguh menghadapi cuaca ekstrem.",
      },
      {
        sentence: "She remained resilient despite facing numerous setbacks in her career.",
        translation: "Dia tetap tangguh meskipun menghadapi banyak rintangan dalam karirnya.",
      },
    ],
    synonyms: ["tough", "durable", "tenacious", "adaptable"],
    antonyms: ["fragile", "vulnerable", "weak"],
    relatedWords: ["resilience", "resiliency", "resiliently"],
    collocations: ["resilient spirit", "highly resilient", "remain resilient"],
    usageNotes: "Bisa dipakai untuk manusia (mental), material (benda fisik yang elastis), maupun ekosistem alam.",
    commonMistakes: "Sering disamakan persis dengan 'strong'. 'Resilient' menekankan kemampuan untuk memantul kembali setelah jatuh.",
  },
  {
    id: "dict_ponder",
    lemma: "ponder",
    pos: "verb",
    level: "C1",
    meaning: "merenungkan / memikirkan mendalam",
    definition: "to think carefully about something, especially for a noticeable period of time.",
    ipa: "/ˈpɒn.dər/",
    forms: {
      verb: { v1: "ponder", v2: "pondered", v3: "pondered", ving: "pondering" },
    },
    examples: [
      {
        sentence: "He sat quietly by the lake to ponder his next career move.",
        translation: "Dia duduk tenang di tepi danau untuk merenungkan langkah karir selanjutnya.",
      },
      {
        sentence: "The committee is pondering whether to fund the new research project.",
        translation: "Komite sedang mempertimbangkan dengan mendalam apakah akan mendanai proyek riset baru itu.",
      },
    ],
    synonyms: ["contemplate", "deliberate", "reflect", "meditate", "consider"],
    antonyms: ["ignore", "overlook", "dismiss"],
    relatedWords: ["ponderous", "pondering"],
    collocations: ["ponder over", "ponder whether", "ponder a question"],
    usageNotes: "Bisa diikuti objek langsung ('ponder the decision') atau preposisi 'over/on' ('ponder over the mystery').",
    commonMistakes: "Jangan gunakan 'ponder' untuk pemikiran cepat spontan; kata ini menyiratkan kontemplasi yang tenang dan mendalam.",
  },
  {
    id: "dict_serendipity",
    lemma: "serendipity",
    pos: "noun",
    level: "C1",
    meaning: "keberuntungan tak terduga",
    definition: "the fact of finding interesting or valuable things by chance in a happy way.",
    ipa: "/ˌser.ənˈdɪp.ə.ti/",
    forms: {
      noun: { singular: "serendipity", plural: "serendipities" },
    },
    examples: [
      {
        sentence: "Finding that rare book in a small village shop was pure serendipity.",
        translation: "Menemukan buku langka itu di toko desa kecil adalah murni keberuntungan yang tak disengaja.",
      },
      {
        sentence: "Many great scientific discoveries happen through serendipity.",
        translation: "Banyak penemuan ilmiah hebat terjadi melalui keberuntungan tak terduga.",
      },
    ],
    synonyms: ["fluke", "happy coincidence", "providence", "stroke of luck"],
    antonyms: ["misfortune", "bad luck"],
    relatedWords: ["serendipitous", "serendipitously"],
    collocations: ["pure serendipity", "moment of serendipity", "by serendipity"],
    usageNotes: "Kata benda yang sangat puitis dan positif. Sering dipakai saat menemukan sesuatu yang berharga tanpa dicari.",
    commonMistakes: "Bukan sembarang 'luck', melainkan keberuntungan menemukan sesuatu yang menyenangkan secara kebetulan.",
  },
  {
    id: "dict_lenient",
    lemma: "lenient",
    pos: "adjective",
    level: "B2",
    meaning: "toleran / tidak keras / pengampun",
    definition: "not as severe or strong in punishing or judging someone as might be expected.",
    ipa: "/ˈliː.ni.ənt/",
    forms: {
      adjective: { comparative: "more lenient", superlative: "most lenient" },
    },
    examples: [
      {
        sentence: "The teacher was surprisingly lenient with students who submitted homework late.",
        translation: "Guru tersebut secara mengejutkan cukup toleran terhadap murid yang terlambat mengumpulkan PR.",
      },
      {
        sentence: "The judge gave a lenient sentence due to the defendant's sincere remorse.",
        translation: "Hakim memberikan vonis yang ringan karena penyesalan tulus terdakwa.",
      },
    ],
    synonyms: ["merciful", "tolerant", "forgiving", "mild", "indulgent"],
    antonyms: ["strict", "harsh", "severe", "rigorous"],
    relatedWords: ["leniency", "leniently"],
    collocations: ["lenient punishment", "lenient judge", "lenient policy"],
    usageNotes: "Sering dipasangkan dengan kata yang berkaitan dengan aturan, hukuman, hukum, atau pengasuhan anak.",
    commonMistakes: "Perhatikan ejaan: huruf 'e' setelah 'l', bukan 'lineant'.",
  },
  {
    id: "dict_diligent",
    lemma: "diligent",
    pos: "adjective",
    level: "B1",
    meaning: "rajin / tekun dan teliti",
    definition: "done in a careful and detailed way; working hard with careful effort.",
    ipa: "/ˈdɪl.ɪ.dʒənt/",
    forms: {
      adjective: { comparative: "more diligent", superlative: "most diligent" },
    },
    examples: [
      {
        sentence: "Her diligent work habits earned her a well-deserved promotion.",
        translation: "Kebiasaan kerjanya yang tekun membuatnya mendapatkan promosi yang memang layak diterimanya.",
      },
      {
        sentence: "After diligent research, the team finally found a cure.",
        translation: "Setelah penelitian yang teliti dan tekun, tim akhirnya menemukan obatnya.",
      },
    ],
    synonyms: ["industrious", "hardworking", "conscientious", "meticulous"],
    antonyms: ["lazy", "negligent", "careless"],
    relatedWords: ["diligence", "diligently"],
    collocations: ["diligent student", "diligent effort", "diligent worker"],
    usageNotes: "'Diligent' menggabungkan kerja keras (hard work) dengan ketelitian dan rasa tanggung jawab (carefulness).",
    commonMistakes: "Sering tertukar penempatan dengan 'diligence' (kata benda). Contoh: 'She has great diligence' vs 'She is a diligent worker'.",
  },
  {
    id: "dict_thrive",
    lemma: "thrive",
    pos: "verb",
    level: "B2",
    meaning: "tumbuh subur / berkembang pesat",
    definition: "to grow, develop, or be successful in a lively and healthy way.",
    ipa: "/θraɪv/",
    forms: {
      verb: { v1: "thrive", v2: "thrived", v3: "thrived", ving: "thriving" },
    },
    examples: [
      {
        sentence: "Our plants thrive when given plenty of morning sunlight and clean water.",
        translation: "Tanaman kita tumbuh subur saat diberi banyak sinar matahari pagi dan air bersih.",
      },
      {
        sentence: "Creative individuals often thrive in an environment that encourages exploration.",
        translation: "Orang-orang kreatif sering berkembang pesat di lingkungan yang mendorong eksplorasi.",
      },
    ],
    synonyms: ["flourish", "prosper", "bloom", "blossom"],
    antonyms: ["wither", "deteriorate", "decline", "struggle"],
    relatedWords: ["thriving"],
    collocations: ["thrive on challenge", "continue to thrive", "thrive under pressure"],
    usageNotes: "Bentuk lampau v2 bisa 'thrived' atau 'throve' (klasik). Sering dipakai dengan preposisi 'on' (misal: 'thrive on stress').",
    commonMistakes: "Bukan sekadar 'survive' (bertahan hidup), melainkan jauh melampauinya: tumbuh secara prima dan makmur.",
  },
  {
    id: "dict_candid",
    lemma: "candid",
    pos: "adjective",
    level: "B2",
    meaning: "jujur apa adanya / blak-blakan ramah",
    definition: "honest and telling the truth, especially about something difficult or painful.",
    ipa: "/ˈkæn.dɪd/",
    forms: {
      adjective: { comparative: "more candid", superlative: "most candid" },
    },
    examples: [
      {
        sentence: "I appreciated her candid feedback regarding our new website design.",
        translation: "Saya sangat menghargai masukan jujur apa adanya dari dia mengenai desain website baru kami.",
      },
      {
        sentence: "The author was remarkably candid about his personal struggles.",
        translation: "Sang penulis sangat terbuka dan jujur mengenai perjuangan pribadinya.",
      },
    ],
    synonyms: ["frank", "forthright", "open", "honest", "straightforward"],
    antonyms: ["secretive", "evasive", "dishonest", "guarded"],
    relatedWords: ["candor", "candidly"],
    collocations: ["candid opinion", "candid interview", "candid conversation", "candid photo"],
    usageNotes: "Dalam fotografi, 'candid photo' berarti foto spontan tanpa pose. Dalam ucapan, berarti jujur tanpa basa-basi namun tidak kasar.",
    commonMistakes: "Beda dengan 'rude'. 'Candid' itu tulus dan terus terang, bukan bermaksud menyakiti lawan bicara.",
  },
  {
    id: "dict_nurture",
    lemma: "nurture",
    pos: "verb",
    level: "B2",
    meaning: "merawat / membina dengan kasih sayang",
    definition: "to feed and care for a child, plant, or idea while it is growing and developing.",
    ipa: "/ˈnɜː.tʃər/",
    forms: {
      verb: { v1: "nurture", v2: "nurtured", v3: "nurtured", ving: "nurturing" },
    },
    examples: [
      {
        sentence: "A teacher's role is to nurture each student's unique potential.",
        translation: "Peran seorang guru adalah membina dan merawat potensi unik setiap murid.",
      },
      {
        sentence: "She carefully nurtured the tiny sprout until it grew into a strong tree.",
        translation: "Dia merawat tunas kecil itu dengan telaten hingga tumbuh menjadi pohon yang kokoh.",
      },
    ],
    synonyms: ["foster", "cultivate", "cherish", "tend", "encourage"],
    antonyms: ["neglect", "ignore", "suppress", "hinder"],
    relatedWords: ["nurturing", "nurturer"],
    collocations: ["nurture talent", "nurture a relationship", "nature versus nurture"],
    usageNotes: "Sangat pas dengan konsep kebun Verba. Bisa berupa merawat makhluk hidup maupun membina gagasan dan bakat.",
    commonMistakes: "Jangan menyamakan dengan 'control'. Nurture berarti menyediakan lingkungan yang mendukung pertumbuhan alami.",
  },
  {
    id: "dict_vague",
    lemma: "vague",
    pos: "adjective",
    level: "B1",
    meaning: "samar-samar / tidak jelas",
    definition: "not clearly expressed, known, described, or decided.",
    ipa: "/veɪɡ/",
    forms: {
      adjective: { comparative: "vaguer", superlative: "vaguest" },
    },
    examples: [
      {
        sentence: "His instructions were too vague, leaving everyone confused about what to do.",
        translation: "Instruksinya terlalu samar-samar, membuat semua orang bingung apa yang harus dikerjakan.",
      },
      {
        sentence: "I only have a vague memory of my childhood hometown.",
        translation: "Saya hanya memiliki ingatan yang samar-samar tentang kota masa kecil saya.",
      },
    ],
    synonyms: ["unclear", "ambiguous", "hazy", "fuzzy", "indistinct"],
    antonyms: ["clear", "precise", "distinct", "specific"],
    relatedWords: ["vagueness", "vaguely"],
    collocations: ["vague idea", "vague memory", "vague answer", "remain vague"],
    usageNotes: "Pengucapan berakhiran /ɡ/, huruf 'ue' di akhir tidak dibaca (dibaca seperti kata 'vague' berirama dengan 'plague').",
    commonMistakes: "Banyak orang Indonesia salah melafalkannya menjadi 'va-gu-e'. Bunyinya hanya satu suku kata: /veɪɡ/.",
  },
  {
    id: "dict_meticulous",
    lemma: "meticulous",
    pos: "adjective",
    level: "C1",
    meaning: "sangat teliti dan cermat",
    definition: "very careful and with great attention to every small detail.",
    ipa: "/məˈtɪk.jə.ləs/",
    forms: {
      adjective: { comparative: "more meticulous", superlative: "most meticulous" },
    },
    examples: [
      {
        sentence: "The graphic designer showed meticulous attention to margins and typography.",
        translation: "Desainer grafis itu menunjukkan perhatian yang sangat teliti terhadap margin dan tipografi.",
      },
      {
        sentence: "Her notes were always neat and meticulously organized.",
        translation: "Catatannya selalu rapi dan disusun dengan sangat cermat.",
      },
    ],
    synonyms: ["painstaking", "thorough", "scrupulous", "diligent", "precise"],
    antonyms: ["careless", "sloppy", "reckless", "hasty"],
    relatedWords: ["meticulously", "meticulousness"],
    collocations: ["meticulous attention", "meticulous planning", "meticulous research"],
    usageNotes: "Memberi nuansa apresiasi atas kehati-hatian pada detail kecil yang sering terlewat oleh orang lain.",
    commonMistakes: "Beda dengan 'picky'. Meticulous bernilai positif atas standar kualitas yang tinggi.",
  },
  {
    id: "dict_pragmatic",
    lemma: "pragmatic",
    pos: "adjective",
    level: "C1",
    meaning: "pragmatis / berorientasi pada kenyataan praktis",
    definition: "solving problems in a sensible, realistic way that suits the conditions, rather than following strict rules or ideas.",
    ipa: "/præɡˈmæt.ɪk/",
    forms: {
      adjective: { comparative: "more pragmatic", superlative: "most pragmatic" },
    },
    examples: [
      {
        sentence: "In coding, we should choose pragmatic solutions over overly complex abstractions.",
        translation: "Dalam pemrograman, kita sebaiknya memilih solusi pragmatis daripada abstraksi yang terlalu rumit.",
      },
      {
        sentence: "He took a pragmatic approach to solving the budget deficit.",
        translation: "Dia mengambil pendekatan pragmatis untuk menyelesaikan defisit anggaran.",
      },
    ],
    synonyms: ["practical", "realistic", "sensible", "down-to-earth", "utilitarian"],
    antonyms: ["idealistic", "unrealistic", "dogmatic", "impractical"],
    relatedWords: ["pragmatism", "pragmatically"],
    collocations: ["pragmatic approach", "pragmatic solution", "pragmatic view"],
    usageNotes: "Sangat umum dalam dunia teknik dan manajemen, menekankan hasil nyata yang dapat diwujudkan.",
    commonMistakes: "Jangan disamakan dengan 'opportunistic'. Pragmatic berfokus pada apa yang benar-benar bisa bekerja dengan baik.",
  },
  {
    id: "dict_embrace",
    lemma: "embrace",
    pos: "verb",
    level: "B2",
    meaning: "merangkul / menyambut dengan antusias",
    definition: "to accept something willingly and enthusiastically, or to hold someone closely in your arms.",
    ipa: "/ɪmˈbreɪs/",
    forms: {
      verb: { v1: "embrace", v2: "embraced", v3: "embraced", ving: "embracing" },
    },
    examples: [
      {
        sentence: "Instead of fearing change, we should embrace new learning opportunities.",
        translation: "Daripada takut akan perubahan, kita sebaiknya menyambut dengan antusias peluang belajar baru.",
      },
      {
        sentence: "They warmly embraced their old friend at the train station.",
        translation: "Mereka merangkul hangat sahabat lama mereka di stasiun kereta.",
      },
    ],
    synonyms: ["welcome", "accept", "adopt", "hug", "champion"],
    antonyms: ["reject", "refuse", "shun", "dismiss"],
    relatedWords: ["embraceable", "embracing"],
    collocations: ["embrace change", "embrace diversity", "embrace a new idea", "warm embrace"],
    usageNotes: "Memiliki makna fisik (memeluk) dan makna kiasan (menerima ide atau budaya baru dengan senang hati).",
    commonMistakes: "Secara kiasan, sering lebih tepat daripada 'accept' karena menunjukkan antusiasme aktif, bukan sekadar pasrah menerima.",
  },
  {
    id: "dict_spark",
    lemma: "spark",
    pos: "verb",
    level: "B2",
    meaning: "memicu / membangkitkan (minat, ide)",
    definition: "to cause the start of something, especially an argument, curiosity, or lively interest.",
    ipa: "/spɑːk/",
    forms: {
      verb: { v1: "spark", v2: "sparked", v3: "sparked", ving: "sparking" },
    },
    examples: [
      {
        sentence: "Her presentation sparked a lively discussion among all team members.",
        translation: "Presentasinya memicu diskusi yang hidup di antara seluruh anggota tim.",
      },
      {
        sentence: "A simple book can spark a lifelong curiosity about foreign languages.",
        translation: "Sebuah buku sederhana bisa membangkitkan rasa ingin tahu seumur hidup tentang bahasa asing.",
      },
    ],
    synonyms: ["ignite", "trigger", "stimulate", "provoke", "inspire"],
    antonyms: ["douse", "quench", "suppress", "extinguish"],
    relatedWords: ["sparkle", "sparkling"],
    collocations: ["spark curiosity", "spark an interest", "spark a debate", "spark an idea"],
    usageNotes: "Sering dipakai dalam idiom 'spark joy' atau 'spark curiosity' untuk hal yang menghasilkan energi positif tiba-tiba.",
    commonMistakes: "Sebagai kata kerja, langsung diikuti objek ('spark interest'), tidak perlu preposisi 'to' atau 'for'.",
  },
];
