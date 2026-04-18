/**
 * Narrative Composer v2 — Liz Greene-style report structure
 * 
 * Key principles:
 * 1. Hook-first: open with imagery/metaphor, not conclusion
 * 2. Layered depth: each theme has time/context/interpretation/action
 * 3. Cultural coherence: no cross-system contamination
 * 4. Empowering closure: forward-looking, actionable
 */

export interface NarrativeTheme {
  id: string;
  title: string;           // e.g., "情感的转折之年"
  titleZh: string;
  timeRange?: string;       // e.g., "春季（2-4月）"
  hook: string;             // 1-2 sentences of imagery opening
  body: string[];           // 2-3 paragraphs of interpretation
  opportunities: string[];  // 2-3 specific opportunities
  challenges: string[];     // 2-3 specific challenges
  actions: string[];        // Action items in time order
  keyPhrase: string;        // One memorable phrase for this theme
}

export interface NarrativeReport {
  overview: {
    hook: string;           // Opening paragraph (imagery + atmosphere)
    coreThemes: string[];   // 2-3 sentence summary of main themes
    yearEnergy: string;     // One sentence on year's overall energy
  };
  themes: NarrativeTheme[];  // 2-4 major themes
  keywords: string[];       // 3-5 annual keywords
  monthlyOverview: { month: string; summary: string }[];  // 12 months
  closure: {
    summary: string;         // 2 sentence year summary
    outlook: string;        // Forward-looking empowering statement
    empoweringPhrase: string; // One sentence to take away
  };
}

export interface NarrativeComposerConfig {
  system: 'bazi' | 'ziwei' | 'qizheng' | 'western';
  language: 'zh' | 'en';
  depth: 'basic' | 'premium';  // basic = 2 themes, premium = 4 themes
  includeMonthly: boolean;
}
