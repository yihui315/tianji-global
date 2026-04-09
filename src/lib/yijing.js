'use strict';

/**
 * Yi Jing (易经) — I Ching Hexagram Oracle.
 *
 * Enhanced version with complete hexagram data including:
 * - Image text (象辞)
 * - Trigrams (上卦/下卦)
 * - Changing line meanings (爻辞)
 */

/**
 * @type {Record<number, { name: string; english: string; symbol: string }>}
 */
const TRIGRAMS = {
  1: { name: '乾', english: 'Heaven', symbol: '☰' },
  2: { name: '坤', english: 'Earth',  symbol: '☷' },
  3: { name: '震', english: 'Thunder',symbol: '☳' },
  4: { name: '巽', english: 'Wind',   symbol: '☴' },
  5: { name: '坎', english: 'Water',   symbol: '☵' },
  6: { name: '离', english: 'Fire',    symbol: '☲' },
  7: { name: '艮', english: 'Mountain',symbol: '☶' },
  8: { name: '兑', english: 'Lake',    symbol: '☱' },
};

const HEXAGRAMS = [
  { number: 1,  name: '乾',   pinyin: 'Qián',     english: 'The Creative',                  judgment: 'Supreme success. Perseverance furthers.',   judgmentZh: '元亨利贞',                    image: 'Heaven repeats and repeats. The sage studies the signs of heaven and follows the ways of heaven.', imageZh: '天行健，君子以自强不息。', above: 1, below: 1 },
  { number: 2,  name: '坤',   pinyin: 'Kūn',      english: 'The Receptive',                judgment: 'Supreme success. Perseverance of a mare furthers.', judgmentZh: '元亨利牝马之贞',            image: 'Earth receives heaven. The sage follows the great patterns of earth.', imageZh: '地势坤，君子以厚德载物。', above: 2, below: 2 },
  { number: 3,  name: '屯',   pinyin: 'Zhūn',     english: 'Difficulty at the Beginning',  judgment: 'Supreme success. Do not advance; appoint helpers.', judgmentZh: '元亨利贞，勿用有攸往',      image: 'Thunder stops in the earth. A seed sprouts in darkness.', imageZh: '云雷屯，君子以经纶。', above: 5, below: 3 },
  { number: 4,  name: '蒙',   pinyin: 'Méng',     english: 'Youthful Folly',               judgment: 'Success. Perseverance furthers.',             judgmentZh: '亨，匪我求童蒙，童蒙求我',   image: 'A mountain springs forth from the earth. The superior person educates but does not speak.', imageZh: '山下出泉，蒙。君子以果行育德。', above: 7, below: 2 },
  { number: 5,  name: '需',   pinyin: 'Xū',       english: 'Waiting',                      judgment: 'If you are sincere, you have light and success.', judgmentZh: '有孚，光亨贞吉',              image: 'Clouds rise over heaven. The superior person dines but does not act hastily.', imageZh: '云上于天，需。君子以饮食宴乐。', above: 1, below: 5 },
  { number: 6,  name: '讼',   pinyin: 'Sòng',     english: 'Conflict',                      judgment: 'Be sincere, but meet obstacles halfway.',       judgmentZh: '有孚窒惕，中吉，终凶',       image: 'Heaven and water go opposite directions. Disputes arise.', imageZh: '天与水违行，讼。君子以作事谋始。', above: 5, below: 1 },
  { number: 7,  name: '师',   pinyin: 'Shī',      english: 'The Army',                     judgment: 'The army needs perseverance and a strong man.', judgmentZh: '贞丈人吉，无咎',              image: 'Water is stored in the earth. An army finds its strength in the ground.', imageZh: '地中有水，师。君子以容民畜众。', above: 5, below: 2 },
  { number: 8,  name: '比',    pinyin: 'Bǐ',       english: 'Holding Together',             judgment: 'Good fortune. Inquire of the oracle once more.', judgmentZh: '吉，原筮，元永贞，无咎',       image: 'Water rests on the earth. All things come together in harmony.', imageZh: '地上有水，比。先王以建万国，亲诸侯。', above: 2, below: 5 },
  { number: 9,  name: '小畜', pinyin: 'Xiǎo Chù',  english: 'The Taming Power of the Small', judgment: 'Success. Dense clouds but no rain from the west.', judgmentZh: '亨，密云不雨，自我西郊',       image: 'Wind moves beneath heaven. The superior person orders his thoughts and words.', imageZh: '风行天上，小畜。君子以懿文德。', above: 1, below: 4 },
  { number: 10, name: '履',   pinyin: 'Lǚ',        english: 'Treading',                     judgment: 'Treading on the tail of a tiger. It does not bite. Success.', judgmentZh: '履虎尾，不咥人，亨',           image: 'Heaven above, lake below. The superior person distinguishes high and low.', imageZh: '上天下泽，履。君子以辩上下，定民志。', above: 4, below: 1 },
  { number: 11, name: '泰',   pinyin: 'Tài',       english: 'Peace',                        judgment: 'The small departs; the great approaches. Good fortune.', judgmentZh: '小往大来，吉亨',              image: 'Heaven and earth mingle. All things flourish.', imageZh: '天地交，泰。后以财成天地之道，辅相天地之宜。', above: 2, below: 1 },
  { number: 12, name: '否',   pinyin: 'Pǐ',        english: 'Standstill',                   judgment: 'Standstill. No perseverance furthers the inferior man.', judgmentZh: '否之匪人，不利君子贞，大往小来', image: 'Heaven and earth do not mingle. The inferior man flourishes.', imageZh: '天地不交，否。君子以俭德辟难，不可荣以禄。', above: 1, below: 2 },
  { number: 13, name: '同人', pinyin: 'Tóng Rén',  english: 'Fellowship with Men',          judgment: 'Fellowship with men in the open. Success.',     judgmentZh: '同人于野，亨，利涉大川，利君子贞', image: 'Fire rises to heaven. The superior person dispenses light to all.', imageZh: '天与火，同人。君子以类族辨物。', above: 6, below: 1 },
  { number: 14, name: '大有', pinyin: 'Dà Yǒu',    english: 'Possession in Great Measure',  judgment: 'Supreme success.',                              judgmentZh: '元亨',                          image: 'Fire blazes in heaven. All things are possessed by heaven.', imageZh: '火在天上，大有。君子以遏恶扬善，顺天休命。', above: 1, below: 6 },
  { number: 15, name: '谦',   pinyin: 'Qiān',      english: 'Modesty',                      judgment: 'Success. The superior man carries things through.', judgmentZh: '亨，君子有终',                 image: 'Mountain rises beneath the earth. The superior man reduces the great to the small.', imageZh: '地中有山，谦。君子以裒多益寡，称物平施。', above: 7, below: 2 },
  { number: 16, name: '豫',   pinyin: 'Yù',        english: 'Enthusiasm',                   judgment: 'Enthusiasm. Helpful to install helpers and set armies marching.', judgmentZh: '利建侯行师',                 image: 'Thunder emerges from the earth. The sage inspires armies to follow.', imageZh: '雷出地奋，豫。先王以作乐崇德，殷荐之上帝，以配祖考。', above: 3, below: 2 },
  { number: 17, name: '随',   pinyin: 'Suí',       english: 'Following',                    judgment: 'Supreme success. Perseverance furthers. No blame.', judgmentZh: '元亨利贞，无咎',               image: 'Thunder is within the lake. The superior person acts at the right time.', imageZh: '泽中有雷，随。君子以向晦入宴息。', above: 8, below: 3 },
  { number: 18, name: '蛊',   pinyin: 'Gǔ',        english: 'Work on What Has Been Spoiled', judgment: 'Supreme success. Before the starting point, three days; after, three days.', judgmentZh: '元亨利贞涉大川',           image: 'Wind blows beneath the mountain. The superior person stirs the people to work.', imageZh: '山下有风，蛊。君子以振民育德。', above: 4, below: 7 },
  { number: 19, name: '临',   pinyin: 'Lín',       english: 'Approach',                     judgment: 'Supreme success. Perseverance furthers. In the eighth month there will be misfortune.', judgmentZh: '元亨利贞，至于八月有凶',   image: 'Lakes rise to dominate the earth. The superior man rules with broad view.', imageZh: '泽上有地，临。君子以教思无穷，容保民无疆。', above: 8, below: 2 },
  { number: 20, name: '观',   pinyin: 'Guān',      english: 'Contemplation',                judgment: 'The ablution has been made but not yet the offering. Sincere devotion.', judgmentZh: '盥而不荐，有孚颙若',         image: 'Wind blows over the earth. The superior man examines his character.', imageZh: '风行地上，观。先王以省方观民设教。', above: 4, below: 2 },
  { number: 21, name: '噬嗑', pinyin: 'Shì Kè',    english: 'Biting Through',               judgment: 'Success. It furthers one to let justice be administered.', judgmentZh: '亨，利用狱',                   image: 'Thunder and lightning unite. Justice is administered.', imageZh: '雷电噬嗑。先王以明罚敕法。', above: 3, below: 6 },
  { number: 22, name: '贲',   pinyin: 'Bì',        english: 'Grace',                        judgment: 'Success. In small matters it is favourable to undertake something.', judgmentZh: '亨，小利有攸往',             image: 'Mountain stands beneath fire. The superior person clarifies writing and adorns virtue.', imageZh: '山下有火，贲。君子以明庶政，无敢折狱。', above: 6, below: 7 },
  { number: 23, name: '剥',   pinyin: 'Bō',        english: 'Splitting Apart',              judgment: 'It does not further one to go anywhere.',       judgmentZh: '不利有攸往',                  image: 'The mountain rests on the earth. The inferior rises and advance.', imageZh: '山附地上，剥。上以厚下安宅。', above: 7, below: 2 },
  { number: 24, name: '复',   pinyin: 'Fù',        english: 'Return',                       judgment: 'Success. Coming and going without error. Friends come without blame.', judgmentZh: '亨，出入无疾，朋来无咎，反复其道，七日来复', image: 'Thunder moves beneath the earth. The cycle of return is fulfilled.', imageZh: '雷在地中，复。先王以至日闭关，商旅不行，后不省方。', above: 3, below: 2 },
  { number: 25, name: '无妄', pinyin: 'Wú Wàng',   english: 'Innocence',                    judgment: 'Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.', judgmentZh: '元亨利贞，其匪正有眚，不利有攸往', image: 'Thunder and heaven move together. True innocence brings great success.', imageZh: '天下雷行，物与无妄。先王以茂对时，育万物。', above: 1, below: 3 },
  { number: 26, name: '大畜', pinyin: 'Dà Chù',    english: 'The Taming Power of the Great', judgment: 'Perseverance furthers. Not eating at home brings good fortune.', judgmentZh: '利贞，不家食吉，利涉大川',   image: 'Mountain rises to heaven. The superior person stores knowledge and restrains the self.', imageZh: '天在山中，大畜。君子以多识前言往行，以畜其德。', above: 7, below: 1 },
  { number: 27, name: '颐',   pinyin: 'Yí',        english: 'The Corners of the Mouth',    judgment: 'Perseverance brings good fortune. Pay heed to the providing of nourishment.', judgmentZh: '贞吉，观颐，自求口实',         image: 'Thunder rumbles beneath the mountain. Nourishment comes from below.', imageZh: '山下有雷，颐。君子以慎言语，节饮食。', above: 7, below: 3 },
  { number: 28, name: '大过', pinyin: 'Dà Guò',    english: 'Preponderance of the Great',   judgment: 'The ridgepole sags to the breaking point. It furthers one to have somewhere to go.', judgmentZh: '栋桡，利有攸往，亨',         image: 'The lake rises above the tree. Great excess requires great virtue.', imageZh: '泽灭木，大过。君子以独立不惧，遁世无闷。', above: 8, below: 4 },
  { number: 29, name: '坎',   pinyin: 'Kǎn',       english: 'The Abysmal',                 judgment: 'If you are sincere, you have success in your heart. Action brings reward.', judgmentZh: '习坎，有孚，维心亨，行有尚',  image: 'Water flows continuously. The sage teaches without ceasing.', imageZh: '水洊至，习坎。君子以常德行，习教事。', above: 5, below: 5 },
  { number: 30, name: '离',   pinyin: 'Lí',        english: 'The Clinging',                 judgment: 'Perseverance furthers. It brings success. Care of the cow brings good fortune.', judgmentZh: '畜牝牛吉',                     image: 'Fire rises and clings to the sun. The superior person continues illumination.', imageZh: '明两作，离。大人以继明照于四方。', above: 6, below: 6 },
  { number: 31, name: '咸',   pinyin: 'Xián',      english: 'Influence',                   judgment: 'Success. Perseverance furthers. Taking a maiden to wife brings good fortune.', judgmentZh: '咸亨利贞，取女吉',             image: 'Lake rests beneath the mountain. True influence comes from the heart.', imageZh: '山上有泽，咸。君子以虚受人。', above: 7, below: 8 },
  { number: 32, name: '恒',   pinyin: 'Héng',      english: 'Duration',                     judgment: 'Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.', judgmentZh: '亨，无咎，利贞，利有攸往',   image: 'Thunder and wind unite. Duration requires the correct position.', imageZh: '雷风，恒。君子以立不易方。', above: 4, below: 3 },
  { number: 33, name: '遁',   pinyin: 'Dùn',       english: 'Retreat',                      judgment: 'Success. In what is small, perseverance furthers.', judgmentZh: '亨，小利贞',                  image: 'Mountain rises beneath heaven. The superior man restrains the self.', imageZh: '天下有山，遁。君子以远小人，不恶而严。', above: 1, below: 7 },
  { number: 34, name: '大壮', pinyin: 'Dà Zhuàng', english: 'The Power of the Great',     judgment: 'Perseverance furthers.',                          judgmentZh: '利贞',                          image: 'Thunder shakes beneath heaven. Great power must be tempered by righteousness.', imageZh: '雷在天上，大壮。君子以非礼勿履。', above: 1, below: 3 },
  { number: 35, name: '晋',   pinyin: 'Jìn',       english: 'Progress',                    judgment: 'The powerful prince is honoured with horses in large numbers.', judgmentZh: '康侯用锡马蕃庶，昼日三接',     image: 'The sun rises over the earth. The superior man brightens virtue.', imageZh: '明出地上，晋。君子以自昭明德。', above: 2, below: 6 },
  { number: 36, name: '明夷', pinyin: 'Míng Yí',   english: 'Darkening of the Light',      judgment: 'In adversity it furthers one to be persevering.', judgmentZh: '利艰贞',                       image: 'The sun sinks beneath the earth. The superior man uses adversity to cultivate virtue.', imageZh: '明入地中，明夷。君子以莅众，用晦而明。', above: 2, below: 6 },
  { number: 37, name: '家人', pinyin: 'Jiā Rén',   english: 'The Family',                  judgment: 'Perseverance of the woman furthers.',           judgmentZh: '利女贞',                       image: 'Fire rises from the wood. The family establishes correct roles.', imageZh: '风自火出，家人。君子以言有物而行有恒。', above: 4, below: 6 },
  { number: 38, name: '睽',   pinyin: 'Kuí',       english: 'Opposition',                  judgment: 'In small matters, good fortune.',               judgmentZh: '小事吉',                       image: 'Fire rises, lake descends. Opposition in the outer world.', imageZh: '上火下泽，睽。君子以同而异。', above: 8, below: 6 },
  { number: 39, name: '蹇',   pinyin: 'Jiǎn',      english: 'Obstruction',                 judgment: 'The southwest furthers. The northeast does not further. It furthers one to see the great man.', judgmentZh: '利西南，不利东北，贞吉',   image: 'Water rests atop the mountain. The superior man turns inward.', imageZh: '山上有水，蹇。君子以反身修德。', above: 5, below: 7 },
  { number: 40, name: '解',   pinyin: 'Xiè',       english: 'Deliverance',                 judgment: 'The southwest furthers. If there is no longer anything to be achieved, return brings good fortune.', judgmentZh: '利西南，无所往，其来复吉，有攸往，夙吉', image: 'Thunder and rain release. The superior man pardons wrongs.', imageZh: '雷雨作，解。君子以赦过宥罪。', above: 5, below: 3 },
  { number: 41, name: '损',   pinyin: 'Sǔn',       english: 'Decrease',                    judgment: 'Decrease combined with sincerity brings about supreme good fortune without blame.', judgmentZh: '有孚，元吉，无咎，可贞，利有攸往', image: 'Lake diminishes the mountain. The superior man removes ornament.', imageZh: '山下有泽，损。君子以惩忿窒欲。', above: 7, below: 8 },
  { number: 42, name: '益',   pinyin: 'Yì',        english: 'Increase',                    judgment: 'It furthers one to undertake something. It furthers one to cross the great water.', judgmentZh: '利有攸往，利涉大川',          image: 'Thunder and wind move together. True increase benefits all.', imageZh: '风雷，益。君子以见善则迁，有过则改。', above: 4, below: 3 },
  { number: 43, name: '夬',   pinyin: 'Guài',      english: 'Break-through',               judgment: 'One must resolutely make the matter known at the court of the king.', judgmentZh: '扬于王庭，孚号有厉，告自邑，不利即戎，利有攸往', image: 'The lake rises above heaven. Determination is needed.', imageZh: '泽上于天，夬。君子以施禄及下，居德则忌。', above: 1, below: 8 },
  { number: 44, name: '姤',   pinyin: 'Gòu',       english: 'Coming to Meet',              judgment: 'The maiden is powerful. One should not marry such a maiden.', judgmentZh: '女壮，勿用取女',              image: 'Wind blows beneath heaven. The superior man examines the beginning.', imageZh: '天下有风，姤。后以施命诰四方。', above: 1, below: 4 },
  { number: 45, name: '萃',   pinyin: 'Cuì',       english: 'Gathering Together',          judgment: 'Success. The king approaches his temple. Great offerings bring good fortune.', judgmentZh: '亨，王假有庙，利见大人，亨利贞，用大牲吉', image: 'The lake rises over the earth. Gathering requires leadership.', imageZh: '泽上于地，萃。君子以除戎器，戒不虞。', above: 2, below: 8 },
  { number: 46, name: '升',   pinyin: 'Shēng',     english: 'Pushing Upward',              judgment: 'Supreme success. One must see the great man. Do not be grieved. Marching to the south brings good fortune.', judgmentZh: '元亨，用见大人，勿恤，南征吉',  image: 'Earth rises through the wood. Gradual ascent is orderly.', imageZh: '地中生木，升。君子以顺德，积小以高大。', above: 2, below: 4 },
  { number: 47, name: '困',   pinyin: 'Kùn',       english: 'Oppression',                 judgment: 'Success. Perseverance. The great man brings about good fortune. No blame.', judgmentZh: '亨，贞大人吉，无咎，有言不信',  image: 'The lake is exhausted beneath the earth. Noble souls endure hardship.', imageZh: '泽无水，困。君子以致命遂志。', above: 2, below: 5 },
  { number: 48, name: '井',   pinyin: 'Jǐng',       english: 'The Well',                   judgment: 'The town may be changed, but the well cannot be changed. Draw near to the well; the water is there.', judgmentZh: '改邑不改井，无丧无得，往来井井，汔至亦未繘井', image: 'Water rises from the well. The sage nourishes the people.', imageZh: '木上有水，井。君子以劳民劝相。', above: 5, below: 4 },
  { number: 49, name: '革',   pinyin: 'Gé',        english: 'Revolution',                  judgment: 'On your own day you are believed. Supreme success. Perseverance furthers. Remorse disappears.', judgmentZh: '己日乃孚，元亨利贞，悔亡',    image: 'Fire transforms the lake. The superior man reforms at the right time.', imageZh: '泽中有火，革。君子以治历明时。', above: 8, below: 6 },
  { number: 50, name: '鼎',   pinyin: 'Dǐng',      english: 'The Cauldron',               judgment: 'Supreme good fortune. Success.',                  judgmentZh: '元吉亨',                       image: 'Fire beneath the cauldron. The superior aspect transforms the world.', imageZh: '木上有火，鼎。君子以正位凝命。', above: 5, below: 4 },
  { number: 51, name: '震',   pinyin: 'Zhèn',      english: 'The Arousing (Shock)',        judgment: 'Shock brings success. When the shock comes, there is fear. Then laughter and words.', judgmentZh: '亨，震来虩虩，笑言哑哑，震惊百里，不丧匕鬯', image: 'Thunder erupts from the earth. The sage preserves his composure.', imageZh: '洊雷，震。君子以恐惧修省。', above: 3, below: 3 },
  { number: 52, name: '艮',   pinyin: 'Gèn',       english: 'Keeping Still, Mountain',    judgment: 'Keeping his back still so that he no longer feels his body.', judgmentZh: '艮其背，不获其身，行其庭，不见其人，无咎', image: 'Mountain stands still. The superior man restrains the self.', imageZh: '兼山，艮。君子以思不出其位。', above: 7, below: 7 },
  { number: 53, name: '渐',   pinyin: 'Jiàn',      english: 'Development (Gradual Progress)', judgment: 'The maiden is given in marriage. Good fortune. Perseverance furthers.', judgmentZh: '女归吉，利贞',                 image: 'The wind blows on the mountain. Gradual progress requires order.', imageZh: '山上有木，渐。君子以居贤德善俗。', above: 4, below: 7 },
  { number: 54, name: '归妹', pinyin: 'Guī Mèi',   english: 'The Marrying Maiden',         judgment: 'Undertakings bring misfortune. Nothing that would further.', judgmentZh: '征凶，无攸利',                 image: 'Thunder stands on the lake. The yang principle is insufficient.', imageZh: '泽上有雷，归妹。君子以永终知敝。', above: 3, below: 8 },
  { number: 55, name: '丰',   pinyin: 'Fēng',      english: 'Abundance',                   judgment: 'Abundance has success. The king attains abundance. Be not sad.', judgmentZh: '亨，王假之，勿忧，宜日中',     image: 'Thunder and lightning unite. Great abundance requires clarity.', imageZh: '雷电皆至，丰。君子以折狱致刑。', above: 6, below: 3 },
  { number: 56, name: '旅',   pinyin: 'Lǚ',       english: 'The Wanderer',                judgment: 'The wanderer — success through smallness. Perseverance brings good fortune.', judgmentZh: '小亨，旅贞吉',                image: 'Fire rests on the mountain. The wanderer maintains dignity.', imageZh: '山上有火，旅。君子以明慎用刑，而不留狱。', above: 6, below: 7 },
  { number: 57, name: '巽',   pinyin: 'Xùn',       english: 'The Gentle (Wind)',           judgment: 'Success through what is small. It furthers one to have somewhere to go.', judgmentZh: '小亨，利有攸往，利见大人',    image: 'Wind follows wind. The superior man spreads commands abroad.', imageZh: '随风，巽。君子以申命行事。', above: 4, below: 4 },
  { number: 58, name: '兑',   pinyin: 'Duì',       english: 'The Joyous, Lake',           judgment: 'Success. Perseverance is favourable.',          judgmentZh: '亨，利贞',                      image: 'Lakes rejoice together. True joy comes from sincere connection.', imageZh: '丽泽，兑。君子以朋友讲习。', above: 8, below: 8 },
  { number: 59, name: '涣',   pinyin: 'Huàn',      english: 'Dispersion (Dissolution)',    judgment: 'Success. The king approaches his temple. It furthers one to cross the great water.', judgmentZh: '亨，王假有庙，利涉大川，利贞',  image: 'Wind blows over the water. Dispersion reveals the truth.', imageZh: '风行水上，涣。先王以享于帝立庙。', above: 4, below: 5 },
  { number: 60, name: '节',   pinyin: 'Jié',       english: 'Limitation',                  judgment: 'Success. Galling limitation must not be persevered in.', judgmentZh: '亨，苦节不可贞',              image: 'Water rests within the lake. Limitation requires wisdom.', imageZh: '泽上有水，节。君子以制数度，议德行。', above: 8, below: 5 },
  { number: 61, name: '中孚', pinyin: 'Zhōng Fú',  english: 'Inner Truth',                 judgment: 'Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.', judgmentZh: '豚鱼吉，利涉大川，利贞',    image: 'Wind rests on the lake. True sincerity moves heaven and earth.', imageZh: '泽上有风，中孚。君子以议狱缓死。', above: 4, below: 8 },
  { number: 62, name: '小过', pinyin: 'Xiǎo Guò',  english: 'Preponderance of the Small',  judgment: 'Success. Perseverance furthers. Small things may be done; great things should not be done.', judgmentZh: '亨，利贞，可小事，不可大事，飞鸟遗之音，不宜上宜下', image: 'Thunder rests on the mountain. Small excess requires caution.', imageZh: '山上有雷，小过。君子以行过乎恭，丧过乎哀，用过乎俭。', above: 7, below: 3 },
  { number: 63, name: '既济', pinyin: 'Jì Jì',      english: 'After Completion',           judgment: 'Success in small matters. Perseverance furthers.',   judgmentZh: '亨小，利贞，初吉终乱',          image: 'Fire rests over water. Completion requires continued vigilance.', imageZh: '水在火上，既济。君子以思患而豫防之。', above: 5, below: 6 },
  { number: 64, name: '未济', pinyin: 'Wèi Jì',    english: 'Before Completion',          judgment: 'Success. But if the little fox has nearly completed the crossing, it gets its tail in the water.', judgmentZh: '亨，小狐汔济，濡其尾，无攸利', image: 'Fire rises over water. New beginnings follow every ending.', imageZh: '火在水上，未济。君子以慎辨物居方。', above: 6, below: 5 },
];

/**
 * Get the changing line meanings for a hexagram (六爻卦辞).
 * These are simplified — full text comes from the appendices.
 */
const CHANGING_LINE_MEANINGS = {
  1:  ['潜龙勿用', '见龙在田，利见大人', '君子终日乾乾，夕惕若厉，无咎', '或跃在渊，无咎', '飞龙在天，利见大人', '亢龙有悔'],
  2:  ['履霜，坚冰至', '直方大，不习无不利', '含章可贞，或从王事，无成有终', '括囊，无咎无誉', '黄裳元吉', '龙战于野，其血玄黄'],
  3:  ['利居贞', '雷雨解', '即鹿无虞，惟入于林中，君子几不如舍，往吝', '乘马班如，泣血涟如', '大求，得臣无家', '变不离宗'],
  4:  ['发蒙，利用刑人，用说桎梏', '包蒙吉，纳妇吉，子克家', '勿用娶女，见金夫，不有躬', '困蒙之吝，独远实也', '童蒙之吉，顺以巽也', '击蒙，不利为寇，利御寇'],
  5:  ['需于郊，利用恒，无咎', '需于沙，小有言，终吉', '需于泥，致寇至', '需于血，出自穴', '需于酒食，贞吉', '入于穴，有不速之客三人来，敬之终吉'],
  6:  ['不永所事，小有言，终吉', '不克讼，归而逋，其邑人三百户', '食旧德，贞厉，终吉，或从王事，无成', '不克讼，复即命渝，安贞吉', '讼元吉，以中正也', '朝三族，受福乃大'],
  7:  ['师出以律，否臧凶', '在师中，吉，无咎，王三锡命', '师或舆尸，凶', '师左次，无咎', '田有禽，利执言，无咎，长子帅师，弟子舆尸，贞凶', '小人勿用，必乱邦也'],
  8:  ['有孚比之，终来有它吉', '比之自内，贞吉', '比之匪人', '外比之，贞吉', '显比之吉，位正中也，舍逆取顺，失前禽也', '比之无首，凶'],
  9:  ['复自道，何其咎，吉', '牵复吉', '舆说辐，夫妻反目', '有孚惕出，上合志也，有孚挛如，富以其邻', '既雨既处，德积载也，君子好衎，小人违之不能亨', '密云不雨，上往也'],
  10: ['素履往，无咎', '履道坦坦，幽人贞吉', '眇能视，跛能履，履虎尾，咥人凶，武人为于大君', '履虎尾，愬愬终吉', '夬履，贞厉', '上九视履考祥，元吉'],
  11: ['拔茅茹，以其汇，征吉', '包荒，用冯河，不遐遗，得尚于中行', '无平不陂，无往不复，艰贞无咎，勿恤其孚，于食有福', '翩翩不富，皆失实也，不戒以孚，中心愿也', '帝乙归妹，以祉元吉', '城复于隍，勿用师，自邑告命，贞吝'],
  12: ['拔茅茹，以其汇，贞吉亨', '包承，小人吉，大人否亨', '包羞', '有命否塞，畴离祉', '倾否，先否后喜', '否终则倾，何可长也'],
  13: ['同人于野，亨，利涉大川，利君子贞', '同人于宗，吝', '伏戎于莽，升其高陵，三岁不兴', '乘其墉，弗克攻，吉', '同人先号咷而后笑，大师克相遇', '同人之终，寡不胜众'],
  14: ['无交害，匪咎，艰则无咎', '大车以载，有攸往，无咎', '公用亨于天子，小人弗克', '匪其彭，无咎', '厥孚交如，威如吉', '天佑之吉，大有庆也'],
  15: ['谦谦君子，卑以自牧也', '鸣谦，贞吉', '劳谦君子，有终吉', '无不利，拚谦，不违则也', '利用侵伐，征不服也', '鸣谦，志未得也，乃徐有说，利用行师，征邑国'],
  16: ['介于石，不终日，贞吉', '不终日，贞吉，以中正也', '盱豫，悔，迟有悔', '由豫，大有得，勿疑，朋盍簪', '贞疾，恒不死', '冥豫在上，何可长也'],
  17: ['官有渝，从渝，吉', '系小子，失丈夫', '系丈夫，失小子，随有求，得，利居贞', '随有获，贞凶，有孚在道，以明，何咎', '孚于嘉，吉', '拘系之，乃从维之，王用亨于西山'],
  18: ['干父之蛊，有子，考无咎，厉终吉', '干母之蛊，不可贞', '干父之蛊，小有悔，无大咎', '裕父之蛊，往见吝', '干父之蛊，用誉', '不事王侯，志可则也'],
  19: ['咸临，贞吉', '咸临，吉无不利', '甘临，无攸利，既忧之，贞吉', '至临，无咎', '知临，大君之宜，吉', '敦临，吉无咎'],
  20: ['童观，小人无咎，君子吝', '闚观，利女贞', '观我生，进退', '观国之光，利用宾于王', '观我生，君子无咎', '观其生，君子无咎'],
  21: ['屦校灭趾，无咎', '噬肤灭鼻，无咎', '噬腊肉，遇毒，小吝，无咎', '噬乾胏，得金矢，利艰贞，吉', '噬乾肉，得黄金，贞厉，无咎', '何校灭耳，凶'],
  22: ['贲其趾，舍车而徒', '贲其须', '贲如濡如，永贞吉', '贲如皤如，白马翰如，匪寇婚媾', '丘园束帛，戋戋，吝，终吉', '白贲，无咎'],
  23: ['剥床以足，蔑贞凶', '剥床以辨，蔑贞凶', '剥之，无咎，失上下也', '剥床以肤，凶，切近灾也', '鱼贯而入，凶', '小人盛而剥床凶'],
  24: ['不远复，无祗悔，元吉', '休复，吉', '频复，厉无咎', '中行独复', '敦复，无悔', '迷复，凶，有灾眚，用行师，终有大败，以其国君凶，至于十年不克征'],
  25: ['无妄，往吉', '不耕获，不菑畲，则利有攸往', '可贞，无咎', '无妄之灾，或系之牛，行人之得，邑人之灾', '无妄之行，穷之灾也', '无妄之得，勿药有喜'],
  26: ['有厉，利已', '舆说輹', '良马逐，利艰贞，日闲舆卫，利有攸往', '童牛之牿，元吉', '豶豕之牙，吉', '何天之衢，亨'],
  27: ['舍尔灵龟，观我朵颐，凶', '观我朵颐，亦不足贵也', '六二拂颐，贞凶，十年勿用，无攸利', '颠颐拂经于丘，颐征凶', '拂经，居贞吉，不可涉大川', '上九，由颐，厉吉，利涉大川'],
  28: ['藉用白茅，无咎', '枯杨生稊，老夫得其女妻，无不利', '栋桡，凶', '栋隆，吉，桡凶', '隆，栋桡之凶也', '过涉之凶，不可咎也'],
  29: ['习坎入于坎窞，凶', '坎有孚，维心亨', '来之坎坎，险且枕，入于坎窞，勿用', '樽酒簋贰，用约，纳约自牖，终无咎', '坎不盈，坻既平，无咎', '系用徽纆，寘于丛棘，三岁不得，凶'],
  30: ['履错然，敬之，无咎', '黄离，元吉', '日昃之离，不鼓缶而歌，则大耋之嗟，凶', '突如其来如，焚如，死如，弃如', '出涕沱若，戚嗟若，吉', '王用出征，有嘉折首，获匪其丑，无咎'],
  31: ['咸其拇', '咸其腓，凶，居吉', '咸其脢，无悔', '咸其辅颊舌', '咸其胸，凶', '咸其股，执其随，往吝'],
  32: ['悔亡，恒亨，无咎，利贞，利有攸往', '不恒其德，或承之羞，贞吝', '不恒其德，无所容也', '田无禽', '恒其德，贞，妇人吉，夫子凶', '振恒，凶'],
  33: ['遁尾，厉，勿用有攸往', '执之用黄牛之革，莫之胜说', '系遁，有疾，厉，畜臣妾，吉', '好遁，君子吉，小人否', '嘉遁，贞吉', '肥遁，无不利'],
  34: ['壮于趾，征凶，有孚', '贞吉', '小人用壮，君子用罔，贞厉，羝羊触藩，羸其角', '羊触藩，不能退，不能遂，无攸利，艰则吉', '丧羊于易，无悔', '羝羊触藩，不能退，不能遂，不祥也'],
  35: ['晋如摧如，贞吉，罔孚，裕无咎', '晋如愁如，贞吉，受兹介福', '众允，悔亡', '晋如鼫鼠，贞厉', '悔亡，失得勿恤，往吉，无不利', '晋其角，维用伐邑，厉吉无咎，贞吝'],
  36: ['明夷于飞，垂其翼，君子于行，三日不食，有攸往，主人有言', '明夷，夷于左股，用拯马壮吉', '明夷于南狩得其大首，不可疾贞', '入于左腹，获明夷之心，于出门庭', '箕子之明夷，利贞', '不明晦，初登于天，后入于地'],
  37: ['闲有家，悔亡', '无攸遂，在中馈，贞吉', '家人嗃嗃，悔厉吉，妇子嘻嘻，终吝', '富家大吉', '王假有家，勿恤吉', '交相爱，父子健也'],
  38: ['见恶人，无咎', '遇主于巷，无咎', '见舆曳，其牛掣，其人天且劓，无初有终', '睽孤，见豕负涂，载鬼一车，张弧说弧', '悔亡，厥宗噬肤，往咎少有无', '遇雨之吉，疑亡也'],
  39: ['往蹇来誉', '王臣蹇蹇，匪躬之故', '往蹇来反，内喜之也', '往蹇来连', '大蹇朋来', '往蹇来硕，吉'],
  40: ['无咎', '田获三狐，得黄矢，贞吉', '负且乘，致寇至，贞吝', '解而拇，朋至斯孚', '君子有解，小人退也', '公用射隼于高墉之上，获之，无不利'],
  41: ['已事遄往，无咎，酌损之', '利贞，益之，用誉', '益之用凶事，贞吉，有它不燕', '中行告公从，利用为依迁国', '益之无咎，固有之也', '莫益之，或击之，立心勿恒，凶'],
  42: ['元吉，利有攸往', '下不厚事也', '或益之，无功也', '益之凶事也', '有孚中行，告公用圭', '莫益之，凶'],
  43: ['壮于前趾，往不胜为咎', '臀无肤，其行次且，牵羊悔亡，闻言不信', '不能退，不能遂，不详也', '闻言不信，聪不明也', '臀无肤，其行次且，厉吉有它不燕', '无号，终有凶'],
  44: ['系于金柅，贞吉', '有攸往，见凶，羸豕孚蹢躅', '贏豕蹢躅，有攸往，是为茀中之祸', '包无鱼，凶', '鱼不可见于渊也', '姤其角，吝，无咎'],
  45: ['有孚不终，乃乱乃萃，若号，一握为笑，勿恤，往无咎', '孚不改，容民也', '萃如嗟如，无攸利', '大吉，无咎', '萃有位，无咎，匪孚，元永贞，悔亡', '赍咨涕洟，无咎'],
  46: ['允升，大吉', '孚乃利用禴，无咎', '升虚邑', '升阶', '升高必自迩也', '冥升，利于不食之贞'],
  47: ['入于幽谷，幽不明也', '困于酒食，朱绂方来，、利用享祀，征凶无咎', '困于石，据于蒺藜，入于其宫，不见其妻，凶', '来徐徐，困于金车，吝，有终', '劓刖，困于赤绂，乃徐有说，利用祭祀', '困于葛藟，于臲卼，曰动悔有悔，征吉'],
  48: ['井泥不食，旧井无禽', '井谷射鲋，瓮敝漏', '井渫不食，为我心恻，可用汲，王明，并受其福', '井甃，无咎', '井冽寒泉食', '井收勿幕，有孚元吉'],
  49: ['巩用黄牛之革', '己日乃革之，征吉，无咎', '征凶，贞厉，革言三就，有孚', '改命之吉，信志也', '大人虎变，孚过于革终乎取信', '君子豹变，小人革面，征凶，居贞吉'],
  50: ['鼎颠趾，利出否，得妾以其子，无咎', '鼎有实，我仇有疾，不我能即，吉', '鼎耳革，其行塞，雉膏不食，方雨亏悔，终吉', '鼎折足，覆公餗，其形渥，凶', '鼎黄耳，利贞', '鼎玉铉，大吉，上天下泽'],
  51: ['震来虩虩，笑言哑哑，震惊百里，不丧匕鬯', '震来虩虩，恐致福也', '震苏苏，震行无眚', '震遂泥', '震往来厉，亿无丧，有事', '震索索，视矍矍，凶'],
  52: ['艮其趾，无咎', '艮其腓，不拯其随，其心不快', '艮其限，列其夤，厉熏心', '艮其身，无咎', '艮其辅，言有序，悔亡', '敦艮，吉'],
  53: ['鸿渐于干，小子厉，有言，无咎', '鸿渐于磐，饮食衎衎，吉', '鸿渐于陆，夫征不复，妇孕不育，凶，利御寇', '鸿渐于木，或得其桷，无咎', '鸿渐于陵，妇三岁不孕，终莫之胜，吉', '其羽可用为仪吉'],
  54: ['归妹愆期，迟归有时', '其君之袂，不如其娣之袂良', '眇而视，利幽人之贞', '归妹以须，反归以娣', '愆期之志，有待而行也', '女承筐无实，士刲羊无血，无攸利'],
  55: ['遇其配主，虽旬无咎，往有尚', '丰其蔀，日中见斗，往得疑疾', '丰其沛，日中见昧，折其右肱，无咎', '丰其蔀，幽人贞吉', '来章，有庆誉，吉', '丰其屋，蔀其家，窥其户，阒其无人，三岁不觌，凶'],
  56: ['旅琐琐，灾及其身，斯其所取灾', '旅即次，怀其资，得童仆贞', '旅焚其次，丧其童仆，贞厉', '旅于处，得其资斧，我心不快', '射夫一矢，亡之矣', '鸟焚其巢，旅人先笑后号咷，丧牛于易，凶'],
  57: ['进退，利武人之贞', '巽在床下，丧其资斧，贞凶', '频巽，吝', '悔亡，田获三品', '贞吉悔亡，无不利，无初有终，先庚三日，后庚三日，吉', '巽在床下，凶'],
  58: ['和兑，吉', '孚兑，吉，悔亡', '来兑，凶', '商兑，未宁，介疾有喜', '九五之孚，于剥有路', '上六，引兑'],
  59: ['方唤涣汗’，其大唤涣王居，无咎', '方唤涣奔其机，悔亡', '唤涣有疚，无咎', '唤涣群疑，朋来有喜', '涣其躬，无悔', '涣其血，去逖出，无咎'],
  60: ['不出户庭，无咎', '不出门庭，凶', '不节若，则嗟若，无咎', '安节，亨', '甘节，吉，往有尚', '苦节，贞凶，悔亡'],
  61: ['素履往，无咎', '黄离，元吉', '或益之十朋之龟，弗克违，永贞吉', '安居而无虞，悔亡', '有它不燕', '鸣鹤在阴，其子和之'],
  62: ['鸟雀之差，凶', '过其祖，遇其妣，不及其君，遇其臣，吉', '弗过防之，从或戕之，凶', '无咎，弗过遇之，往厉必戒，勿用永贞', '密云不雨，自我西郊，公弋取彼在穴', '弗遇过之，飞鸟离之，凶'],
  63: ['曳其轮，濡其尾，无咎', '妇丧其茀，勿逐，七日得', '高宗伐鬼方，三年克之，小人勿用', '繻有衣袽，终日戒', '东邻杀牛，不如西邻之时也，实受其福，吉', '濡其首，有孚发若，吉'],
  64: ['濡其尾，吝', '曳其轮，贞吉', '未出中，尚口也', '有疾，厉，寿也', '妇笑盈盈，光明也', '濡其首，何可再'],
};

/**
 * Returns a hexagram by its traditional number (1–64).
 */
function getHexagramByNumber(number) {
  return HEXAGRAMS.find(h => h.number === number) || null;
}

/**
 * Returns a hexagram by its trigram pair (upper, lower).
 */
function getHexagramByTrigrams(upper, lower) {
  return HEXAGRAMS.find(h => h.above === upper && h.below === lower) || null;
}

/**
 * Get changing line meanings for a hexagram number.
 */
function getChangingLineMeanings(hexagramNumber) {
  return CHANGING_LINE_MEANINGS[hexagramNumber] || Array(6).fill('');
}

/**
 * Builds an enriched hexagram object with all I Ching data.
 * Used when casting a new hexagram to include full metadata.
 */
function enrichHexagram(hexagram, lines) {
  const trigramAbove = TRIGRAMS[hexagram.above] || { name: '', english: '' };
  const trigramBelow = TRIGRAMS[hexagram.below] || { name: '', english: '' };
  const lineMeanings = getChangingLineMeanings(hexagram.number);

  const changingLines = lines.map((lineValue, index) => {
    const isYang = lineValue === 7 || lineValue === 9;
    const isChanging = lineValue === 6 || lineValue === 9;
    return {
      line: index + 1,
      value: lineValue,
      isYang,
      isChanging,
      meaning: lineMeanings[index] || '',
      meaningEn: isYang ? (isChanging ? 'Old Yang - changing' : 'Young Yang') : (isChanging ? 'Old Yin - changing' : 'Young Yin'),
    };
  });

  return {
    ...hexagram,
    above: hexagram.above,
    below: hexagram.below,
    aboveName: trigramAbove.name,
    belowName: trigramBelow.name,
    aboveEn: trigramAbove.english,
    belowEn: trigramBelow.english,
    // AI-prompt field names (judgement/judgementEn match ai-prompts.ts YiJingHexagram)
    judgement: hexagram.judgment || hexagram.english || '',
    judgementEn: hexagram.judgment || hexagram.english || '',
    judgementZh: hexagram.judgmentZh || '',
    image: hexagram.image || hexagram.english || '',
    imageZh: hexagram.imageZh || '',
    // AI-prompt imageEn field
    imageEn: hexagram.image || hexagram.english || '',
    changingLines,
  };
}

/**
 * Casts a hexagram using the three-coins method (pseudo-random).
 *
 * Each of the 6 lines is determined by tossing 3 coins:
 *   - 3 heads (sum 9)  → old yang  → changing line, drawn as —×—
 *   - 2 heads (sum 8)  → young yin  → yin line, drawn as — —
 *   - 2 tails (sum 7)  → young yang → yang line, drawn as ———
 *   - 3 tails (sum 6)  → old yin   → changing line, drawn as —o—
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

  // Return enriched hexagram with full I Ching data
  const enriched = enrichHexagram(hexagram, lines);

  return { hexagram: enriched, lines, hasChangingLines };
}

module.exports = {
  castHexagram,
  getHexagramByNumber,
  getHexagramByTrigrams,
  enrichHexagram,
  HEXAGRAMS,
  TRIGRAMS,
};
