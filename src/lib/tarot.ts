// Tarot Card System for TianJi Global
// Full 78-card deck with Chinese/English meanings

export interface TarotCard {
  id: number;
  name: string;
  nameChinese: string;
  arcana: 'major' | 'minor';
  suit?: string;
  suitChinese?: string;
  meaning: string;
  meaningChinese: string;
  reversedMeaning: string;
  reversedMeaningChinese: string;
  image?: string;
}

export interface SpreadPosition {
  name: string;
  nameChinese: string;
  description: string;
  descriptionChinese: string;
}

export interface SpreadLayout {
  name: string;
  nameChinese: string;
  description: string;
  descriptionChinese: string;
  positions: SpreadPosition[];
  cardCount: number;
}

// Major Arcana (22 cards)
export const majorArcana: Omit<TarotCard, 'suit' | 'suitChinese'>[] = [
  { id: 0, name: 'The Fool', nameChinese: '愚者', arcana: 'major', meaning: 'New beginnings, innocence, spontaneity, free spirit', meaningChinese: '新开始，天真 spontaneity, 开放精神', reversedMeaning: 'Recklessness, risk-taking, holding back', reversedMeaningChinese: '鲁莽，风险承担，犹豫不决' },
  { id: 1, name: 'The Magician', nameChinese: '魔术师', arcana: 'major', meaning: 'Manifestation, resourcefulness, power, inspired action', meaningChinese: '显化，足智多谋，力量，受启发行动', reversedMeaning: 'Manipulation, poor planning, untapped talents', reversedMeaningChinese: '操控，规划不周，未开发才能' },
  { id: 2, name: 'The High Priestess', nameChinese: '女祭司', arcana: 'major', meaning: 'Intuition, sacred knowledge, divine feminine, the subconscious mind', meaningChinese: '直觉，神圣知识，女性能量，潜意识', reversedMeaning: 'Secrets, disconnected from intuition, withdrawal', reversedMeaningChinese: '秘密，与直觉断联，退缩' },
  { id: 3, name: 'The Empress', nameChinese: '女皇', arcana: 'major', meaning: 'Femininity, beauty, nature, nurturing, abundance', meaningChinese: '女性气质，美好的，自然，养育，丰富', reversedMeaning: 'Creative block, dependence, emptiness', reversedMeaningChinese: '创作瓶颈，依赖，空虚' },
  { id: 4, name: 'The Emperor', nameChinese: '皇帝', arcana: 'major', meaning: 'Authority, structure, control, fatherhood, stability', meaningChinese: '权威，结构，控制，父亲形象，稳定', reversedMeaning: 'Domination, excessive control, rigidity', reversedMeaningChinese: '支配，过度控制，僵化' },
  { id: 5, name: 'The Hierophant', nameChinese: '教皇', arcana: 'major', meaning: 'Spiritual wisdom, tradition, conformity, morality, ethics', meaningChinese: '精神智慧，传统，顺从，道德，伦理', reversedMeaning: 'Personal beliefs, freedom, challenging the status quo', reversedMeaningChinese: '个人信念，自由，挑战现状' },
  { id: 6, name: 'The Lovers', nameChinese: '恋人', arcana: 'major', meaning: 'Love, harmony, relationships, values alignment, choices', meaningChinese: '爱，和谐，关系，价值观一致，选择', reversedMeaning: 'Self-love, disharmony, imbalance, misalignment of values', reversedMeaningChinese: '自爱，不和谐，不平衡，价值观偏差' },
  { id: 7, name: 'The Chariot', nameChinese: '战车', arcana: 'major', meaning: 'Control, willpower, success, action, determination', meaningChinese: '控制，意志力，成功，行动，决心', reversedMeaning: 'Self-discipline, opposition, lack of direction', reversedMeaningChinese: '自律，对立，缺乏方向' },
  { id: 8, name: 'Strength', nameChinese: '力量', arcana: 'major', meaning: 'Courage, persuasion, influence, compassion, inner strength', meaningChinese: '勇气，说服力，影响力，同情心，内在力量', reversedMeaning: 'Inner strength, self-doubt, raw emotion', reversedMeaningChinese: '内在力量，自我怀疑，原始情感' },
  { id: 9, name: 'The Hermit', nameChinese: '隐士', arcana: 'major', meaning: 'Soul-searching, introspection, inner guidance, solitude', meaningChinese: '灵魂探索，内省，内在指导，独处', reversedMeaning: 'Isolation, loneliness, withdrawal', reversedMeaningChinese: '孤立，孤独，退缩' },
  { id: 10, name: 'Wheel of Fortune', nameChinese: '命运之轮', arcana: 'major', meaning: 'Good luck, karma, life cycles, destiny, turning point', meaningChinese: '好运，业力，生命循环，命运，转折点', reversedMeaning: 'Bad luck, resistance to change, breaking cycles', reversedMeaningChinese: '坏运气，抗拒改变，打破循环' },
  { id: 11, name: 'Justice', nameChinese: '正义', arcana: 'major', meaning: 'Justice, fairness, truth, cause and effect, law', meaningChinese: '正义，公平，真相，因果报应，法律', reversedMeaning: 'Unfairness, lack of accountability, dishonesty', reversedMeaningChinese: '不公平，缺乏责任感，不诚实' },
  { id: 12, name: 'The Hanged Man', nameChinese: '倒吊人', arcana: 'major', meaning: 'Pause, surrender, letting go, new perspectives', meaningChinese: '暂停，放弃，放手，新视角', reversedMeaning: 'Delays, resistance, stalling, indecision', reversedMeaningChinese: '延迟，抗拒，拖延，犹豫不决' },
  { id: 13, name: 'Death', nameChinese: '死神', arcana: 'major', meaning: 'Endings, change, transformation, transition', meaningChinese: '结束，改变，蜕变，转变', reversedMeaning: 'Resistance to change, personal transformation, inner purging', reversedMeaningChinese: '抗拒改变，个人蜕变，内心净化' },
  { id: 14, name: 'Temperance', nameChinese: '节制', arcana: 'major', meaning: 'Balance, moderation, patience, purpose, meaning', meaningChinese: '平衡，节制，耐心，目的，意义', reversedMeaning: 'Imbalance, excess, self-healing, realignment', reversedMeaningChinese: '不平衡，过度，自我疗愈，重新调整' },
  { id: 15, name: 'The Devil', nameChinese: '恶魔', arcana: 'major', meaning: 'Shadow self, attachment, addiction, restriction', meaningChinese: '阴影自我，执着，上瘾，束缚', reversedMeaning: 'Releasing limiting beliefs, exploring dark thoughts, detachment', reversedMeaningChinese: '释放限制性信念，探索黑暗思想，分离' },
  { id: 16, name: 'The Tower', nameChinese: '塔', arcana: 'major', meaning: 'Sudden change, upheaval, chaos, revelation, awakening', meaningChinese: '突变，动荡，混乱，启示，觉醒', reversedMeaning: 'Personal transformation, fear of change, averting disaster', reversedMeaningChinese: '个人蜕变，害怕改变，避免灾难' },
  { id: 17, name: 'The Star', nameChinese: '星星', arcana: 'major', meaning: 'Hope, faith, purpose, renewal, spirituality', meaningChinese: '希望，信念，目标，更新，精神', reversedMeaning: 'Lack of faith, despair, self-trust, disconnection', reversedMeaningChinese: '缺乏信念，绝望，自我信任，疏离' },
  { id: 18, name: 'The Moon', nameChinese: '月亮', arcana: 'major', meaning: 'Illusion, fear, anxiety, subconscious, intuition', meaningChinese: '幻象，恐惧，焦虑，潜意识，直觉', reversedMeaning: 'Release of fear, repressed emotion, inner confusion', reversedMeaningChinese: '释放恐惧，被压抑的情感，内心混乱' },
  { id: 19, name: 'The Sun', nameChinese: '太阳', arcana: 'major', meaning: 'Positivity, fun, warmth, success, vitality', meaningChinese: '积极，有趣，温暖，成功，活力', reversedMeaning: 'Inner child, feeling down, overly optimistic', reversedMeaningChinese: '内在小孩，情绪低落，过于乐观' },
  { id: 20, name: 'Judgement', nameChinese: '审判', arcana: 'major', meaning: 'Judgement, rebirth, inner calling, absolution', meaningChinese: '审判，重生，内在召唤，赦免', reversedMeaning: 'Self-doubt, inner critic, ignoring the call', reversedMeaningChinese: '自我怀疑，内在批判，忽视召唤' },
  { id: 21, name: 'The World', nameChinese: '世界', arcana: 'major', meaning: 'Completion, integration, accomplishment, travel', meaningChinese: '完成，整合，成就，旅行', reversedMeaning: 'Seeking personal closure, short-cuts, delays', reversedMeaningChinese: '寻求个人 closure, 捷径，延迟' },
];

// Minor Arcana - Wands (14 cards - Ace through Ten + Page, Knight, Queen, King)
export const wands: TarotCard[] = [
  { id: 22, name: 'Ace of Wands', nameChinese: '权杖Ace', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Inspiration, new opportunities, growth, potential', meaningChinese: '灵感，新机会，成长，潜力', reversedMeaning: 'Emerging ideas, lack of direction, delays', reversedMeaningChinese: '正在浮现的想法，缺乏方向，延迟' },
  { id: 23, name: 'Two of Wands', nameChinese: '权杖二', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Future planning, progress, decisions, discovery', meaningChinese: '未来规划，进步，决定，发现', reversedMeaning: 'Personal goals, inner alignment, fear of unknown', reversedMeaningChinese: '个人目标，内在一致，对未知的恐惧' },
  { id: 24, name: 'Three of Wands', nameChinese: '权杖三', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Progress, expansion, foresight, overseas opportunities', meaningChinese: '进步，拓展，远见，海外机会', reversedMeaning: 'Playing small, lack of foresight, delays in plans', reversedMeaningChinese: '格局小，缺乏远见，计划延迟' },
  { id: 25, name: 'Four of Wands', nameChinese: '权杖四', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Celebration, harmony, marriage, home, community', meaningChinese: '庆祝，和谐，婚姻，家园，社区', reversedMeaning: 'Personal celebration, inner harmony, conflict', reversedMeaningChinese: '个人庆祝，内心和谐，冲突' },
  { id: 26, name: 'Five of Wands', nameChinese: '权杖五', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Conflict, disagreements, competition, tension', meaningChinese: '冲突，争执，竞争，紧张', reversedMeaning: 'Inner conflict, conflict avoidance, release of tension', reversedMeaningChinese: '内心冲突，避免冲突，释放紧张' },
  { id: 27, name: 'Six of Wands', nameChinese: '权杖六', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Success, recognition, progress, self-confidence', meaningChinese: '成功，认可，进步，自信', reversedMeaning: 'Inner success, fall from grace, egotism', reversedMeaningChinese: '内在成功，失势，自我中心' },
  { id: 28, name: 'Seven of Wands', nameChinese: '权杖七', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Challenge, competition, protection, perseverance', meaningChinese: '挑战，竞争，保护，坚持', reversedMeaning: 'Exhaustion, giving up, overwhelmed', reversedMeaningChinese: '疲惫，放弃，不堪重负' },
  { id: 29, name: 'Eight of Wands', nameChinese: '权杖八', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Movement, fast paced change, action, alignment', meaningChinese: '移动，快速变化，行动，一致', reversedMeaning: 'Delays, frustration, resisting change', reversedMeaningChinese: '延迟，挫折，抗拒改变' },
  { id: 30, name: 'Nine of Wands', nameChinese: '权杖九', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Resilience, courage, persistence, test of will', meaningChinese: '韧性，勇气，坚持，意志考验', reversedMeaning: 'Inner resources, struggle, overwhelm', reversedMeaningChinese: '内在资源，挣扎，不堪重负' },
  { id: 31, name: 'Ten of Wands', nameChinese: '权杖十', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Burden, responsibility, hard work, stress', meaningChinese: '负担，责任，辛苦工作，压力', reversedMeaning: 'Doing it all, delegation, release of burden', reversedMeaningChinese: '事必躬亲，授权，卸下负担' },
  { id: 32, name: 'Page of Wands', nameChinese: '权杖侍从', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Inspiration, ideas, discovery, free spirit', meaningChinese: '灵感，想法，发现，自由精神', reversedMeaning: 'Newly found passion, self-limiting beliefs', reversedMeaningChinese: '新发现的热情，自我限制的信念' },
  { id: 33, name: 'Knight of Wands', nameChinese: '权杖骑士', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Energy, passion, action, adventure, impulsiveness', meaningChinese: '能量，热情，行动，冒险，冲动', reversedMeaning: 'Passion, speed, impetuousness, delays', reversedMeaningChinese: '热情，速度，冲动，延迟' },
  { id: 34, name: 'Queen of Wands', nameChinese: '权杖皇后', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Courage, confidence, independence, social butterfly', meaningChinese: '勇气，信心，独立，社交达人', reversedMeaning: 'Self-assurance, introverted, re-establish self', reversedMeaningChinese: '自信，内向，重新确立自我' },
  { id: 35, name: 'King of Wands', nameChinese: '权杖国王', arcana: 'minor', suit: 'Wands', suitChinese: '权杖', meaning: 'Natural leader, vision, entrepreneur, honor', meaningChinese: '天生的领袖，远见，企业家，荣誉', reversedMeaning: 'Impulsiveness, haste, ruthless, high expectations', reversedMeaningChinese: '冲动，仓促，无情，期望过高' },
];

// Minor Arcana - Cups (14 cards)
export const cups: TarotCard[] = [
  { id: 36, name: 'Ace of Cups', nameChinese: '圣杯Ace', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'New feelings, spirituality, intuition, love', meaningChinese: '新情感，精神性，直觉，爱', reversedMeaning: 'Self-love, intuition, repressed emotions', reversedMeaningChinese: '自爱，直觉，被压抑的情感' },
  { id: 37, name: 'Two of Cups', nameChinese: '圣杯二', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Unified love, partnership, mutual attraction', meaningChinese: '统一的爱，伙伴关系，互相吸引', reversedMeaning: 'Self-love, break-ups, disharmony', reversedMeaningChinese: '自爱，分手，不和谐' },
  { id: 38, name: 'Three of Cups', nameChinese: '圣杯三', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Celebration, friendship, creativity, collaborations', meaningChinese: '庆祝，友谊，创造力，合作', reversedMeaning: 'Independence, singleness, three-way conflict', reversedMeaningChinese: '独立，单身，三方冲突' },
  { id: 39, name: 'Four of Cups', nameChinese: '圣杯四', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Meditation, contemplation, apathy, reevaluation', meaningChinese: '冥想，沉思，冷漠，重新评估', reversedMeaning: 'Sudden awareness, choosing happiness, acceptance', reversedMeaningChinese: '突然意识到，选择接受，accepting happiness' },
  { id: 40, name: 'Five of Cups', nameChinese: '圣杯五', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Regret, failure, disappointment, pessimism', meaningChinese: '遗憾，失败，失望，悲观', reversedMeaning: 'Personal setbacks, self-forgiveness, moving on', reversedMeaningChinese: '个人挫折，自我原谅，继续前行' },
  { id: 41, name: 'Six of Cups', nameChinese: '圣杯六', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Revisiting the past, childhood memories, innocence', meaningChinese: '回顾过去，童年记忆，纯真', reversedMeaning: 'Living in the past, forgiveness, lacking playfulness', reversedMeaningChinese: '活在过去，宽容，缺乏趣味' },
  { id: 42, name: 'Seven of Cups', nameChinese: '圣杯七', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Opportunities, choices, wishful thinking, illusion', meaningChinese: '机会，选择，一厢情愿，幻想', reversedMeaning: 'Alignment, personal values, overwhelmed', reversedMeaningChinese: '一致，个人价值观，不堪重负' },
  { id: 43, name: 'Eight of Cups', nameChinese: '圣杯八', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Disappointment, abandonment, withdrawal, seeking truth', meaningChinese: '失望，放弃，退缩，寻求真相', reversedMeaning: 'Trying one more time, indecision, aimless drifting', reversedMeaningChinese: '再试一次，犹豫不决，漫无目的漂流' },
  { id: 44, name: 'Nine of Cups', nameChinese: '圣杯九', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Contentment, satisfaction, gratitude, wish fulfilled', meaningChinese: '满足，满意，感恩，心愿达成', reversedMeaning: 'Inner happiness, materialism, dissatisfaction', reversedMeaningChinese: '内心幸福，物质主义，不满足' },
  { id: 45, name: 'Ten of Cups', nameChinese: '圣杯十', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Divine love, blissful relationships, harmony', meaningChinese: '神圣的爱，幸福的关系，和谐', reversedMeaning: 'Disconnection, miscommunication, unfulfilled dreams', reversedMeaningChinese: '断联，沟通误解，梦想未实现' },
  { id: 46, name: 'Page of Cups', nameChinese: '圣杯侍从', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Creative opportunities, intuitive messages, curiosity', meaningChinese: '创意机会，直觉信息，好奇心', reversedMeaning: 'Inner child healing, private intuition, emotional immaturity', reversedMeaningChinese: '内在小孩疗愈，私密直觉，情绪不成熟' },
  { id: 47, name: 'Knight of Cups', nameChinese: '圣杯骑士', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Creativity, romance, charm, imagination, beauty', meaningChinese: '创造力，浪漫，魅力，想象力，美', reversedMeaning: 'Overactive imagination, unrealistic, moody', reversedMeaningChinese: '过度活跃的想象力，不切实际，情绪化' },
  { id: 48, name: 'Queen of Cups', nameChinese: '圣杯皇后', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Compassionate, caring, emotionally stable, intuitive', meaningChinese: '有同情心的，有照顾的，情绪稳定，直觉敏锐', reversedMeaning: 'Inner feelings, self-care, self-love', reversedMeaningChinese: '内心感受，自我照顾，自爱' },
  { id: 49, name: 'King of Cups', nameChinese: '圣杯国王', arcana: 'minor', suit: 'Cups', suitChinese: '圣杯', meaning: 'Emotionally balanced, compassionate, diplomatic', meaningChinese: '情绪平衡，有同情心，外交手腕', reversedMeaning: 'Self-compassion, moodiness, emotional manipulation', reversedMeaningChinese: '自我同情，情绪化，情绪操控' },
];

// Minor Arcana - Swords (14 cards)
export const swords: TarotCard[] = [
  { id: 50, name: 'Ace of Swords', nameChinese: '宝剑Ace', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Breakthroughs, clarity, sharp mind, truth', meaningChinese: '突破，清晰，敏锐的头脑，真理', reversedMeaning: 'Inner clarity, re-thinking, clouded judgement', reversedMeaningChinese: '内在清晰，重新思考，判断力模糊' },
  { id: 51, name: 'Two of Swords', nameChinese: '宝剑二', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Difficult choices, indecision, stalemate, blocked emotions', meaningChinese: '艰难的选择，犹豫不决，僵局，被阻断的情感', reversedMeaning: 'Indecision, confusion, information overload', reversedMeaningChinese: '犹豫不决，混乱，信息过载' },
  { id: 52, name: 'Three of Swords', nameChinese: '宝剑三', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Heartbreak, emotional pain, sorrow, grief', meaningChinese: '心碎，情感痛苦，悲伤， grief', reversedMeaning: 'Negative self-talk, releasing pain, optimism', reversedMeaningChinese: '负面自我对话，释放痛苦，乐观' },
  { id: 53, name: 'Four of Swords', nameChinese: '宝剑四', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Rest, relaxation, meditation, contemplation, recuperation', meaningChinese: '休息，放松，冥想，沉思，恢复', reversedMeaning: 'Exhaustion, burn-out, deep contemplation', reversedMeaningChinese: '疲惫，倦怠，深入沉思' },
  { id: 54, name: 'Five of Swords', nameChinese: '宝剑五', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Conflict, disagreements, competition, defeat, winning at all costs', meaningChinese: '冲突，争执，竞争，失败，不惜一切代价获胜', reversedMeaning: 'Reconciliation, making amends, past resentment', reversedMeaningChinese: '和解，弥补，过往怨恨' },
  { id: 55, name: 'Six of Swords', nameChinese: '宝剑六', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Transition, change, rite of passage, releasing baggage', meaningChinese: '过渡，转变，成人礼，放下包袱', reversedMeaning: 'Personal transition, resistance, unfinished business', reversedMeaningChinese: '个人转变，抗拒，未完成的事务' },
  { id: 56, name: 'Seven of Swords', nameChinese: '宝剑七', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Betrayal, deception, getting away with something, lying', meaningChinese: '背叛，欺骗，侥幸成功，撒谎', reversedMeaning: 'Imposter syndrome, self-deceit, truth revealed', reversedMeaningChinese: '骗子综合症，自我欺骗，真相大白' },
  { id: 57, name: 'Eight of Swords', nameChinese: '宝剑八', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Imprisonment, entrapment, self-victimization, limiting beliefs', meaningChinese: '监禁，困住，自我伤害，限制性信念', reversedMeaning: 'Self-acceptance, new approach to problems, calmness', reversedMeaningChinese: '自我接纳，解决问题的新方法，平静' },
  { id: 58, name: 'Nine of Swords', nameChinese: '宝剑九', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Anxiety, worry, fear, depression, nightmares', meaningChinese: '焦虑，担心，恐惧，抑郁，噩梦', reversedMeaning: 'Inner turmoil, deep-seated fears, releasing worry', reversedMeaningChinese: '内心动荡，根深蒂固的恐惧，释放担忧' },
  { id: 59, name: 'Ten of Swords', nameChinese: '宝剑十', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Painful endings, deep wounds, betrayal, loss, crisis', meaningChinese: '痛苦的结局，深重的创伤，背叛，失落，危机', reversedMeaning: 'Recovery, regeneration, resisting an inevitable end', reversedMeaningChinese: '恢复，再生，抗拒不可避免的结局' },
  { id: 60, name: 'Page of Swords', nameChinese: '宝剑侍从', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'New ideas, curiosity, thirst for knowledge, communication', meaningChinese: '新想法，好奇心，求知欲，沟通', reversedMeaning: 'Self-expression, all talk no action, haste', reversedMeaningChinese: '自我表达，只说不做，仓促' },
  { id: 61, name: 'Knight of Swords', nameChinese: '宝剑骑士', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Ambitious, action-oriented, driven, fast-paced', meaningChinese: '有抱负，积极行动，驱动，快速节奏', reversedMeaning: 'Restless, unfocused, impulsive, burn-out', reversedMeaningChinese: '焦躁不安，注意力不集中，冲动，倦怠' },
  { id: 62, name: 'Queen of Swords', nameChinese: '宝剑皇后', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Independent, unbiased judgement, clear boundaries, direct', meaningChinese: '独立，公正的判断，清晰的界限，直接', reversedMeaning: 'Overly emotional, easily influenced, cold-hearted', reversedMeaningChinese: '过度情绪化，容易受影响，冷酷' },
  { id: 63, name: 'King of Swords', nameChinese: '宝剑国王', arcana: 'minor', suit: 'Swords', suitChinese: '宝剑', meaning: 'Intellectual power, authority, truth, clear thinking', meaningChinese: '智力 power, 权威，真理，清晰的思维', reversedMeaning: 'Inner truth, misuse of power, manipulation', reversedMeaningChinese: '内在真理，滥用权力，操控' },
];

// Minor Arcana - Pentacles (14 cards)
export const pentacles: TarotCard[] = [
  { id: 64, name: 'Ace of Pentacles', nameChinese: '星币Ace', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'New financial opportunity, manifestation, abundance', meaningChinese: '新的财务机会，显化，丰富', reversedMeaning: 'Lost opportunity, lack of planning, scarcity mindset', reversedMeaningChinese: '错失机会，缺乏规划，稀缺心态' },
  { id: 65, name: 'Two of Pentacles', nameChinese: '星币二', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Multiple priorities, time management, prioritization, adaptability', meaningChinese: '多个优先事项，时间管理，优先级排序，适应能力', reversedMeaning: 'Over-committed, disorganization, reprioritization', reversedMeaningChinese: '承诺过多，无组织，重新排序优先级' },
  { id: 66, name: 'Three of Pentacles', nameChinese: '星币三', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Teamwork, collaboration, learning, implementation', meaningChinese: '团队合作，协作，学习，实施', reversedMeaning: 'Disharmony, misalignment, working alone', reversedMeaningChinese: '不和谐，不一致，独自工作' },
  { id: 67, name: 'Four of Pentacles', nameChinese: '星币四', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Saving money, security, conservatism, scarcity', meaningChinese: '存钱，安全，保守主义，匮乏', reversedMeaning: 'Over-spending, greed, self-protection', reversedMeaningChinese: '过度消费，贪婪，自我保护' },
  { id: 68, name: 'Five of Pentacles', nameChinese: '星币五', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Financial loss, poverty, lack mindset, isolation', meaningChinese: '财务损失，贫困，匮乏心态，孤立', reversedMeaning: 'Recovery from loss, spiritual poverty, re-evaluation', reversedMeaningChinese: '从损失中恢复，精神匮乏，重新评估' },
  { id: 69, name: 'Six of Pentacles', nameChinese: '星币六', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Giving, receiving, sharing wealth, generosity', meaningChinese: '给予，接受，分享财富，慷慨', reversedMeaning: 'Self-care, unpaid debts, one-sided charity', reversedMeaningChinese: '自我照顾，未偿债务，单向慈善' },
  { id: 70, name: 'Seven of Pentacles', nameChinese: '星币七', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Long-term view, sustainable results, perseverance, investment', meaningChinese: '长期视角，可持续成果，坚持，投资', reversedMeaning: 'Lack of long-term vision, limited success, impatience', reversedMeaningChinese: '缺乏长期愿景，成功有限，不耐烦' },
  { id: 71, name: 'Eight of Pentacles', nameChinese: '星币八', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Apprenticeship, repetitive tasks, mastery, skill development', meaningChinese: '学徒期，重复性任务，精通，技能发展', reversedMeaning: 'Self-development, perfectionism, misdirected effort', reversedMeaningChinese: '自我发展，完美主义，方向错误的努力' },
  { id: 72, name: 'Nine of Pentacles', nameChinese: '星币九', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Abundance, luxury, self-sufficiency, financial independence', meaningChinese: '丰富，奢侈，自给自足，财务独立', reversedMeaning: 'Self-worth, over-investment in work, hustle culture', reversedMeaningChinese: '自我价值，工作过度投入，忙碌文化' },
  { id: 73, name: 'Ten of Pentacles', nameChinese: '星币十', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Wealth, inheritance, family, establishment, retirement', meaningChinese: '财富，继承，家庭，企业，退休', reversedMeaning: 'Financial failure, loneliness, loss of family', reversedMeaningChinese: '财务失败，孤独，失去家庭' },
  { id: 74, name: 'Page of Pentacles', nameChinese: '星币侍从', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Manifestation, financial opportunity, skill development', meaningChinese: '显化，财务机会，技能发展', reversedMeaning: 'Lack of progress, procrastination, learn from failure', reversedMeaningChinese: '缺乏进展，拖延，从失败中学习' },
  { id: 75, name: 'Knight of Pentacles', nameChinese: '星币骑士', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Hard work, productivity, routine, conservatism', meaningChinese: '努力工作，高效，例行公事，保守主义', reversedMeaning: 'Self-discipline, boredom, feeling stuck', reversedMeaningChinese: '自律，枯燥，感觉停滞不前' },
  { id: 76, name: 'Queen of Pentacles', nameChinese: '星币皇后', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Nurturing, practical, providing, down-to-earth', meaningChinese: '养育，实际，提供，脚踏实地', reversedMeaning: 'Self-care, work-home conflict, financial independence', reversedMeaningChinese: '自我照顾，工作与家庭冲突，财务独立' },
  { id: 77, name: 'King of Pentacles', nameChinese: '星币国王', arcana: 'minor', suit: 'Pentacles', suitChinese: '星币', meaning: 'Wealth, business, leadership, security, discipline', meaningChinese: '财富，商业，领导力，安全，纪律', reversedMeaning: 'Financially inept, obsessed with wealth, stubborn', reversedMeaningChinese: '财务能力不足，财富 obsession, 固执' },
];

// Combine all cards into full deck
export const allCards: TarotCard[] = [
  ...majorArcana.map(card => ({ ...card })),
  ...wands,
  ...cups,
  ...swords,
  ...pentacles,
];

// Spread Layouts
export const spreadLayouts: SpreadLayout[] = [
  {
    name: 'Single Card',
    nameChinese: '单牌抽',
    description: 'A quick insight into your current situation or question',
    descriptionChinese: '快速了解你当前的情况或问题',
    cardCount: 1,
    positions: [
      { name: 'Present', nameChinese: '当前', description: 'Your current situation or the answer to your question', descriptionChinese: '你当前的情况或问题的答案' },
    ],
  },
  {
    name: 'Three Card',
    nameChinese: '三牌抽',
    description: 'Past, Present, and Future - explore timeline of your situation',
    descriptionChinese: '过去、现在和未来 - 探索你的情况时间线',
    cardCount: 3,
    positions: [
      { name: 'Past', nameChinese: '过去', description: 'What has led to this moment', descriptionChinese: '什么导致了这一刻' },
      { name: 'Present', nameChinese: '现在', description: 'Your current situation', descriptionChinese: '你当前的情况' },
      { name: 'Future', nameChinese: '未来', description: 'What is likely to unfold', descriptionChinese: '可能发生的事' },
    ],
  },
  {
    name: 'Celtic Cross',
    nameChinese: '凯尔特十字',
    description: 'A comprehensive 10-card spread for deep insight',
    descriptionChinese: '深入的10牌扩展阅读',
    cardCount: 10,
    positions: [
      { name: 'Significator', nameChinese: '核心', description: 'The central issue or querent', descriptionChinese: '核心问题或问卜者' },
      { name: 'Challenge', nameChinese: '挑战', description: 'Crossing challenge or obstacle', descriptionChinese: '横亘的挑战或障碍' },
      { name: 'Foundation', nameChinese: '基础', description: 'The basis or foundation of the situation', descriptionChinese: '情况的基础或根基' },
      { name: 'Past', nameChinese: '过去', description: 'Recent past events', descriptionChinese: '最近的过去事件' },
      { name: 'Crown', nameChinese: '可能', description: 'Possible outcome or hope for future', descriptionChinese: '可能的结果或对未来的希望' },
      { name: 'Near Future', nameChinese: '即将', description: 'What is approaching', descriptionChinese: '即将发生的事' },
      { name: 'Self', nameChinese: '自我', description: 'The querent position or self-view', descriptionChinese: '问卜者的位置或自我认知' },
      { name: 'Environment', nameChinese: '环境', description: 'Environmental factors', descriptionChinese: '环境因素' },
      { name: 'Hopes & Fears', nameChinese: '希望与恐惧', description: 'Hidden hopes and fears', descriptionChinese: '隐藏的希望和恐惧' },
      { name: 'Outcome', nameChinese: '结果', description: 'Final outcome', descriptionChinese: '最终结果' },
    ],
  },
];

// Helper functions
export function shuffleDeck(): TarotCard[] {
  const shuffled = [...allCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(shuffle: TarotCard[], count: number): { cards: TarotCard[]; isReversed: boolean[] } {
  const cards = shuffle.slice(0, count);
  const isReversed = cards.map(() => Math.random() > 0.5);
  return { cards, isReversed };
}

export function interpretCard(card: TarotCard, isReversed: boolean, language: 'en' | 'zh' = 'en'): string {
  if (language === 'zh') {
    return isReversed ? card.reversedMeaningChinese : card.meaningChinese;
  }
  return isReversed ? card.reversedMeaning : card.meaning;
}

export function getRandomCard(): { card: TarotCard; isReversed: boolean } {
  const shuffled = shuffleDeck();
  const isReversed = Math.random() > 0.5;
  return { card: shuffled[0], isReversed };
}

export function getCardById(id: number): TarotCard | undefined {
  return allCards.find(card => card.id === id);
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: number;
  positionName: string;
  positionNameChinese: string;
  interpretation: string;
}
