/**
 * ZiWei Knowledge Base — TianJi Global
 * Structured reference data for Zi Wei Dou Shu (紫微斗数) palace interpretations.
 *
 * Exports: PALACE_MEANINGS, STAR_MEANINGS, STAR_GROUPS, PALACE_STAR_MAP,
 *          StarsByPalace, buildZiweiCorpus
 */

// ─── Type Definitions ───────────────────────────────────────────────────────────

export interface PalaceMeaning {
  id: string;
  palace_zh: string;
  palace_en: string;
  palace_abbrev: string;
  location_meaning_zh: string;
  location_meaning_en: string;
  affairs_zh: string;
  affairs_en: string;
  personality_traits_zh: string;
  personality_traits_en: string;
  health_zh: string;
  health_en: string;
  career_hint_zh: string;
  career_hint_en: string;
}

export interface StarMeaning {
  id: string;
  star_zh: string;
  star_en: string;
  star_pinyin: string;
  star_type: 'primary' | 'secondary' | 'transforming' | 'mutual' | 'minor';
  element_zh: string;
  element_en: string;
  nature_zh: string;
  nature_en: string;
  keywords_zh: string[];
  keywords_en: string[];
  fortune_zh: string;
  fortune_en: string;
}

export interface StarGroup {
  id: string;
  group_name_zh: string;
  group_name_en: string;
  stars: string[];
  description_zh: string;
  description_en: string;
}

export interface PalaceStarInfluence {
  palaceId: string;
  starId: string;
  influence_zh: string;
  influence_en: string;
  strength: 'auspicious' | 'inauspicious' | 'neutral';
}

export interface MingzhuCombination {
  id: string;
  star1: string;
  star2: string;
  combination_zh: string;
  combination_en: string;
  effect_zh: string;
  effect_en: string;
}

// ─── Palace Meanings (十二宫) ──────────────────────────────────────────────────

export const PALACE_MEANINGS: PalaceMeaning[] = [
  {
    id: 'palace-ming',
    palace_zh: '命宫',
    palace_en: 'Life Palace',
    palace_abbrev: '命',
    location_meaning_zh: '核心自我，性格根基',
    location_meaning_en: 'Core self, personality foundation',
    affairs_zh: '本命宫，主导一生命运走向',
    affairs_en: 'Main life palace, determines life direction',
    personality_traits_zh: '性格特点、行事风格、人生追求',
    personality_traits_en: 'Personality traits, behavioral style, life pursuits',
    health_zh: '身体健康状况',
    health_en: 'General physical condition',
    career_hint_zh: '适合的职业方向',
    career_hint_en: 'Suitable career directions',
  },
  {
    id: 'palace-parent',
    palace_zh: '父母宫',
    palace_en: 'Parents Palace',
    palace_abbrev: '父母',
    location_meaning_zh: '与父母、长辈、上司的关系',
    location_meaning_en: 'Relationship with parents, elders, superiors',
    affairs_zh: '父母缘分、遗传、学业、学历',
    affairs_en: 'Parental bond, inheritance, academics, education',
    personality_traits_zh: '对长辈的态度、权威感',
    personality_traits_en: 'Attitude toward elders, sense of authority',
    health_zh: '头部、头发、皮肤健康',
    health_en: 'Head, hair, skin health',
    career_hint_zh: '适合学术、教育、管理职位',
    career_hint_en: 'Suitable for academia, education, management',
  },
  {
    id: 'palace-brother',
    palace_zh: '兄弟宫',
    palace_en: 'Siblings Palace',
    palace_abbrev: '兄弟',
    location_meaning_zh: '兄弟姐妹、同辈、合作关系',
    location_meaning_en: 'Siblings, peers, cooperative relationships',
    affairs_zh: '兄弟姐妹缘分、合作伙伴、同事关系',
    affairs_en: 'Sibling bonds, business partners, colleague relations',
    personality_traits_zh: '合作精神、社交能力',
    personality_traits_en: 'Cooperation spirit, social ability',
    health_zh: '胸部、肩胛、手臂健康',
    health_en: 'Chest, shoulder, arm health',
    career_hint_zh: '适合合作性质的工作',
    career_hint_en: 'Suitable for cooperative work',
  },
  {
    id: 'palace-spouse',
    palace_zh: '夫妻宫',
    palace_en: 'Spouse Palace',
    palace_abbrev: '夫妻',
    location_meaning_zh: '婚姻、伴侣、感情模式',
    location_meaning_en: 'Marriage, partner, emotional patterns',
    affairs_zh: '婚姻状况、伴侣特质、感情发展',
    affairs_en: 'Marital status, partner qualities, emotional development',
    personality_traits_zh: '感情态度、亲密关系模式',
    personality_traits_en: 'Emotional attitude, intimacy patterns',
    health_zh: '心脏、血液循环',
    health_en: 'Heart, blood circulation',
    career_hint_zh: '适合公关、客户服务类工作',
    career_hint_en: 'Suitable for PR, customer service work',
  },
  {
    id: 'palace-child',
    palace_zh: '子女宫',
    palace_en: 'Children Palace',
    palace_abbrev: '子女',
    location_meaning_zh: '子女、晚辈、创意表达',
    location_meaning_en: 'Children, juniors, creative expression',
    affairs_zh: '子女缘分、创造力、业余爱好',
    affairs_en: 'Child bonds, creativity, hobbies',
    personality_traits_zh: '对晚辈的态度、表达能力',
    personality_traits_en: 'Attitude toward juniors, expressive ability',
    health_zh: '泌尿系统、生殖系统',
    health_en: 'Urinary system, reproductive system',
    career_hint_zh: '适合创意、教育、娱乐产业',
    career_hint_en: 'Suitable for creative, educational, entertainment industries',
  },
  {
    id: 'palace-fortune',
    palace_zh: '财帛宫',
    palace_en: 'Wealth Palace',
    palace_abbrev: '财',
    location_meaning_zh: '财富状况、理财能力',
    location_meaning_en: 'Financial situation, money management ability',
    affairs_zh: '赚钱方式、理财观念、财运',
    affairs_en: 'Money-making methods, financial mindset, wealth luck',
    personality_traits_zh: '金钱观念、消费习惯',
    personality_traits_en: 'Money mindset, spending habits',
    health_zh: '胃部、消化系统',
    health_en: 'Stomach, digestive system',
    career_hint_zh: '适合财务、金融、贸易',
    career_hint_en: 'Suitable for finance, banking, trade',
  },
  {
    id: 'palace-health',
    palace_zh: '疾厄宫',
    palace_en: 'Health Palace',
    palace_abbrev: '疾',
    location_meaning_zh: '健康状况、疾病倾向',
    location_meaning_en: 'Health condition, disease tendencies',
    affairs_zh: '健康走势、养生建议、疾病预测',
    affairs_en: 'Health trends, wellness advice, illness predictions',
    personality_traits_zh: '对健康的态度',
    personality_traits_en: 'Attitude toward health',
    health_zh: '重点关注健康区域',
    health_en: 'Key health areas of concern',
    career_hint_zh: '适合医疗、健康产业',
    career_hint_en: 'Suitable for medical, health industry',
  },
  {
    id: 'palace-migration',
    palace_zh: '迁移宫',
    palace_en: 'Migration Palace',
    palace_abbrev: '迁',
    location_meaning_zh: '外出发展、旅途运、人际关系',
    location_meaning_en: 'Travel, external development, social interactions',
    affairs_zh: '出行运、搬迁、移民、人际拓展',
    affairs_en: 'Travel luck, relocation, migration, social expansion',
    personality_traits_zh: '适应能力、社交方式',
    personality_traits_en: 'Adaptability, social approach',
    health_zh: '四肢、皮肤',
    health_en: 'Limbs, skin',
    career_hint_zh: '适合外贸、旅游、航空',
    career_hint_en: 'Suitable for foreign trade, tourism, aviation',
  },
  {
    id: 'palace-servant',
    palace_zh: '奴仆宫',
    palace_en: 'Servants Palace',
    palace_abbrev: '仆',
    location_meaning_zh: '下属、朋友、社会关系',
    location_meaning_en: 'Subordinates, friends, social relations',
    affairs_zh: '人脉资源、下属关系、社交圈子',
    affairs_en: 'Network resources, subordinate relations, social circles',
    personality_traits_zh: '领导力、人际策略',
    personality_traits_en: 'Leadership, interpersonal strategy',
    health_zh: '大腿、臀部',
    health_en: 'Thighs, hips',
    career_hint_zh: '适合管理、行政、人力资源',
    career_hint_en: 'Suitable for management, administration, HR',
  },
  {
    id: 'palace-official',
    palace_zh: '官禄宫',
    palace_en: 'Career Palace',
    palace_abbrev: '官',
    location_meaning_zh: '事业发展、学业、地位',
    location_meaning_en: 'Career development, academics, status',
    affairs_zh: '事业运势、学历成就、职位升迁',
    affairs_en: 'Career fortune, academic achievement, promotion',
    personality_traits_zh: '事业心、竞争力',
    personality_traits_en: 'Ambition, competitiveness',
    health_zh: '头部、脑部功能',
    health_en: 'Head, brain function',
    career_hint_zh: '适合管理、创业、学术',
    career_hint_en: 'Suitable for management, entrepreneurship, academia',
  },
  {
    id: 'palace-land',
    palace_zh: '田宅宫',
    palace_en: 'Property Palace',
    palace_abbrev: '田',
    location_meaning_zh: '房产、遗产、家庭环境',
    location_meaning_en: 'Real estate, inheritance, family environment',
    affairs_zh: '房产运势、家庭关系、居住环境',
    affairs_en: 'Real estate luck, family relations, living environment',
    personality_traits_zh: '家庭观念、归属感',
    personality_traits_en: 'Family concept, sense of belonging',
    health_zh: '消化系统、腹部',
    health_en: 'Digestive system, abdomen',
    career_hint_zh: '适合房地产、建筑',
    career_hint_en: 'Suitable for real estate, construction',
  },
  {
    id: 'palace-beyond',
    palace_zh: '福德宫',
    palace_en: 'Virtue Palace',
    palace_abbrev: '福',
    location_meaning_zh: '福气、品德、精神享受',
    location_meaning_en: 'Blessings, virtue, spiritual enjoyment',
    affairs_zh: '福气指数、道德观念、精神生活',
    affairs_en: 'Blessing index, moral values, spiritual life',
    personality_traits_zh: '品德修养、价值观念',
    personality_traits_en: 'Moral cultivation, value system',
    health_zh: '神经系统、精神状态',
    health_en: 'Nervous system, mental state',
    career_hint_zh: '适合文化、教育、公益',
    career_hint_en: 'Suitable for culture, education, charity',
  },
];

// ─── Star Meanings (主要星曜) ─────────────────────────────────────────────────

export const STAR_MEANINGS: StarMeaning[] = [
  // ── Primary Stars (甲级星) ──────────────────────────────────────────────────
  {
    id: 'star-ziwei',
    star_zh: '紫微星',
    star_en: 'Zi Wei (Purple Emperor)',
    star_pinyin: 'Zi Wei',
    star_type: 'primary',
    element_zh: '土',
    element_en: 'Earth',
    nature_zh: '帝王之星，最大吉星',
    nature_en: 'Emperor star, the most auspicious star',
    keywords_zh: ['尊贵', '领导', '权势', '稳定'],
    keywords_en: ['noble', 'leadership', 'power', 'stability'],
    fortune_zh: '紫微星入命，主人贵气，有领导才能',
    fortune_en: 'Zi Wei in Life Palace gives nobility and leadership ability',
  },
  {
    id: 'star-tianji',
    star_zh: '天机星',
    star_en: 'Tian Ji (Heavenly Mechanism)',
    star_pinyin: 'Tian Ji',
    star_type: 'primary',
    element_zh: '木',
    element_en: 'Wood',
    nature_zh: '智慧之星，善于策划',
    nature_en: 'Wisdom star, good at planning',
    keywords_zh: ['智慧', '策划', '变动', '机巧'],
    keywords_en: ['wisdom', 'planning', 'change', 'cleverness'],
    fortune_zh: '天机星入命，主人聪明好学，善于策划',
    fortune_en: 'Tian Ji in Life Palace gives intelligence and planning ability',
  },
  {
    id: 'star-taiyang',
    star_zh: '太阳星',
    star_en: 'Tai Yang (Great Sun)',
    star_pinyin: 'Tai Yang',
    star_type: 'primary',
    element_zh: '火',
    element_en: 'Fire',
    nature_zh: '光明之星，热情开朗',
    nature_en: 'Bright star, warm and cheerful',
    keywords_zh: ['光明', '热情', '名望', '付出'],
    keywords_en: ['brightness', 'passion', 'fame', 'giving'],
    fortune_zh: '太阳星入命，主人热情大方，追求名望',
    fortune_en: 'Tai Yang in Life Palace gives warmth, generosity, pursuit of fame',
  },
  {
    id: 'star-wuliu',
    star_zh: '武曲星',
    star_en: 'Wu Qu (Martial Valor)',
    star_pinyin: 'Wu Qu',
    star_type: 'primary',
    element_zh: '金',
    element_en: 'Metal',
    nature_zh: '财星，刚毅果断',
    nature_en: 'Wealth star, resolute and decisive',
    keywords_zh: ['刚毅', '财运', '果断', '执行力'],
    keywords_en: ['resolute', 'wealth luck', 'decisive', 'execution'],
    fortune_zh: '武曲星入命，主人刚强果断，善于理财',
    fortune_en: 'Wu Qu in Life Palace gives resoluteness and financial skill',
  },
  {
    id: 'star-tianfu',
    star_zh: '天府星',
    star_en: 'Tian Fu (Heavenly Treasurer)',
    star_pinyin: 'Tian Fu',
    star_type: 'primary',
    element_zh: '土',
    element_en: 'Earth',
    nature_zh: '富星，稳重诚信',
    nature_en: 'Wealth star, steady and honest',
    keywords_zh: ['富足', '稳重', '诚信', '管理'],
    keywords_en: ['wealth', 'steadiness', 'honesty', 'management'],
    fortune_zh: '天府星入命，主人诚信可靠，善于理财',
    fortune_en: 'Tian Fu in Life Palace gives honesty and financial management',
  },
  {
    id: 'star-thief',
    star_zh: '贪狼星',
    star_en: 'Tan Lang (Greedy Wolf)',
    star_pinyin: 'Tan Lang',
    star_type: 'primary',
    element_zh: '水',
    element_en: 'Water',
    nature_zh: '欲望之星，多才多艺',
    nature_en: 'Desire star, versatile talents',
    keywords_zh: ['欲望', '才艺', '桃花', '交际'],
    keywords_en: ['desire', 'talent', 'romance', 'socializing'],
    fortune_zh: '贪狼星入命，主人多才多艺，桃花旺盛',
    fortune_en: 'Tan Lang in Life Palace gives versatile talents and romantic luck',
  },
  {
    id: 'star-jianku',
    star_zh: '巨门星',
    star_en: 'Ju Men (Giant Door)',
    star_pinyin: 'Ju Men',
    star_type: 'primary',
    element_zh: '水',
    element_en: 'Water',
    nature_zh: '是非之星，口才出众',
    nature_en: 'Controversy star, outstanding eloquence',
    keywords_zh: ['口才', '是非', '分析', '深沉'],
    keywords_en: ['eloquence', 'controversy', 'analysis', 'depth'],
    fortune_zh: '巨门星入命，主人能言善辩，分析力强',
    fortune_en: 'Ju Men in Life Palace gives eloquence and analytical ability',
  },
  {
    id: 'star-lucun',
    star_zh: '禄存星',
    star_en: 'Lu Cun (Wealth Keeper)',
    star_pinyin: 'Lu Cun',
    star_type: 'primary',
    element_zh: '土',
    element_en: 'Earth',
    nature_zh: '财星，积累型',
    nature_en: 'Wealth star, accumulative type',
    keywords_zh: ['财运', '积累', '稳定', '储蓄'],
    keywords_en: ['wealth luck', 'accumulation', 'stability', 'savings'],
    fortune_zh: '禄存星入命，主人财运稳定，善于积累',
    fortune_en: 'Lu Cun in Life Palace gives stable wealth and accumulation skill',
  },
  {
    id: 'star-tianxiang',
    star_zh: '天相星',
    star_en: 'Tian Xiang (Heavenly Minister)',
    star_pinyin: 'Tian Xiang',
    star_type: 'primary',
    element_zh: '水',
    element_en: 'Water',
    nature_zh: '服务之星，协调能力强',
    nature_en: 'Service star, strong coordination ability',
    keywords_zh: ['协调', '服务', '公正', '辅助'],
    keywords_en: ['coordination', 'service', 'justice', 'support'],
    fortune_zh: '天相星入命，主人协调能力强，公正无私',
    fortune_en: 'Tian Xiang in Life Palace gives strong coordination and impartiality',
  },
  {
    id: 'star-xiangsheng',
    star_zh: '相生星',
    star_en: 'Xiang Sheng (Mutual Growth)',
    star_pinyin: 'Xiang Sheng',
    star_type: 'mutual',
    element_zh: '水',
    element_en: 'Water',
    nature_zh: '互助之星',
    nature_en: 'Mutual assistance star',
    keywords_zh: ['互助', '合作', '和谐'],
    keywords_en: ['mutual help', 'cooperation', 'harmony'],
    fortune_zh: '相生星入命宫，主人善于合作，人际关系佳',
    fortune_en: 'Xiang Sheng in Life Palace gives cooperation and good relations',
  },
  {
    id: 'star-yuan魁',
    star_zh: '天魁星',
    star_en: 'Tian Kui (Heavenly Honored)',
    star_pinyin: 'Tian Kui',
    star_type: 'secondary',
    element_zh: '火',
    element_en: 'Fire',
    nature_zh: '贵人星，得天助',
    nature_en: 'Noble help star, divine assistance',
    keywords_zh: ['贵人', '机遇', '文昌', '科甲'],
    keywords_en: ['noble person', 'opportunity', 'scholarly luck', 'academic success'],
    fortune_zh: '天魁星入命，主人得天独厚，有贵人相助',
    fortune_en: 'Tian Kui in Life Palace gives heavenly help and noble connections',
  },
  {
    id: 'star-yuanyu',
    star_zh: '天钺星',
    star_en: 'Tian Yue (Heavenly Axe)',
    star_pinyin: 'Tian Yue',
    star_type: 'secondary',
    element_zh: '火',
    element_en: 'Fire',
    nature_zh: '助力星，有靠山',
    nature_en: 'Support star, has backing',
    keywords_zh: ['助力', '靠山', '权威', '管理'],
    keywords_en: ['support', 'backing', 'authority', 'management'],
    fortune_zh: '天钺星入命，主人有靠山，做事有助力',
    fortune_en: 'Tian Yue in Life Palace gives backing and support in endeavors',
  },
  {
    id: 'star-huojis',
    star_zh: '火羊星',
    star_en: 'Huo Yang (Fire and Goat)',
    star_pinyin: 'Huo Yang',
    star_type: 'transforming',
    element_zh: '火',
    element_en: 'Fire',
    nature_zh: '冲动之星，爆发力强',
    nature_en: 'Impulsive star, strong explosive power',
    keywords_zh: ['冲动', '爆发', '果断', '急躁'],
    keywords_en: ['impulsive', 'explosive', 'decisive', 'impatient'],
    fortune_zh: '火羊星入命，主人冲动有爆发力，利于竞赛',
    fortune_en: 'Huo Yang in Life Palace gives impulsiveness and explosive power',
  },
  {
    id: 'star-liuhe',
    star_zh: '六害星',
    star_en: 'Liu Hai (Six Harming)',
    star_pinyin: 'Liu Hai',
    star_type: 'minor',
    element_zh: '土',
    element_en: 'Earth',
    nature_zh: '小人星，易招是非',
    nature_en: 'Enemy star, prone to controversy',
    keywords_zh: ['小人', '是非', '伤害', '冲撞'],
    keywords_en: ['enemies', 'controversy', 'harm', 'conflict'],
    fortune_zh: '六害星入命，易招小人是非，需注意人际',
    fortune_en: 'Liu Hai in Life Palace causes enemy conflicts, mind social relations',
  },
  {
    id: 'star-qingyang',
    star_zh: '青羊星',
    star_en: 'Qing Yang (Young Goat)',
    star_pinyin: 'Qing Yang',
    star_type: 'transforming',
    element_zh: '木',
    element_en: 'Wood',
    nature_zh: '变动之星，有创意',
    nature_en: 'Change star, creative',
    keywords_zh: ['变动', '创意', '青春', '冲动'],
    keywords_en: ['change', 'creativity', 'youth', 'impulsive'],
    fortune_zh: '青羊星入命，主人有创意但易冲动',
    fortune_en: 'Qing Yang in Life Palace gives creativity but also impulsiveness',
  },
];

// ─── Star Groups ────────────────────────────────────────────────────────────────

export const STAR_GROUPS: StarGroup[] = [
  {
    id: 'group-wealth',
    group_name_zh: '财星组',
    group_name_en: 'Wealth Star Group',
    stars: ['武曲星', '天府星', '禄存星', '财帛宫'],
    description_zh: '主管财富、理财、财运的星曜组合',
    description_en: 'Star combination governing wealth, finances, and money luck',
  },
  {
    id: 'group-career',
    group_name_zh: '事业组',
    group_name_en: 'Career Star Group',
    stars: ['紫微星', '天府星', '天相星', '官禄宫'],
    description_zh: '主管事业、学业、地位的星曜组合',
    description_en: 'Star combination governing career, academics, and status',
  },
  {
    id: 'group-romance',
    group_name_zh: '桃花组',
    group_name_en: 'Romance Star Group',
    stars: ['贪狼星', '天喜星', '红鸾星', '文曲星'],
    description_zh: '主管感情、桃花、社交的星曜组合',
    description_en: 'Star combination governing emotions, romance, and social life',
  },
  {
    id: 'group-wisdom',
    group_name_zh: '智慧组',
    group_name_en: 'Wisdom Star Group',
    stars: ['天机星', '巨门星', '文昌星', '文曲星'],
    description_zh: '主管智慧、学业、思考的星曜组合',
    description_en: 'Star combination governing wisdom, academics, and thinking',
  },
  {
    id: 'group-noble',
    group_name_zh: '贵人组',
    group_name_en: 'Noble Star Group',
    stars: ['天魁星', '天钺星', '解神星', '天寿星'],
    description_zh: '主管贵人、助力、机遇的星曜组合',
    description_en: 'Star combination governing noble people, support, and opportunities',
  },
  {
    id: 'group-health',
    group_name_zh: '健康组',
    group_name_en: 'Health Star Group',
    stars: ['天机星', '天相星', '天府星', '疾厄宫'],
    description_zh: '主管健康、疾病、体质的星曜组合',
    description_en: 'Star combination governing health, illness, and constitution',
  },
];

// ─── Palace-Star Influence Map ─────────────────────────────────────────────────

export const PALACE_STAR_INFLUENCE: PalaceStarInfluence[] = [
  {
    palaceId: 'palace-ming',
    starId: 'star-ziwei',
    influence_zh: '紫微星入命宫，主人尊贵，有领导才能，命运多波折但终有成就',
    influence_en: 'Zi Wei in Life Palace gives nobility, leadership, life twists but eventual success',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-ming',
    starId: 'star-tianji',
    influence_zh: '天机星入命宫，主人聪明好学，善于策划，适合智囊工作',
    influence_en: 'Tian Ji in Life Palace gives intelligence, learning ability, good at planning',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-ming',
    starId: 'star-taiyang',
    influence_zh: '太阳星入命宫，主人热情大方，追求名望，光明磊落',
    influence_en: 'Tai Yang in Life Palace gives warmth, generosity, pursuit of fame and glory',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-ming',
    starId: 'star-thief',
    influence_zh: '贪狼星入命宫，主人多才多艺，欲望心强，桃花旺盛',
    influence_en: 'Tan Lang in Life Palace gives versatile talents, strong desires, rich romance',
    strength: 'neutral',
  },
  {
    palaceId: 'palace-fortune',
    starId: 'star-wuliu',
    influence_zh: '武曲星入财帛宫，主人财运极佳，善于理财，果断执行',
    influence_en: 'Wu Qu in Wealth Palace gives excellent wealth luck and financial decisiveness',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-fortune',
    starId: 'star-tianfu',
    influence_zh: '天府星入财帛宫，主人财运稳定，善于积累，管理能力强',
    influence_en: 'Tian Fu in Wealth Palace gives stable wealth and strong management',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-fortune',
    starId: 'star-lucun',
    influence_zh: '禄存星入财帛宫，主人财运平稳，积少成多，储蓄观念强',
    influence_en: 'Lu Cun in Wealth Palace gives steady wealth, accumulation mindset',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-spouse',
    starId: 'star-thief',
    influence_zh: '贪狼星入夫妻宫，主人感情丰富，桃花旺盛，配偶有魅力',
    influence_en: 'Tan Lang in Spouse Palace gives rich emotions, strong romance, attractive partner',
    strength: 'neutral',
  },
  {
    palaceId: 'palace-spouse',
    starId: 'star-jianku',
    influence_zh: '巨门星入夫妻宫，主人口才出众，感情中多言语交流',
    influence_en: 'Ju Men in Spouse Palace gives eloquence, much verbal communication in marriage',
    strength: 'neutral',
  },
  {
    palaceId: 'palace-official',
    starId: 'star-ziwei',
    influence_zh: '紫微星入官禄宫，主人事业心强，有领导地位，仕途顺利',
    influence_en: 'Zi Wei in Career Palace gives strong ambition, leadership position, smooth career',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-official',
    starId: 'star-taiyang',
    influence_zh: '太阳星入官禄宫，主人名声远扬，适合公众事务，仕途光明',
    influence_en: 'Tai Yang in Career Palace gives widespread reputation, suitable for public affairs',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-child',
    starId: 'star-tianxiang',
    influence_zh: '天相星入子女宫，主人子女孝顺，家庭和睦，创意丰富',
    influence_en: 'Tian Xiang in Children Palace gives obedient children, harmonious family, creativity',
    strength: 'auspicious',
  },
  {
    palaceId: 'palace-health',
    starId: 'star-tianji',
    influence_zh: '天机星入疾厄宫，主人需注意肝胆健康，易有神经系统问题',
    influence_en: 'Tian Ji in Health Palace indicates liver/gallbladder and nervous system concerns',
    strength: 'neutral',
  },
  {
    palaceId: 'palace-migration',
    starId: 'star-taiyang',
    influence_zh: '太阳星入迁移宫，主人外出运势佳，光明磊落，人缘好',
    influence_en: 'Tai Yang in Migration Palace gives good travel luck and warm social interactions',
    strength: 'auspicious',
  },
];

// ─── Mingzhu Star Combinations (明主组合) ───────────────────────────────────────

export const MINGZHU_COMBINATIONS: MingzhuCombination[] = [
  {
    id: 'mingzhu-ziwei-tianji',
    star1: '紫微星',
    star2: '天机星',
    combination_zh: '紫微天机组合',
    combination_en: 'Zi Wei + Tian Ji',
    effect_zh: '智慧与权贵结合，主人聪明且有地位，适合从政或管理',
    effect_en: 'Wisdom combined with nobility — smart and prestigious, suitable for politics or management',
  },
  {
    id: 'mingzhu-ziwei-wuliu',
    star1: '紫微星',
    star2: '武曲星',
    combination_zh: '紫微武曲组合',
    combination_en: 'Zi Wei + Wu Qu',
    effect_zh: '权财双全，主人既有权势又有财运，适合金融或大型企业管理',
    effect_en: 'Power and wealth combined — suitable for finance or large corporate management',
  },
  {
    id: 'mingzhu-taiyang-tianji',
    star1: '太阳星',
    star2: '天机星',
    combination_zh: '太阳天机组合',
    combination_en: 'Tai Yang + Tian Ji',
    effect_zh: '光明智慧，主人热情且善于策划，名声与才智兼备',
    effect_en: 'Bright wisdom — warm and strategic, both famous and intelligent',
  },
  {
    id: 'mingzhu-wuliu-tianfu',
    star1: '武曲星',
    star2: '天府星',
    combination_zh: '武曲天府组合',
    combination_en: 'Wu Qu + Tian Fu',
    effect_zh: '理财高手，主人财运极佳，善于积累财富，适合投资',
    effect_en: 'Financial experts — excellent wealth luck, good at accumulating wealth, suitable for investment',
  },
  {
    id: 'mingzhu-thief-jianku',
    star1: '贪狼星',
    star2: '巨门星',
    combination_zh: '贪狼巨门组合',
    combination_en: 'Tan Lang + Ju Men',
    effect_zh: '桃花口才，主人感情丰富，能言善辩，人际能力强',
    effect_en: 'Romance and eloquence — emotionally rich, eloquent, strong interpersonal skills',
  },
  {
    id: 'mingzhu-ziwei-tianfu',
    star1: '紫微星',
    star2: '天府星',
    combination_zh: '紫微天府组合',
    combination_en: 'Zi Wei + Tian Fu',
    effect_zh: '帝王双星，主人格局大，贵气十足，有领导魅力',
    effect_en: 'Emperor double stars — grand pattern, noble aura, leadership charisma',
  },
];

// ─── Lookup Helpers ────────────────────────────────────────────────────────────

export function getPalaceMeaning(palaceId: string): PalaceMeaning | undefined {
  return PALACE_MEANINGS.find((p) => p.id === palaceId);
}

export function getStarMeaning(starId: string): StarMeaning | undefined {
  return STAR_MEANINGS.find((s) => s.id === starId);
}

export function getPalaceStarInfluence(palaceId: string): PalaceStarInfluence[] {
  return PALACE_STAR_INFLUENCE.filter((p) => p.palaceId === palaceId);
}

export function getStarGroup(groupId: string): StarGroup | undefined {
  return STAR_GROUPS.find((g) => g.id === groupId);
}

export function getMingzhuCombination(star1: string, star2: string): MingzhuCombination | undefined {
  return MINGZHU_COMBINATIONS.find(
    (m) =>
      (m.star1 === star1 && m.star2 === star2) ||
      (m.star1 === star2 && m.star2 === star1)
  );
}

// ─── Build Corpus ─────────────────────────────────────────────────────────────

export function buildZiweiCorpus(): string[] {
  const lines: string[] = [];

  for (const p of PALACE_MEANINGS) {
    lines.push(
      `Palace ${p.palace_zh} (${p.palace_en}): ${p.location_meaning_zh} | ${p.location_meaning_en}. ` +
      `Affairs: ${p.affairs_zh} | ${p.affairs_en}. ` +
      `Personality: ${p.personality_traits_zh} | ${p.personality_traits_en}. ` +
      `Career hint: ${p.career_hint_zh} | ${p.career_hint_en}.`
    );
  }

  for (const s of STAR_MEANINGS) {
    lines.push(
      `Star ${s.star_zh} (${s.star_en}): ${s.nature_zh} | ${s.nature_en}. ` +
      `Element: ${s.element_zh} (${s.element_en}). ` +
      `Keywords: ${s.keywords_zh.join(', ')} | ${s.keywords_en.join(', ')}. ` +
      `Fortune: ${s.fortune_zh} | ${s.fortune_en}.`
    );
  }

  for (const m of MINGZHU_COMBINATIONS) {
    lines.push(
      `Mingzhu ${m.combination_zh} (${m.combination_en}): ${m.effect_zh} | ${m.effect_en}.`
    );
  }

  return lines;
}
