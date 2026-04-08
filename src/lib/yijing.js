'use strict';

/**
 * Yi Jing (易经) — I Ching Hexagram Oracle.
 *
 * Generates a random hexagram using the traditional three-coins method
 * and returns the hexagram number, name, and judgment text.
 */

const HEXAGRAMS = [
  { number: 1,  name: '乾',   pinyin: 'Qián',    english: 'The Creative',                  judgment: 'Supreme success. Perseverance furthers.' },
  { number: 2,  name: '坤',   pinyin: 'Kūn',     english: 'The Receptive',                 judgment: 'Supreme success. Perseverance of a mare furthers.' },
  { number: 3,  name: '屯',   pinyin: 'Zhūn',    english: 'Difficulty at the Beginning',   judgment: 'Supreme success. Do not advance; appoint helpers.' },
  { number: 4,  name: '蒙',   pinyin: 'Méng',    english: 'Youthful Folly',                judgment: 'Success. Perseverance furthers.' },
  { number: 5,  name: '需',   pinyin: 'Xū',      english: 'Waiting',                       judgment: 'If you are sincere, you have light and success.' },
  { number: 6,  name: '讼',   pinyin: 'Sòng',    english: 'Conflict',                      judgment: 'Be sincere, but meet obstacles halfway.' },
  { number: 7,  name: '师',   pinyin: 'Shī',     english: 'The Army',                      judgment: 'The army needs perseverance and a strong man.' },
  { number: 8,  name: '比',   pinyin: 'Bǐ',      english: 'Holding Together',              judgment: 'Good fortune. Inquire of the oracle once more.' },
  { number: 9,  name: '小畜', pinyin: 'Xiǎo Chù', english: 'The Taming Power of the Small', judgment: 'Success. Dense clouds but no rain from the west.' },
  { number: 10, name: '履',   pinyin: 'Lǚ',      english: 'Treading',                      judgment: 'Treading on the tail of a tiger. It does not bite. Success.' },
  { number: 11, name: '泰',   pinyin: 'Tài',     english: 'Peace',                         judgment: 'The small departs; the great approaches. Good fortune.' },
  { number: 12, name: '否',   pinyin: 'Pǐ',      english: 'Standstill',                    judgment: 'Standstill. No perseverance furthers the inferior man.' },
  { number: 13, name: '同人', pinyin: 'Tóng Rén', english: 'Fellowship with Men',           judgment: 'Fellowship with men in the open. Success.' },
  { number: 14, name: '大有', pinyin: 'Dà Yǒu',  english: 'Possession in Great Measure',   judgment: 'Supreme success.' },
  { number: 15, name: '谦',   pinyin: 'Qiān',    english: 'Modesty',                       judgment: 'Success. The superior man carries things through.' },
  { number: 16, name: '豫',   pinyin: 'Yù',      english: 'Enthusiasm',                    judgment: 'Enthusiasm. Helpful to install helpers and set armies marching.' },
  { number: 17, name: '随',   pinyin: 'Suí',     english: 'Following',                     judgment: 'Supreme success. Perseverance furthers. No blame.' },
  { number: 18, name: '蛊',   pinyin: 'Gǔ',      english: 'Work on What Has Been Spoiled',  judgment: 'Supreme success. Before the starting point, three days; after, three days.' },
  { number: 19, name: '临',   pinyin: 'Lín',     english: 'Approach',                      judgment: 'Supreme success. Perseverance furthers. In the eighth month there will be misfortune.' },
  { number: 20, name: '观',   pinyin: 'Guān',    english: 'Contemplation',                 judgment: 'The ablution has been made but not yet the offering. Sincere devotion.' },
  { number: 21, name: '噬嗑', pinyin: 'Shì Kè',  english: 'Biting Through',                judgment: 'Success. It furthers one to let justice be administered.' },
  { number: 22, name: '贲',   pinyin: 'Bì',      english: 'Grace',                         judgment: 'Success. In small matters it is favourable to undertake something.' },
  { number: 23, name: '剥',   pinyin: 'Bō',      english: 'Splitting Apart',               judgment: 'It does not further one to go anywhere.' },
  { number: 24, name: '复',   pinyin: 'Fù',      english: 'Return',                        judgment: 'Success. Coming and going without error. Friends come without blame.' },
  { number: 25, name: '无妄', pinyin: 'Wú Wàng', english: 'Innocence',                     judgment: 'Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.' },
  { number: 26, name: '大畜', pinyin: 'Dà Chù',  english: 'The Taming Power of the Great', judgment: 'Perseverance furthers. Not eating at home brings good fortune.' },
  { number: 27, name: '颐',   pinyin: 'Yí',      english: 'The Corners of the Mouth',      judgment: 'Perseverance brings good fortune. Pay heed to the providing of nourishment.' },
  { number: 28, name: '大过', pinyin: 'Dà Guò',  english: 'Preponderance of the Great',    judgment: 'The ridgepole sags to the breaking point. It furthers one to have somewhere to go.' },
  { number: 29, name: '坎',   pinyin: 'Kǎn',     english: 'The Abysmal',                   judgment: 'If you are sincere, you have success in your heart. Action brings reward.' },
  { number: 30, name: '离',   pinyin: 'Lí',      english: 'The Clinging',                  judgment: 'Perseverance furthers. It brings success. Care of the cow brings good fortune.' },
  { number: 31, name: '咸',   pinyin: 'Xián',    english: 'Influence',                     judgment: 'Success. Perseverance furthers. Taking a maiden to wife brings good fortune.' },
  { number: 32, name: '恒',   pinyin: 'Héng',    english: 'Duration',                      judgment: 'Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.' },
  { number: 33, name: '遁',   pinyin: 'Dùn',     english: 'Retreat',                       judgment: 'Success. In what is small, perseverance furthers.' },
  { number: 34, name: '大壮', pinyin: 'Dà Zhuàng', english: 'The Power of the Great',      judgment: 'Perseverance furthers.' },
  { number: 35, name: '晋',   pinyin: 'Jìn',     english: 'Progress',                      judgment: 'The powerful prince is honoured with horses in large numbers.' },
  { number: 36, name: '明夷', pinyin: 'Míng Yí', english: 'Darkening of the Light',        judgment: 'In adversity it furthers one to be persevering.' },
  { number: 37, name: '家人', pinyin: 'Jiā Rén', english: 'The Family',                    judgment: 'Perseverance of the woman furthers.' },
  { number: 38, name: '睽',   pinyin: 'Kuí',     english: 'Opposition',                    judgment: 'In small matters, good fortune.' },
  { number: 39, name: '蹇',   pinyin: 'Jiǎn',    english: 'Obstruction',                   judgment: 'The southwest furthers. The northeast does not further. It furthers one to see the great man.' },
  { number: 40, name: '解',   pinyin: 'Xiè',     english: 'Deliverance',                   judgment: 'The southwest furthers. If there is no longer anything to be achieved, return brings good fortune.' },
  { number: 41, name: '损',   pinyin: 'Sǔn',     english: 'Decrease',                      judgment: 'Decrease combined with sincerity brings about supreme good fortune without blame.' },
  { number: 42, name: '益',   pinyin: 'Yì',      english: 'Increase',                      judgment: 'It furthers one to undertake something. It furthers one to cross the great water.' },
  { number: 43, name: '夬',   pinyin: 'Guài',    english: 'Break-through',                 judgment: 'One must resolutely make the matter known at the court of the king.' },
  { number: 44, name: '姤',   pinyin: 'Gòu',     english: 'Coming to Meet',                judgment: 'The maiden is powerful. One should not marry such a maiden.' },
  { number: 45, name: '萃',   pinyin: 'Cuì',     english: 'Gathering Together',            judgment: 'Success. The king approaches his temple. Great offerings bring good fortune.' },
  { number: 46, name: '升',   pinyin: 'Shēng',   english: 'Pushing Upward',                judgment: 'Supreme success. One must see the great man. Do not be grieved. Marching to the south brings good fortune.' },
  { number: 47, name: '困',   pinyin: 'Kùn',     english: 'Oppression',                    judgment: 'Success. Perseverance. The great man brings about good fortune. No blame.' },
  { number: 48, name: '井',   pinyin: 'Jǐng',    english: 'The Well',                      judgment: 'The town may be changed, but the well cannot be changed. Draw near to the well; the water is there.' },
  { number: 49, name: '革',   pinyin: 'Gé',      english: 'Revolution',                    judgment: 'On your own day you are believed. Supreme success. Perseverance furthers. Remorse disappears.' },
  { number: 50, name: '鼎',   pinyin: 'Dǐng',    english: 'The Cauldron',                  judgment: 'Supreme good fortune. Success.' },
  { number: 51, name: '震',   pinyin: 'Zhèn',    english: 'The Arousing (Shock)',          judgment: 'Shock brings success. When the shock comes, there is fear. Then laughter and words.' },
  { number: 52, name: '艮',   pinyin: 'Gèn',     english: 'Keeping Still, Mountain',       judgment: 'Keeping his back still so that he no longer feels his body.' },
  { number: 53, name: '渐',   pinyin: 'Jiàn',    english: 'Development (Gradual Progress)', judgment: 'The maiden is given in marriage. Good fortune. Perseverance furthers.' },
  { number: 54, name: '归妹', pinyin: 'Guī Mèi', english: 'The Marrying Maiden',           judgment: 'Undertakings bring misfortune. Nothing that would further.' },
  { number: 55, name: '丰',   pinyin: 'Fēng',    english: 'Abundance',                     judgment: 'Abundance has success. The king attains abundance. Be not sad.' },
  { number: 56, name: '旅',   pinyin: 'Lǚ',      english: 'The Wanderer',                  judgment: 'The wanderer — success through smallness. Perseverance brings good fortune.' },
  { number: 57, name: '巽',   pinyin: 'Xùn',     english: 'The Gentle (Wind)',             judgment: 'Success through what is small. It furthers one to have somewhere to go.' },
  { number: 58, name: '兑',   pinyin: 'Duì',     english: 'The Joyous, Lake',              judgment: 'Success. Perseverance is favourable.' },
  { number: 59, name: '涣',   pinyin: 'Huàn',    english: 'Dispersion (Dissolution)',      judgment: 'Success. The king approaches his temple. It furthers one to cross the great water.' },
  { number: 60, name: '节',   pinyin: 'Jié',     english: 'Limitation',                    judgment: 'Success. Galling limitation must not be persevered in.' },
  { number: 61, name: '中孚', pinyin: 'Zhōng Fú', english: 'Inner Truth',                  judgment: 'Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.' },
  { number: 62, name: '小过', pinyin: 'Xiǎo Guò', english: 'Preponderance of the Small',   judgment: 'Success. Perseverance furthers. Small things may be done; great things should not be done.' },
  { number: 63, name: '既济', pinyin: 'Jì Jì',   english: 'After Completion',              judgment: 'Success in small matters. Perseverance furthers.' },
  { number: 64, name: '未济', pinyin: 'Wèi Jì',  english: 'Before Completion',             judgment: 'Success. But if the little fox has nearly completed the crossing, it gets its tail in the water.' },
];

/**
 * Casts a hexagram using the three-coins method (pseudo-random).
 *
 * Each of the 6 lines is determined by tossing 3 coins:
 *   - 3 heads (sum 9)  → old yang  → changing line, drawn as —×—
 *   - 2 heads (sum 8)  → young yin  → yin line, drawn as — —
 *   - 2 tails (sum 7)  → young yang → yang line, drawn as ———
 *   - 3 tails (sum 6)  → old yin   → changing line, drawn as —o—
 *
 * The hexagram number is derived from the six lines:
 * - Lines 1-3 (bottom) form the lower trigram; lines 4-6 (top) the upper.
 * - Yang lines (7 or 9) = 1, Yin lines (6 or 8) = 0.
 * - The 64 hexagrams are indexed by (upperTrigram * 8 + lowerTrigram).
 *
 * @returns {{ hexagram: object, lines: number[], hasChangingLines: boolean }}
 */
function castHexagram() {
  const lines = Array.from({ length: 6 }, () => {
    const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 3 : 2));
    return coins.reduce((sum, c) => sum + c, 0); // 6, 7, 8, or 9
  });

  // Convert lines to binary (yang=1, yin=0) and derive trigrams
  const binary = lines.map(l => (l === 7 || l === 9) ? 1 : 0);
  const lowerTrigram = binary[0] + binary[1] * 2 + binary[2] * 4;
  const upperTrigram = binary[3] + binary[4] * 2 + binary[5] * 4;

  // King Wen sequence mapping: trigram pair → hexagram number
  const kingWenMap = [
    [2, 24, 7, 19, 15, 36, 46, 11],
    [23, 2, 8, 20, 16, 35, 45, 12],
    [8, 23, 29, 4, 39, 64, 47, 6],
    [20, 42, 59, 4, 56, 50, 28, 32],
    [16, 51, 40, 62, 54, 55, 32, 34],
    [36, 21, 64, 50, 55, 30, 28, 14],
    [45, 17, 47, 28, 31, 49, 58, 43],
    [11, 25, 6, 33, 10, 13, 44, 1],
  ];

  const hexagramNumber = kingWenMap[upperTrigram][lowerTrigram];
  const hexagram = getHexagramByNumber(hexagramNumber);
  const hasChangingLines = lines.some(l => l === 6 || l === 9);

  return { hexagram, lines, hasChangingLines };
}

/**
 * Returns a hexagram by its traditional number (1–64).
 *
 * @param {number} number - Hexagram number
 * @returns {object|null}
 */
function getHexagramByNumber(number) {
  return HEXAGRAMS.find(h => h.number === number) || null;
}

module.exports = { castHexagram, getHexagramByNumber, HEXAGRAMS };
