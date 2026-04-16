import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for Chinese support
Font.register({
  family: 'NotoSansSC',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeALhLOCT-xWNm8Hqd37g1OkDRZe7lR4sg1IzSy-MNbE9VQ8.0.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeALhLOCT-xWNm8Hqd37g1OkDRZe7lR4sg1IzSy-MNbE9VQ8.0.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  // Page
  page: {
    backgroundColor: '#0F172A',
    padding: 40,
    fontFamily: 'NotoSansSC',
  },
  pageDark: {
    backgroundColor: '#0F172A',
  },

  // Cover Page
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  logo: {
    fontSize: 36,
    fontWeight: 700,
    color: '#B8860B',
    marginBottom: 8,
  },
  logoSub: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 40,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#B8860B',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B8860B',
    paddingBottom: 6,
  },

  // Cards / Boxes
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#B8860B',
    marginBottom: 8,
  },

  // Text
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  body: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  gold: {
    color: '#B8860B',
  },
  white: {
    color: '#FFFFFF',
  },
  gray: {
    color: '#94A3B8',
  },

  // Grid layouts
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    marginBottom: 8,
  },
  gridItemSmall: {
    width: '31%',
    marginBottom: 8,
  },

  // Pillars (BaZi)
  pillarRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pillarCell: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillarLabel: {
    fontSize: 10,
    color: '#B8860B',
    marginBottom: 4,
  },
  pillarValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  pillarElement: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Bar charts
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    width: 24,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barValue: {
    fontSize: 10,
    color: '#CBD5E1',
    width: 16,
    textAlign: 'right',
  },

  // Element colors
  elementWood: { color: '#22C55E' },
  elementFire: { color: '#EF4444' },
  elementEarth: { color: '#EAB308' },
  elementMetal: { color: '#94A3B8' },
  elementWater: { color: '#3B82F6' },

  // Tarot cards
  tarotCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tarotCardName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tarotCardMeaning: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Synastry
  aspectRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },

  // Footer / Disclaimer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },
  disclaimer: {
    fontSize: 8,
    color: '#475569',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: '#475569',
  },

  // Score display
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#B8860B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#B8860B',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },

  // Hexagram
  hexagramRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  yaoLine: {
    height: 12,
    backgroundColor: '#B8860B',
    marginBottom: 3,
    borderRadius: 2,
  },
  yaoLineYin: {
    height: 12,
    marginBottom: 3,
    borderTopWidth: 2,
    borderTopColor: '#B8860B',
    borderBottomWidth: 2,
    borderBottomColor: '#B8860B',
    borderRadius: 2,
  },

  // Interpretation box
  interpretationBox: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#B8860B',
  },
  interpretationTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#B8860B',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 10,
    color: '#E2E8F0',
    lineHeight: 1.7,
  },
});

// Helper to get element color
function getElementColor(element: string): string {
  const map: Record<string, string> = {
    '木': '#22C55E', '火': '#EF4444', '土': '#EAB308', '金': '#94A3B8', '水': '#3B82F6',
    'Wood': '#22C55E', 'Fire': '#EF4444', 'Earth': '#EAB308', 'Metal': '#94A3B8', 'Water': '#3B82F6',
  };
  return map[element] || '#FFFFFF';
}

// Helper to get element bar color
function getElementBarColor(element: string): string {
  const map: Record<string, string> = {
    '木': '#22C55E', '火': '#EF4444', '土': '#EAB308', '金': '#94A3B8', '水': '#3B82F6',
  };
  return map[element] || '#B8860B';
}

// ─── Cover Page Component ────────────────────────────────────────────────────

interface CoverPageProps {
  title: string;
  userName?: string;
  date: string;
  language: 'zh' | 'en';
}

function CoverPage({ title, userName, date, language }: CoverPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <Text style={styles.logo}>天机全球 TianJi Global</Text>
        <Text style={styles.logoSub}>AI Fortune Platform · AI命理平台</Text>
        <Text style={styles.coverTitle}>{title}</Text>
        {userName && (
          <Text style={styles.coverSubtitle}>
            {language === 'zh' ? '用户' : 'User'}: {userName}
          </Text>
        )}
        <Text style={styles.coverSubtitle}>
          {language === 'zh' ? '生成日期' : 'Generated'}: {date}
        </Text>
        <Text style={styles.coverDate}>tianji.global</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>本报告仅供娱乐参考，不构成任何决策依据 | For entertainment only. Not financial or life advice.</Text>
      </View>
    </Page>
  );
}

// ─── Summary Page Components ─────────────────────────────────────────────────

interface BaZiSummaryData {
  chart: {
    year: { heavenlyStem: string; earthlyBranch: string; element: string };
    month: { heavenlyStem: string; earthlyBranch: string; element: string };
    day: { heavenlyStem: string; earthlyBranch: string; element: string };
    hour: { heavenlyStem: string; earthlyBranch: string; element: string };
    dayMasterElement: string;
  };
  interpretation: string;
  aiInterpretation?: string;
}

interface BaZiSummaryProps {
  data: BaZiSummaryData;
  elementCounts: Record<string, number>;
  luckyElements?: string[];
  luckyNumbers?: number[];
  luckyColors?: string[];
  language: 'zh' | 'en';
}

function BaZiSummary({ data, elementCounts, luckyElements, luckyNumbers, luckyColors, language }: BaZiSummaryProps) {
  const pillars = [data.chart.year, data.chart.month, data.chart.day, data.chart.hour];
  const pillarLabels = language === 'zh' ? ['年柱', '月柱', '日柱', '时柱'] : ['Year', 'Month', 'Day', 'Hour'];
  const maxCount = 4;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>{language === 'zh' ? '命盘概览' : 'Chart Overview'}</Text>

      {/* Four Pillars */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === 'zh' ? '四柱八字' : 'Four Pillars'}</Text>
        <View style={styles.grid}>
          {pillars.map((pillar, i) => (
            <View key={i} style={styles.gridItem}>
              <Text style={styles.pillarLabel}>{pillarLabels[i]}</Text>
              <View style={styles.pillarCell}>
                <Text style={styles.pillarValue}>{pillar.heavenlyStem}{pillar.earthlyBranch}</Text>
                <Text style={[styles.pillarElement, { color: getElementColor(pillar.element) }]}>
                  {pillar.element}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Five Elements Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === 'zh' ? '五行分布' : 'Five Elements'}</Text>
        {(['木', '火', '土', '金', '水'] as const).map((element) => {
          const count = elementCounts[element] || 0;
          const pct = (count / maxCount) * 100;
          const labels = { 木: language === 'zh' ? '木 Wood' : 'Wood', 火: language === 'zh' ? '火 Fire' : 'Fire', 土: language === 'zh' ? '土 Earth' : 'Earth', 金: language === 'zh' ? '金 Metal' : 'Metal', 水: language === 'zh' ? '水 Water' : 'Water' };
          return (
            <View key={element} style={styles.barRow}>
              <Text style={styles.barLabel}>{labels[element].split(' ')[0]}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: getElementBarColor(element) }]} />
              </View>
              <Text style={styles.barValue}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Lucky info */}
      {(luckyElements?.length || luckyNumbers?.length || luckyColors?.length) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{language === 'zh' ? '幸运信息' : 'Lucky Info'}</Text>
          <View style={styles.grid}>
            {luckyElements && luckyElements.length > 0 && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>{language === 'zh' ? '幸运元素' : 'Lucky Elements'}</Text>
                <Text style={styles.body}>{luckyElements.join(', ')}</Text>
              </View>
            )}
            {luckyNumbers && luckyNumbers.length > 0 && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>{language === 'zh' ? '幸运数字' : 'Lucky Numbers'}</Text>
                <Text style={styles.body}>{luckyNumbers.join(', ')}</Text>
              </View>
            )}
            {luckyColors && luckyColors.length > 0 && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>{language === 'zh' ? '幸运颜色' : 'Lucky Colors'}</Text>
                <Text style={styles.body}>{luckyColors.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Brief Interpretation */}
      {data.interpretation && (
        <View style={styles.interpretationBox}>
          <Text style={styles.interpretationTitle}>{language === 'zh' ? '命理简析' : 'Interpretation'}</Text>
          <Text style={styles.interpretationText}>{data.interpretation}</Text>
        </View>
      )}

      {/* AI Interpretation */}
      {data.aiInterpretation && (
        <View style={styles.interpretationBox}>
          <Text style={styles.interpretationTitle}>✨ AI {language === 'zh' ? '深度解读' : 'Deep Interpretation'}</Text>
          <Text style={styles.interpretationText}>{data.aiInterpretation}</Text>
        </View>
      )}

      <Text style={styles.pageNumber}>2</Text>
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>本报告仅供娱乐参考，不构成任何决策依据 | For entertainment only. Not financial or life advice.</Text>
      </View>
    </Page>
  );
}

// ─── Tarot Summary ───────────────────────────────────────────────────────────

interface TarotSummaryProps {
  spread: { name: string; positions: { name: string; meaning: string }[] };
  drawnCards: Array<{
    card: { name: string; nameEn: string; meaning: string; meaningEn: string; suit?: string };
    position: number;
    isReversed: boolean;
  }>;
  question?: string;
  aiInterpretation?: string;
  language: 'zh' | 'en';
}

function TarotSummary({ spread, drawnCards, question, aiInterpretation, language }: TarotSummaryProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>{language === 'zh' ? '塔罗牌解读' : 'Tarot Reading'}</Text>

      {question && (
        <View style={styles.card}>
          <Text style={styles.label}>{language === 'zh' ? '问题' : 'Question'}</Text>
          <Text style={styles.body}>{question}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{spread.name}</Text>
        {drawnCards.map((drawn, i) => (
          <View key={i} style={styles.tarotCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tarotCardName}>
                {drawn.card.nameEn || drawn.card.name} {drawn.isReversed ? ' (R)' : ''}
              </Text>
              <Text style={styles.tarotCardMeaning}>
                {language === 'zh' ? drawn.card.meaning : (drawn.card.meaningEn || drawn.card.meaning)}
              </Text>
              <Text style={styles.label}>
                {spread.positions[i]?.name}: {language === 'zh' ? spread.positions[i]?.meaning : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {aiInterpretation && (
        <View style={styles.interpretationBox}>
          <Text style={styles.interpretationTitle}>✨ AI {language === 'zh' ? '解读' : 'Interpretation'}</Text>
          <Text style={styles.interpretationText}>{aiInterpretation}</Text>
        </View>
      )}

      <Text style={styles.pageNumber}>2</Text>
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>本报告仅供娱乐参考，不构成任何决策依据 | For entertainment only. Not financial or life advice.</Text>
      </View>
    </Page>
  );
}

// ─── Yijing Summary ─────────────────────────────────────────────────────────

interface YijingSummaryProps {
  hexagram: {
    number: number;
    name: string;
    pinyin: string;
    english: string;
    judgement: string;
    image?: string;
    changingLines?: Array<{ line: number; value: number; isYang: boolean; isChanging: boolean; meaning: string; meaningEn: string }>;
  };
  aiInterpretation?: string;
  language: 'zh' | 'en';
}

function YijingSummary({ hexagram, aiInterpretation, language }: YijingSummaryProps) {
  const yaoValues = [
    (hexagram.judgement || '').split('').filter(c => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(c)).map(Number),
  ].flat();

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>{language === 'zh' ? '易经卦象' : 'I Ching Hexagram'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {hexagram.name} ({hexagram.pinyin}) — {hexagram.english}
        </Text>
        <Text style={styles.label}>第{hexagram.number}卦</Text>

        {/* Hexagram visual - 6 yaos from bottom to top */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          {yaoValues.slice(0, 6).map((val, i) => (
            <View key={i} style={styles.hexagramRow}>
              {val === 1 || val === 3 || val === 5 || val === 7 || val === 9 ? (
                <View style={[styles.yaoLine, { width: 100 }]} />
              ) : (
                <View style={{ flexDirection: 'row', width: 100, justifyContent: 'center' }}>
                  <View style={[styles.yaoLine, { flex: 1 }]} />
                  <View style={{ width: 10 }} />
                  <View style={[styles.yaoLine, { flex: 1 }]} />
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.label}>{language === 'zh' ? '卦辞' : 'Judgement'}</Text>
        <Text style={styles.body}>{hexagram.judgement}</Text>

        {hexagram.image && (
          <>
            <Text style={styles.label}>{language === 'zh' ? '象曰' : 'Image'}</Text>
            <Text style={styles.body}>{hexagram.image}</Text>
          </>
        )}

        {hexagram.changingLines?.map((line, i) => (
          <View key={i} style={{ marginTop: 8 }}>
            <Text style={styles.label}>{language === 'zh' ? `第${line.line}爻` : `Line ${line.line}`} {line.isChanging ? '✦' : ''}</Text>
            <Text style={styles.body}>{language === 'zh' ? line.meaning : (line.meaningEn || line.meaning)}</Text>
          </View>
        ))}
      </View>

      {aiInterpretation && (
        <View style={styles.interpretationBox}>
          <Text style={styles.interpretationTitle}>✨ AI {language === 'zh' ? '解读' : 'Interpretation'}</Text>
          <Text style={styles.interpretationText}>{aiInterpretation}</Text>
        </View>
      )}

      <Text style={styles.pageNumber}>2</Text>
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>本报告仅供娱乐参考，不构成任何决策依据 | For entertainment only. Not financial or life advice.</Text>
      </View>
    </Page>
  );
}

// ─── Synastry Summary ────────────────────────────────────────────────────────

interface SynastrySummaryProps {
  person1: { name: string; chart: { planets: Array<{ name: string; signName: string; signSymbol: string }>; houses: { ascendant: number; midheaven: number } } };
  person2: { name: string; chart: { planets: Array<{ name: string; signName: string; signSymbol: string }>; houses: { ascendant: number; midheaven: number } } };
  aspects: Array<{ planet1: string; planet2: string; type: string; exactAngle: number; orb: number }>;
  overallScore: number;
  aiInterpretation?: string;
  language: 'zh' | 'en';
}

function SynastrySummary({ person1, person2, aspects, overallScore, aiInterpretation, language }: SynastrySummaryProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>{language === 'zh' ? '合盘分析' : 'Synastry Analysis'}</Text>

      {/* Overall Score */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === 'zh' ? '整体契合度' : 'Overall Compatibility'}</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{overallScore}%</Text>
          </View>
        </View>
      </View>

      {/* Both charts */}
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{person1.name}</Text>
            <Text style={styles.label}>{language === 'zh' ? '行星位置' : 'Planet Positions'}</Text>
            {person1.chart.planets.slice(0, 6).map((p, i) => (
              <Text key={i} style={styles.body}>{p.signSymbol} {p.name}: {p.signName}</Text>
            ))}
            <Text style={styles.label}>{language === 'zh' ? '上升点' : 'Ascendant'}: {person1.chart.houses.ascendant}°</Text>
            <Text style={styles.label}>{language === 'zh' ? '天顶' : 'Midheaven'}: {person1.chart.houses.midheaven}°</Text>
          </View>
        </View>
        <View style={styles.column}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{person2.name}</Text>
            <Text style={styles.label}>{language === 'zh' ? '行星位置' : 'Planet Positions'}</Text>
            {person2.chart.planets.slice(0, 6).map((p, i) => (
              <Text key={i} style={styles.body}>{p.signSymbol} {p.name}: {p.signName}</Text>
            ))}
            <Text style={styles.label}>{language === 'zh' ? '上升点' : 'Ascendant'}: {person2.chart.houses.ascendant}°</Text>
            <Text style={styles.label}>{language === 'zh' ? '天顶' : 'Midheaven'}: {person2.chart.houses.midheaven}°</Text>
          </View>
        </View>
      </View>

      {/* Aspects */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === 'zh' ? '主要相位' : 'Key Aspects'}</Text>
        {aspects.slice(0, 8).map((aspect, i) => (
          <View key={i} style={styles.aspectRow}>
            <Text style={[styles.body, { flex: 1 }]}>{aspect.planet1} {aspect.type} {aspect.planet2}</Text>
            <Text style={styles.label}>{aspect.exactAngle.toFixed(1)}°</Text>
            <Text style={styles.label}> orb: {aspect.orb.toFixed(1)}°</Text>
          </View>
        ))}
      </View>

      {aiInterpretation && (
        <View style={styles.interpretationBox}>
          <Text style={styles.interpretationTitle}>✨ AI {language === 'zh' ? '解读' : 'Interpretation'}</Text>
          <Text style={styles.interpretationText}>{aiInterpretation}</Text>
        </View>
      )}

      <Text style={styles.pageNumber}>2</Text>
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>本报告仅供娱乐参考，不构成任何决策依据 | For entertainment only. Not financial or life advice.</Text>
      </View>
    </Page>
  );
}

// ─── Main PDF Document ────────────────────────────────────────────────────────

export type ServiceType = 'bazi' | 'ziwei' | 'yijing' | 'tarot' | 'fortune' | 'synastry' | 'numerology';

export interface PDFReportData {
  serviceType: ServiceType;
  title: string;
  userName?: string;
  birthData?: {
    birthday?: string;
    birthTime?: string;
    gender?: string;
  };
  resultData: Record<string, unknown>;
  includeAiInterpretation?: boolean;
  language?: 'zh' | 'en';
  // BaZi specific
  elementCounts?: Record<string, number>;
  luckyElements?: string[];
  luckyNumbers?: number[];
  luckyColors?: string[];
}

interface PDFReportProps {
  data: PDFReportData;
}

function countElementsForBaZi(chart: BaZiSummaryData['chart']): Record<string, number> {
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  counts[chart.year.element]++;
  counts[chart.month.element]++;
  counts[chart.day.element]++;
  counts[chart.hour.element]++;
  return counts;
}

export function PDFReport({ data }: PDFReportProps) {
  const lang = data.language || 'zh';
  const today = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const titleMap: Record<string, string> = {
    bazi: lang === 'zh' ? '八字命理报告' : 'Ba Zi Report',
    ziwei: lang === 'zh' ? '紫微斗数报告' : 'Zi Wei Report',
    yijing: lang === 'zh' ? '易经卦象报告' : 'I Ching Report',
    tarot: lang === 'zh' ? '塔罗牌报告' : 'Tarot Report',
    fortune: lang === 'zh' ? '财富运势报告' : 'Fortune Report',
    synastry: lang === 'zh' ? '合盘分析报告' : 'Synastry Report',
  };

  return (
    <Document>
      {/* Cover Page */}
      <CoverPage
        title={titleMap[data.serviceType] || data.title}
        userName={data.userName}
        date={today}
        language={lang}
      />

      {/* BaZi */}
      {data.serviceType === 'bazi' && (
        <BaZiSummary
          data={data.resultData as unknown as BaZiSummaryData}
          elementCounts={data.elementCounts || countElementsForBaZi((data.resultData as unknown as BaZiSummaryData).chart)}
          luckyElements={data.luckyElements}
          luckyNumbers={data.luckyNumbers}
          luckyColors={data.luckyColors}
          language={lang}
        />
      )}

      {/* Tarot */}
      {data.serviceType === 'tarot' && (
        <TarotSummary
          spread={(data.resultData as { spread: TarotSummaryProps['spread'] }).spread}
          drawnCards={(data.resultData as { drawnCards: TarotSummaryProps['drawnCards'] }).drawnCards}
          question={(data.resultData as { question?: string }).question}
          aiInterpretation={data.includeAiInterpretation ? (data.resultData as { aiInterpretation?: string }).aiInterpretation : undefined}
          language={lang}
        />
      )}

      {/* Yijing */}
      {data.serviceType === 'yijing' && (
        <YijingSummary
          hexagram={(data.resultData as { hexagram: YijingSummaryProps['hexagram'] }).hexagram}
          aiInterpretation={data.includeAiInterpretation ? (data.resultData as { aiInterpretation?: string }).aiInterpretation : undefined}
          language={lang}
        />
      )}

      {/* Synastry */}
      {data.serviceType === 'synastry' && (
        <SynastrySummary
          person1={(data.resultData as { person1: SynastrySummaryProps['person1'] }).person1}
          person2={(data.resultData as { person2: SynastrySummaryProps['person2'] }).person2}
          aspects={(data.resultData as { aspects: SynastrySummaryProps['aspects'] }).aspects}
          overallScore={(data.resultData as { overallScore: number }).overallScore}
          aiInterpretation={data.includeAiInterpretation ? (data.resultData as { aiInterpretation?: string }).aiInterpretation : undefined}
          language={lang}
        />
      )}

      {/* Generic Detail Page for unknown types */}
      {!['bazi', 'tarot', 'yijing', 'synastry'].includes(data.serviceType) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{data.title}</Text>
          <View style={styles.card}>
            <Text style={styles.body}>{JSON.stringify(data.resultData, null, 2)}</Text>
          </View>
          <Text style={styles.pageNumber}>2</Text>
          <View style={styles.footer}>
            <Text style={styles.disclaimer}>本报告仅供娱乐参考，不构成任何决策依据 | For entertainment only. Not financial or life advice.</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

export { styles };
