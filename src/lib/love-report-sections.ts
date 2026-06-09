/**
 * Love Report Section Builder
 *
 * Builds an 8-section paid love reading report from parsed analysis data.
 * Language-aware (en/zh). Tone: warm, specific, not deterministic.
 * No fear-mongering. No medical/legal/financial advice.
 */

export type RelationshipEnergy = 'warm' | 'blocked' | 'uncertain' | 'fading' | 'magnetic';
export type MainBlockage = 'fear' | 'pride' | 'distance' | 'third-party' | 'emotional-exhaustion';
export type ReconciliationPotential = 'low' | 'medium' | 'high';
export type BestNextStep = 'text' | 'wait' | 'clarify' | 'move-on' | 'observe';

export interface LoveReportInput {
  relationshipEnergy: RelationshipEnergy;
  whatTheyMayBeFeeling: string;
  whatTheyAreNotSaying: string;
  mainBlockage: MainBlockage;
  reconciliationPotential: ReconciliationPotential;
  timingGuidance: string;
  bestNextStep: BestNextStep;
  finalMessage: string;
  language: 'en' | 'zh';
}

export type LoveReportSection = {
  title: string;
  body: string;
  emoji: string;
};

export type LoveReportSections = LoveReportSection[];

// ─── Energy label map ─────────────────────────────────────────────────────────

const ENERGY_LABELS_EN: Record<RelationshipEnergy, string> = {
  warm: 'Current Relationship Energy',
  blocked: 'Relationship Barrier',
  uncertain: 'Uncertain Ground',
  fading: 'Cooling Connection',
  magnetic: 'Magnetic Pull',
};

const ENERGY_LABELS_ZH: Record<RelationshipEnergy, string> = {
  warm: '当前情感能量',
  blocked: '关系障碍',
  uncertain: '摇摆不定',
  fading: '渐行渐远',
  magnetic: '相互吸引',
};

// ─── Blockage label map ───────────────────────────────────────────────────────

const BLOCKAGE_LABELS_EN: Record<MainBlockage, string> = {
  fear: 'Fear of vulnerability or rejection',
  pride: 'Pride and unwillingness to bend',
  distance: 'Emotional or physical distance',
  'third-party': 'Third-party involvement or pressure',
  'emotional-exhaustion': 'Emotional exhaustion or burnout',
};

const BLOCKAGE_LABELS_ZH: Record<MainBlockage, string> = {
  fear: '害怕受伤或被拒绝',
  pride: '自尊心强，不愿妥协',
  distance: '情感或物理上的疏离',
  'third-party': '第三方介入或压力',
  'emotional-exhaustion': '情感倦怠或心力交瘁',
};

// ─── Potential label map ───────────────────────────────────────────────────────

const POTENTIAL_LABELS_EN: Record<ReconciliationPotential, { label: string; guidance: string }> = {
  low: {
    label: 'Low Reconciliation Potential',
    guidance: 'This connection shows limited signs of natural reconciliation in the near term.',
  },
  medium: {
    label: 'Medium Reconciliation Potential',
    guidance: 'There are openings present — progress is possible with the right approach.',
  },
  high: {
    label: 'High Reconciliation Potential',
    guidance: 'The conditions for reconnection are present. Timing and tone matter most now.',
  },
};

const POTENTIAL_LABELS_ZH: Record<ReconciliationPotential, { label: string; guidance: string }> = {
  low: {
    label: '复合可能性较低',
    guidance: '这段关系近期自然复合的迹象有限。',
  },
  medium: {
    label: '复合可能性中等',
    guidance: '存在转机——采取正确的方式有可能推进关系。',
  },
  high: {
    label: '复合可能性较高',
    guidance: '重新连接的条件已具备。时机的把握和沟通方式尤为重要。',
  },
};

// ─── Step label map ────────────────────────────────────────────────────────────

const STEP_LABELS_EN: Record<BestNextStep, string> = {
  text: 'Send a message',
  wait: 'Wait patiently',
  clarify: 'Clarify your intentions',
  'move-on': 'Focus on yourself',
  observe: 'Observe and wait',
};

const STEP_LABELS_ZH: Record<BestNextStep, string> = {
  text: '发送一条消息',
  wait: '耐心等待',
  clarify: '明确自己的心意',
  'move-on': '专注自我成长',
  observe: '观察并等待',
};

// ─── Section builders ─────────────────────────────────────────────────────────

function buildSection1(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';
  const energyLabel = isZh
    ? ENERGY_LABELS_ZH[input.relationshipEnergy]
    : ENERGY_LABELS_EN[input.relationshipEnergy];

  const bodyEn = `The energy between you right now reads as **${input.relationshipEnergy}**. ${energyLabel}.

This doesn't mean a fixed outcome is destined — rather, it reflects the current emotional texture between you. Relationships shift, and the way you show up in the next few weeks can influence the direction.

*What this energy suggests about the dynamic:*
${input.whatTheyMayBeFeeling}`;

  const bodyZh = `你们之间的能量目前呈现为 **${input.relationshipEnergy}**（${energyLabel}）。

这并不意味着结果已经注定——它更多反映的是你们之间当前的情感状态。关系是流动的，你在接下来几周的态度和行动会影响它的走向。

*这种能量所暗示的关系状态：*
${input.whatTheyMayBeFeeling}`;

  return {
    title: isZh ? '一、当前关系能量' : '1. Current Relationship Energy',
    body: isZh ? bodyZh : bodyEn,
    emoji: '💕',
  };
}

function buildSection2(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';

  const bodyEn = `Beneath the surface, there are feelings that haven't found their way out yet. This isn't unusual — many people hold back parts of themselves when the stakes feel high.

*What they may be feeling but not expressing:*
${input.whatTheyAreNotSaying}

This doesn't mean they don't care. Often, silence is a form of self-protection rather than disinterest. Understanding this can help you respond with more patience and less assumption.`;

  const bodyZh = `在表面之下，有些感受还没有找到出口。这很常见——当感觉至关重要时，很多人会隐藏自己的真实想法。

*TA可能有的感受，却未能表达：*
${input.whatTheyAreNotSaying}

这并不意味着TA不在乎。通常，沉默是一种自我保护，而非缺乏兴趣。理解这一点能帮助你以更多的耐心和更少的揣测来回应。`;

  return {
    title: isZh ? '二、他们内心的真实感受' : '2. What They May Be Feeling',
    body: isZh ? bodyZh : bodyEn,
    emoji: '🫧',
  };
}

function buildSection3(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';
  const blockageLabel = isZh
    ? BLOCKAGE_LABELS_ZH[input.mainBlockage]
    : BLOCKAGE_LABELS_EN[input.mainBlockage];

  const bodyEn = `Every relationship that feels stuck has a core tension underneath. Right now, the main blockage between you appears to be **${input.mainBlockage}** — specifically: ${blockageLabel}.

Understanding the nature of the obstacle is the first step. It's not about blame; it's about seeing clearly so you can decide how (or whether) to move forward.

*Key insight:*
This blockage is not permanent. Patterns shift when the people in them choose to act differently. But you can only control your own choices, not theirs.`;

  const bodyZh = `每段看似停滞的关系，背后都有一个核心张力。目前，你们之间的主要障碍似乎来自 **${input.mainBlockage}**——具体来说：${blockageLabel}。

看清障碍的本质是第一步。这不是为了归咎于谁，而是为了更清楚地了解现状，从而决定如何（或是否）继续前进。

*核心洞察：*
这个障碍并非永久不变。当关系中的人选择不同的行动时，模式也会改变。但你只能控制自己的选择，无法控制对方的选择。`;

  return {
    title: isZh ? '三、主要情感障碍' : '3. Main Blockage in the Relationship',
    body: isZh ? bodyZh : bodyEn,
    emoji: '🔒',
  };
}

function buildSection4(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';
  const potential = POTENTIAL_LABELS_EN[input.reconciliationPotential];
  const potentialZh = POTENTIAL_LABELS_ZH[input.reconciliationPotential];

  const bodyEn = `Based on the current dynamics, the reconciliation potential for your situation is **${input.reconciliationPotential}**.

${potential.guidance}

This reading reflects the present energetic landscape — not a fixed verdict. Many people have moved from "low" to "medium" or "high" potential simply by changing how they showed up in the relationship.`;

  const bodyZh = `根据当前的动态发展，你们复合的可能性为 **${input.reconciliationPotential}**。

${potentialZh.guidance}

这个解读反映的是当前的能量状态——而非固定的结论。许多人通过改变自己在关系中的表现方式，成功地将复合可能性从"低"提升到"中"甚至"高"。`;

  return {
    title: isZh ? '四、复合可能性评估' : '4. Reconciliation Potential',
    body: isZh ? bodyZh : bodyEn,
    emoji: '📊',
  };
}

function buildSection5(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';

  const bodyEn = `Timing is not everything, but it matters. The next **${input.timingGuidance}** offers a notable window for your next move.

Rather than forcing something before it feels ready, look for natural openings. The right timing often shows up as a sense of internal ease — not pressure.

*Timing guidance:*
${input.timingGuidance}

If a deadline feels anxiety-inducing rather than clarifying, that's a sign to slow down and reconnect with your own clarity first.`;

  const bodyZh = `时机不是一切，但它很重要。接下来的 **${input.timingGuidance}** 为你的下一步行动提供了一个值得注意的窗口。

与其在时机成熟之前强求，不如等待自然的契机。正确的时机往往表现为内心的轻松感——而非压力。

*时机指引：*
${input.timingGuidance}

如果某个期限让你感到焦虑而非清晰，那是放慢脚步、先与自己重新连接的信号。`;

  return {
    title: isZh ? '五、时机指引' : '5. Timing Guidance',
    body: isZh ? bodyZh : bodyEn,
    emoji: '⏳',
  };
}

function buildSection6(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';
  const stepLabel = isZh ? STEP_LABELS_ZH[input.bestNextStep] : STEP_LABELS_EN[input.bestNextStep];

  const bodyEn = `The most constructive next step right now appears to be: **${stepLabel}**.

This isn't a prescription — it's a reflection based on where things are now. The goal is to act from a place of groundedness rather than reaction.

*What this step looks like in practice:*
- Don't rush into a big conversation if things feel fragile
- Stay honest with yourself about your own motivations
- Give space where space is needed, and reach out where reach is appropriate

Small, honest moves tend to be more powerful than dramatic gestures in uncertain times.`;

  const bodyZh = `目前最具建设性的下一步似乎是：**${stepLabel}**。

这不是处方——而是基于现状的分析。目标是出于踏实而非反应来行动。

*这一步在实践中的含义：*
- 如果感情尚脆弱，不要急于展开重要对话
- 对自己的动机保持诚实
- 需要空间时给予空间，需要联系时主动联系

在不确定的时期，小而真诚的行动往往比戏剧性的举动更有力。`;

  return {
    title: isZh ? '六、下一步行动建议' : '6. Best Next Step',
    body: isZh ? bodyZh : bodyEn,
    emoji: '🎯',
  };
}

function buildSection7(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';

  const bodyEn = `Whatever the outcome of this situation, this is also an invitation to reflect on what you want and need — not just what you're hoping for from the other person.

*Reflection prompts:*
- What am I learning about myself through this situation?
- Am I acting from love, or from fear of losing something?
- What would I do if I trusted myself completely?
- How do I want to feel about myself regardless of how this unfolds?

Answers don't need to be perfect. Even sitting with these questions can bring unexpected clarity.`;

  const bodyZh = `无论这件事的结果如何，这同样是一个邀请——让你反思自己真正想要和需要的是什么，而不仅仅是期盼对方给你什么。

*反思问题：*
- 通过这件事，我对自己有什么新的了解？
- 我是在出于爱行动，还是出于对失去的恐惧？
- 如果我完全信任自己，我会怎么做？
- 无论结果如何，我希望自己以什么态度面对？

答案不需要完美。即使只是静静思考这些问题，也能带来意想不到的清晰感。`;

  return {
    title: isZh ? '七、个人反思问题' : '7. Reflection Questions',
    body: isZh ? bodyZh : bodyEn,
    emoji: '💭',
  };
}

function buildSection8(input: LoveReportInput): LoveReportSection {
  const isZh = input.language === 'zh';

  const bodyEn = `This reading is an offering of perspective, not a verdict. Relationships are living, breathing things — they change when the people in them change.

**${input.finalMessage}**

Trust yourself to navigate this with honesty and patience. You're looking at this because you care enough to seek clarity. That itself says something important.

*Practical reminder:*
This report does not constitute medical, legal, financial, or mental health advice. If you're in crisis, please reach out to a qualified professional.`;

  const bodyZh = `这份解读是一份视角的提供，而非定论。关系是活的——当其中的人改变时，关系也会改变。

**${input.finalMessage}**

相信自己能够以诚实和耐心来面对这件事。你愿意寻求清晰，说明你足够在乎。这本身就是一个重要的信号。

*温馨提示：*
本报告不构成医疗、法律、金融或心理健康建议。如果你正处于危机中，请寻求专业人士的帮助。`;

  return {
    title: isZh ? '八、温暖寄语' : '8. A Note for You',
    body: isZh ? bodyZh : bodyEn,
    emoji: '🌿',
  };
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Build an 8-section love reading report.
 * Pure function — no side effects, no API calls.
 */
export function buildLoveReportSections(input: LoveReportInput): LoveReportSections {
  return [
    buildSection1(input),
    buildSection2(input),
    buildSection3(input),
    buildSection4(input),
    buildSection5(input),
    buildSection6(input),
    buildSection7(input),
    buildSection8(input),
  ];
}

// ─── Dev test ─────────────────────────────────────────────────────────────────

function runDevTest() {
  const mock: LoveReportInput = {
    relationshipEnergy: 'blocked',
    whatTheyMayBeFeeling: 'They feel caught between wanting to reach out and fearing rejection. There is unspoken guilt about how things ended.',
    whatTheyAreNotSaying: 'They have been thinking about you more than they let on, but pride keeps them from making the first move. They wonder if you still think about them.',
    mainBlockage: 'pride',
    reconciliationPotential: 'medium',
    timingGuidance: '10–20 days',
    bestNextStep: 'observe',
    finalMessage: 'You are not stuck — you are being asked to grow. Trust the process, and trust yourself.',
    language: 'en',
  };

  console.log('\n=== Love Report Sections (EN) ===\n');
  const sections = buildLoveReportSections(mock);
  sections.forEach((s, i) => {
    console.log(`[${i + 1}] ${s.emoji} ${s.title}`);
    console.log(s.body);
    console.log('---');
  });

  const mockZh: LoveReportInput = { ...mock, language: 'zh' };
  console.log('\n=== 感情报告 sections (ZH) ===\n');
  const sectionsZh = buildLoveReportSections(mockZh);
  sectionsZh.forEach((s, i) => {
    console.log(`[${i + 1}] ${s.emoji} ${s.title}`);
    console.log(s.body);
    console.log('---');
  });
}

// Export for external testing
export { runDevTest };