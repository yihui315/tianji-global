/**
 * Name Numerology Engine — TianJi Global
 * Pythagorean numerology system for Life Path, Destiny, and Soul Urge numbers
 */

// ─── Letter Values (Pythagorean) ─────────────────────────────────────────────
const PYTHAGOREAN_TABLE: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
  // Chinese pinyin mappings (A-Z equivalent)
  // Non-alphabet chars ignored
};

// ─── Master Numbers ───────────────────────────────────────────────────────────
const MASTER_NUMBERS = new Set([11, 22, 33, 44]); // 44 is sometimes included

// ─── Core Reduction ───────────────────────────────────────────────────────────
/**
 * Reduces a number by summing digits until a single digit or master number.
 * @example reduceNumber(28) → 10 → 1
 * @example reduceNumber(11) → 11 (master)
 */
export function reduceNumber(n: number): number {
  if (n <= 0) return n;
  if (MASTER_NUMBERS.has(n) && n < 100) return n; // keep master numbers as-is

  const sum = digitSum(n);
  if (sum < 10) return sum;
  return reduceNumber(sum);
}

/** Sum the digits of a non-negative integer */
export function digitSum(n: number): number {
  return String(n)
    .split('')
    .map(Number)
    .reduce((acc, d) => acc + d, 0);
}

// ─── Name Processing ──────────────────────────────────────────────────────────
/** Convert name to uppercase and strip non-alphabetic characters */
function normalizeName(name: string): string {
  return name.toUpperCase().replace(/[^A-Z]/g, '');
}

// ─── Life Path Number ─────────────────────────────────────────────────────────
export interface LifePathResult {
  number: number;
  isMaster: boolean;
  title: string;
  titleChinese: string;
  description: string;
  descriptionChinese: string;
  traits: string[];
  traitsChinese: string[];
}

const LIFE_PATH_DATA: Record<number, { title: string; titleChinese: string; description: string; descriptionChinese: string; traits: string[]; traitsChinese: string[] }> = {
  1:  { title: 'The Leader', titleChinese: '领袖', description: 'Independent, innovative, and pioneering. You forge your own path.', descriptionChinese: '独立、创新、先驱。你开辟自己的道路。', traits: ['Independent', 'Creative', 'Pioneering', 'Brave'], traitsChinese: ['独立', '创意', '先驱', '勇敢'] },
  2:  { title: 'The Peacemaker', titleChinese: '和平者', description: 'Cooperative, diplomatic, and sensitive. You thrive in partnerships.', descriptionChinese: '合作、外交、敏感。你在伙伴关系中茁壮成长。', traits: ['Cooperative', 'Diplomatic', 'Sensitive', 'Mediator'], traitsChinese: ['合作', '外交', '敏感', '调解者'] },
  3:  { title: 'The Communicator', titleChinese: '沟通者', description: 'Expressive, artistic, and social. Your creativity inspires others.', descriptionChinese: '表达、艺术、社交。你的创造力激励他人。', traits: ['Expressive', 'Artistic', 'Social', 'Optimistic'], traitsChinese: ['表达', '艺术', '社交', '乐观'] },
  4:  { title: 'The Builder', titleChinese: '建设者', description: 'Practical, hardworking, and stable. You create lasting foundations.', descriptionChinese: '务实、勤奋、稳定。你创造持久的基础。', traits: ['Practical', 'Hardworking', 'Stable', 'Organized'], traitsChinese: ['务实', '勤奋', '稳定', '有条理'] },
  5:  { title: 'The Adventurer', titleChinese: '冒险家', description: 'Freedom-loving, versatile, and curious. You embrace change.', descriptionChinese: '热爱自由、多才多艺、好奇。你拥抱变化。', traits: ['Freedom-loving', 'Versatile', 'Curious', 'Adaptable'], traitsChinese: ['热爱自由', '多才多艺', '好奇', '适应性强'] },
  6:  { title: 'The Nurturer', titleChinese: '养育者', description: 'Responsible, caring, and harmonious. You nurture those around you.', descriptionChinese: '负责、关爱、和谐。你养育周围的人。', traits: ['Responsible', 'Caring', 'Harmonious', 'Compassionate'], traitsChinese: ['负责', '关爱', '和谐', '富有同情心'] },
  7:  { title: 'The Seeker', titleChinese: '探索者', description: 'Analytical, spiritual, and introspective. You seek deeper truths.', descriptionChinese: '分析、精神、内省。你寻求更深层的真理。', traits: ['Analytical', 'Spiritual', 'Introspective', 'Perceptive'], traitsChinese: ['分析', '精神', '内省', '敏锐'] },
  8:  { title: 'The Achiever', titleChinese: '成就者', description: 'Ambitious, authoritative, and material-wise. You achieve worldly success.', descriptionChinese: '雄心勃勃、权威、物质。你取得世俗成功。', traits: ['Ambitious', 'Authoritative', 'Material-wise', 'Resilient'], traitsChinese: ['雄心勃勃', '权威', '物质', '适应力强'] },
  9:  { title: 'The Humanitarian', titleChinese: '人道主义者', description: 'Compassionate, wise, and selfless. You serve the greater good.', descriptionChinese: '富有同情心、智慧、无私。你服务更大的利益。', traits: ['Compassionate', 'Wise', 'Selfless', 'Idealistic'], traitsChinese: ['富有同情心', '智慧', '无私', '理想主义'] },
  11: { title: 'The Visionary', titleChinese: '梦想家', description: 'Intuitive, visionary, and inspiratonal. You carry a powerful spiritual message.', descriptionChinese: '直觉、愿景、鼓舞人心。你承载着强大的精神信息。', traits: ['Intuitive', 'Visionary', 'Inspirational', 'Sensitive'], traitsChinese: ['直觉', '愿景', '鼓舞人心', '敏感'] },
  22: { title: 'The Master Builder', titleChinese: '大师建设者', description: 'Practical master builder with the ability to realize grand visions.', descriptionChinese: '务实的大师建设者，有能力实现宏伟愿景。', traits: ['Practical', 'Visionary', 'Disciplined', 'Powerful'], traitsChinese: ['务实', '有远见', '自律', '强大'] },
  33: { title: 'The Master Teacher', titleChinese: '大师导师', description: 'Selfless, spiritual teacher who inspires through unconditional love.', descriptionChinese: '无私的精神导师，通过无条件的爱激励他人。', traits: ['Selfless', 'Spiritual', 'Inspiring', 'Compassionate'], traitsChinese: ['无私', '精神', '激励', '富有同情心'] },
};

/**
 * Calculate Life Path Number from birthdate string (YYYY-MM-DD or MM/DD/YYYY)
 */
export function calculateLifePath(birthdate: string): LifePathResult {
  // Remove all non-digit characters
  const digits = birthdate.replace(/\D/g, '');

  if (digits.length < 8) {
    throw new Error('Invalid birthdate: need at least 8 digits (YYYYMMDD)');
  }

  // Sum all digits, then reduce
  const sum = digits.split('').map(Number).reduce((acc, d) => acc + d, 0);
  const number = reduceNumber(sum);
  const isMaster = MASTER_NUMBERS.has(number);

  const data = LIFE_PATH_DATA[number] || LIFE_PATH_DATA[9];

  return {
    number,
    isMaster,
    title: data.title,
    titleChinese: data.titleChinese,
    description: data.description,
    descriptionChinese: data.descriptionChinese,
    traits: data.traits,
    traitsChinese: data.traitsChinese,
  };
}

// ─── Destiny Number (Expression) ──────────────────────────────────────────────
export interface DestinyResult {
  number: number;
  isMaster: boolean;
  title: string;
  titleChinese: string;
  description: string;
  descriptionChinese: string;
  expressionNumber: number;
  expressionNumberReduced: number;
  nameValue: number;
}

const DESTINY_DATA: Record<number, { title: string; titleChinese: string; description: string; descriptionChinese: string }> = {
  1:  { title: 'The Individual', titleChinese: '个体', description: 'Your name gives you a strong sense of self and the power to achieve your goals.', descriptionChinese: '你的名字赋予你强烈的自我意识和实现目标的力量。' },
  2:  { title: 'The Diplomat', titleChinese: '外交官', description: 'Your name emphasizes partnership, cooperation, and sensitivity to others.', descriptionChinese: '你的名字强调伙伴关系、合作和对他人的敏感。' },
  3:  { title: 'The Creative Soul', titleChinese: '创意灵魂', description: 'Your name vibrates with creative energy, expressiveness, and social charm.', descriptionChinese: '你的名字充满创意能量、表现力和社交魅力。' },
  4:  { title: 'The Practical One', titleChinese: '务实者', description: 'Your name indicates a grounded, hardworking nature with a talent for building systems.', descriptionChinese: '你的名字表明你脚踏实地、勤奋刻苦，并有建立系统的才能。' },
  5:  { title: 'The Freedom Seeker', titleChinese: '自由追求者', description: 'Your name carries the vibration of freedom, change, and versatile experiences.', descriptionChinese: '你的名字带有自由、变化和多变经历的振动。' },
  6:  { title: 'The Responsible One', titleChinese: '负责者', description: 'Your name resonates with responsibility, family, and community harmony.', descriptionChinese: '你的名字与责任、家庭和社区和谐产生共鸣。' },
  7:  { title: 'The Seeker of Truth', titleChinese: '真理追求者', description: 'Your name carries a deep analytical energy and a quest for spiritual knowledge.', descriptionChinese: '你的名字带有深刻的分析能量和对精神知识的追求。' },
  8:  { title: 'The Authority Figure', titleChinese: '权威人物', description: 'Your name vibrates with power, ambition, and mastery over material realities.', descriptionChinese: '你的名字在权力、雄心和物质现实掌控方面产生振动。' },
  9:  { title: 'The Humanitarian', titleChinese: '人道主义者', description: 'Your name carries the energy of compassion, wisdom, and selfless service.', descriptionChinese: '你的名字带有同情心、智慧和无私服务的能量。' },
  11: { title: 'The Visionary', titleChinese: '愿景者', description: 'Your name endows you with exceptional intuition and spiritual sensitivity.', descriptionChinese: '你的名字赋予你非凡的直觉和精神敏感性。' },
  22: { title: 'The Master Planner', titleChinese: '大师规划者', description: 'Your name holds the potential for great achievement on a grand scale.', descriptionChinese: '你的名字拥有在更大规模上取得伟大成就的潜力。' },
  33: { title: 'The Master Teacher', titleChinese: '大师导师', description: 'Your name vibrates with selfless service and spiritual inspiration.', descriptionChinese: '你的名字在无私服务和精神激励方面产生振动。' },
};

/**
 * Calculate Destiny Number (Expression) from a full name
 */
export function calculateDestiny(fullName: string): DestinyResult {
  const clean = normalizeName(fullName);

  if (clean.length === 0) {
    throw new Error('Invalid name: no alphabetic characters found');
  }

  // Sum letter values
  const nameValue = clean
    .split('')
    .map(char => PYTHAGOREAN_TABLE[char] || 0)
    .reduce((acc, val) => acc + val, 0);

  const expressionNumber = nameValue;
  const number = reduceNumber(nameValue);
  const isMaster = MASTER_NUMBERS.has(number);

  const data = DESTINY_DATA[number] || DESTINY_DATA[9];

  return {
    number,
    isMaster,
    title: data.title,
    titleChinese: data.titleChinese,
    description: data.description,
    descriptionChinese: data.descriptionChinese,
    expressionNumber,
    expressionNumberReduced: number,
    nameValue,
  };
}

// ─── Soul Urge Number (Heart's Desire) ──────────────────────────────────────
export interface SoulUrgeResult {
  number: number;
  isMaster: boolean;
  title: string;
  titleChinese: string;
  description: string;
  descriptionChinese: string;
  vowelValue: number;
  vowels: string[];
}

const SOUL_URGE_DATA: Record<number, { title: string; titleChinese: string; description: string; descriptionChinese: string }> = {
  1:  { title: 'Inner Need for Independence', titleChinese: '内心对独立的需求', description: 'Your inner self craves independence, leadership, and self-expression.', descriptionChinese: '你的内心渴望独立、领导力和自我表达。' },
  2:  { title: 'Inner Need for Harmony', titleChinese: '内心对和谐的需求', description: 'Your heart desires partnership, cooperation, and peaceful relationships.', descriptionChinese: '你的内心渴望伙伴关系、合作与和平的人际关系。' },
  3:  { title: 'Inner Need for Creativity', titleChinese: '内心对创造力的需求', description: 'Your soul yearns for self-expression, joy, and creative pursuits.', descriptionChinese: '你的灵魂渴望自我表达、快乐和创造性追求。' },
  4:  { title: 'Inner Need for Stability', titleChinese: '内心对稳定的需求', description: 'Your inner self seeks a solid foundation through hard work and practicality.', descriptionChinese: '你的内心通过努力工作和务实寻求坚实的基础。' },
  5:  { title: 'Inner Need for Freedom', titleChinese: '内心对自由的需求', description: 'Your heart craves freedom, adventure, and varied experiences.', descriptionChinese: '你的内心渴望自由、冒险和多样的体验。' },
  6:  { title: 'Inner Need for Love & Responsibility', titleChinese: '内心对爱与责任的需求', description: 'Your soul desires to nurture, take responsibility, and create harmony in the home.', descriptionChinese: '你的灵魂渴望养育、承担责任并在家庭中创造和谐。' },
  7:  { title: 'Inner Need for Truth & Wisdom', titleChinese: '内心对真理与智慧的需求', description: 'Your inner self seeks knowledge, solitude, and spiritual understanding.', descriptionChinese: '你的内心寻求知识、独处和精神理解。' },
  8:  { title: 'Inner Need for Power & Achievement', titleChinese: '内心对权力与成就的需求', description: 'Your heart desires material success, authority, and recognition.', descriptionChinese: '你的内心渴望物质成功、权威和认可。' },
  9:  { title: 'Inner Need for Universal Love', titleChinese: '内心对宇宙之爱的需求', description: 'Your soul yearns to give and receive unconditional love, and to serve humanity.', descriptionChinese: '你的灵魂渴望给予和接受无条件的爱，并服务人类。' },
  11: { title: 'Inner Need for Spiritual Insight', titleChinese: '内心对精神洞察的需求', description: 'Your soul is drawn to spiritual enlightenment and inspiring others.', descriptionChinese: '你的灵魂被精神启蒙和激励他人所吸引。' },
  22: { title: 'Inner Need for Mastery', titleChinese: '内心对掌控的需求', description: 'Your inner self seeks to master the material world through grand visions.', descriptionChinese: '你的内心渴望通过宏伟愿景掌控物质世界。' },
  33: { title: 'Inner Need for Spiritual Teaching', titleChinese: '内心对精神教导的需求', description: 'Your soul is driven to teach and uplift humanity through spiritual principles.', descriptionChinese: '你的灵魂被通过精神原则教导和提升人类所驱动。' },
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

/**
 * Calculate Soul Urge Number (Heart's Desire) from a full name
 */
export function calculateSoulUrge(fullName: string): SoulUrgeResult {
  const clean = normalizeName(fullName);

  if (clean.length === 0) {
    throw new Error('Invalid name: no alphabetic characters found');
  }

  // Extract vowels
  const vowels = clean.split('').filter(char => VOWELS.has(char));

  // Sum vowel values
  const vowelValue = vowels
    .map(char => PYTHAGOREAN_TABLE[char] || 0)
    .reduce((acc, val) => acc + val, 0);

  const number = reduceNumber(vowelValue);
  const isMaster = MASTER_NUMBERS.has(number);

  const data = SOUL_URGE_DATA[number] || SOUL_URGE_DATA[9];

  return {
    number,
    isMaster,
    title: data.title,
    titleChinese: data.titleChinese,
    description: data.description,
    descriptionChinese: data.descriptionChinese,
    vowelValue,
    vowels,
  };
}

// ─── Full Reading ─────────────────────────────────────────────────────────────
export interface NumerologyReading {
  name: string;
  birthdate: string;
  lifePath: LifePathResult;
  destiny: DestinyResult;
  soulUrge: SoulUrgeResult;
  personalityNumber: number;
  maturityNumber: number;
  lifePathDescription: string;
  destinyDescription: string;
  soulUrgeDescription: string;
  compatibility: string[];
  compatibilityChinese: string[];
  luckyNumbers: number[];
  luckyDays: string[];
  luckyDaysChinese: string[];
  rulingPlanet: string;
  rulingPlanetChinese: string;
  element: string;
  elementChinese: string;
}

const RULING_PLANETS: Record<number, { planet: string; planetChinese: string }> = {
  1: { planet: 'Sun', planetChinese: '太阳' },
  2: { planet: 'Moon', planetChinese: '月亮' },
  3: { planet: 'Jupiter', planetChinese: '木星' },
  4: { planet: 'Uranus', planetChinese: '天王星' },
  5: { planet: 'Mercury', planetChinese: '水星' },
  6: { planet: 'Venus', planetChinese: '金星' },
  7: { planet: 'Neptune', planetChinese: '海王星' },
  8: { planet: 'Saturn', planetChinese: '土星' },
  9: { planet: 'Mars', planetChinese: '火星' },
  11: { planet: 'Pluto', planetChinese: '冥王星' },
  22: { planet: 'Venus + Saturn', planetChinese: '金星+土星' },
  33: { planet: 'Neptune + Venus', planetChinese: '海王星+金星' },
};

const ELEMENTS: Record<number, { element: string; elementChinese: string }> = {
  1: { element: 'Fire', elementChinese: '火' },
  2: { element: 'Water', elementChinese: '水' },
  3: { element: 'Fire', elementChinese: '火' },
  4: { element: 'Earth', elementChinese: '土' },
  5: { element: 'Air', elementChinese: '风' },
  6: { element: 'Earth', elementChinese: '土' },
  7: { element: 'Water', elementChinese: '水' },
  8: { element: 'Earth', elementChinese: '土' },
  9: { element: 'Fire', elementChinese: '火' },
  11: { element: 'Air', elementChinese: '风' },
  22: { element: 'Earth', elementChinese: '土' },
  33: { element: 'Fire', elementChinese: '火' },
};

const COMPATIBILITY: Record<number, { signs: string[]; signsChinese: string[] }> = {
  1:  { signs: ['1', '3', '5', '7', '9'], signsChinese: ['1号', '3号', '5号', '7号', '9号'] },
  2:  { signs: ['2', '4', '6', '8'], signsChinese: ['2号', '4号', '6号', '8号'] },
  3:  { signs: ['1', '3', '5', '9'], signsChinese: ['3号', '1号', '5号', '9号'] },
  4:  { signs: ['2', '4', '6', '8'], signsChinese: ['4号', '2号', '6号', '8号'] },
  5:  { signs: ['1', '3', '5', '7', '9'], signsChinese: ['5号', '1号', '3号', '7号', '9号'] },
  6:  { signs: ['2', '4', '6', '8'], signsChinese: ['6号', '2号', '4号', '8号'] },
  7:  { signs: ['1', '3', '7', '9'], signsChinese: ['7号', '1号', '3号', '9号'] },
  8:  { signs: ['2', '4', '6', '8'], signsChinese: ['8号', '2号', '4号', '6号'] },
  9:  { signs: ['1', '3', '5', '7', '9'], signsChinese: ['9号', '1号', '3号', '5号', '7号'] },
  11: { signs: ['2', '4', '6', '8', '11', '33'], signsChinese: ['11号', '2号', '4号', '6号', '8号', '33号'] },
  22: { signs: ['2', '4', '6', '8', '22'], signsChinese: ['22号', '2号', '4号', '6号', '8号'] },
  33: { signs: ['2', '4', '6', '8', '33'], signsChinese: ['33号', '2号', '4号', '6号', '8号'] },
};

const LUCKY_DAYS: Record<number, { days: string[]; daysChinese: string[] }> = {
  1:  { days: ['Sunday', 'Monday'], daysChinese: ['周日', '周一'] },
  2:  { days: ['Monday', 'Thursday'], daysChinese: ['周一', '周四'] },
  3:  { days: ['Thursday', 'Friday'], daysChinese: ['周四', '周五'] },
  4:  { days: ['Monday', 'Friday'], daysChinese: ['周一', '周五'] },
  5:  { days: ['Wednesday', 'Friday'], daysChinese: ['周三', '周五'] },
  6:  { days: ['Friday', 'Saturday'], daysChinese: ['周五', '周六'] },
  7:  { days: ['Sunday', 'Monday'], daysChinese: ['周日', '周一'] },
  8:  { days: ['Saturday', 'Monday'], daysChinese: ['周六', '周一'] },
  9:  { days: ['Tuesday', 'Friday'], daysChinese: ['周二', '周五'] },
  11: { days: ['Monday', 'Thursday'], daysChinese: ['周一', '周四'] },
  22: { days: ['Monday', 'Friday'], daysChinese: ['周一', '周五'] },
  33: { days: ['Friday', 'Saturday'], daysChinese: ['周五', '周六'] },
};

/**
 * Full numerology reading combining all three core numbers
 */
export function calculateFullReading(name: string, birthdate: string): NumerologyReading {
  const lifePath = calculateLifePath(birthdate);
  const destiny = calculateDestiny(name);
  const soulUrge = calculateSoulUrge(name);

  // Personality number (consonants only, simplified)
  const clean = normalizeName(name);
  const consonants = clean.split('').filter(char => !VOWELS.has(char));
  const personalityNumber = consonants.length > 0
    ? reduceNumber(consonants.map(c => PYTHAGOREAN_TABLE[c] || 0).reduce((a, v) => a + v, 0))
    : 0;

  // Maturity number (Life Path + Destiny, reduced)
  const maturityNumber = reduceNumber(lifePath.number + destiny.number);

  const compat = COMPATIBILITY[lifePath.number] || COMPATIBILITY[9];
  const planet = RULING_PLANETS[lifePath.number] || RULING_PLANETS[9];
  const elem = ELEMENTS[lifePath.number] || ELEMENTS[9];
  const luckyDay = LUCKY_DAYS[lifePath.number] || LUCKY_DAYS[9];

  return {
    name,
    birthdate,
    lifePath,
    destiny,
    soulUrge,
    personalityNumber,
    maturityNumber,
    lifePathDescription: `${lifePath.title}: ${lifePath.description}`,
    destinyDescription: `${destiny.title}: ${destiny.description}`,
    soulUrgeDescription: `${soulUrge.title}: ${soulUrge.description}`,
    compatibility: compat.signs,
    compatibilityChinese: compat.signsChinese,
    luckyNumbers: generateLuckyNumbers(lifePath.number),
    luckyDays: luckyDay.days,
    luckyDaysChinese: luckyDay.daysChinese,
    rulingPlanet: planet.planet,
    rulingPlanetChinese: planet.planetChinese,
    element: elem.element,
    elementChinese: elem.elementChinese,
  };
}

function generateLuckyNumbers(base: number): number[] {
  const baseNum = base < 10 ? base : Number(String(base)[0]);
  return [base, base + 9, base * 2, (base * 2) + 9].filter(n => n <= 99).slice(0, 4);
}

// ─── API Types ────────────────────────────────────────────────────────────────
export interface NumerologyRequest {
  name: string;
  birthdate: string;
  language?: 'en' | 'zh';
}

// Re-exported above via interface declarations
