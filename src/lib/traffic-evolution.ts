import { z } from 'zod';

export const trafficSourceSchema = z.enum(['tiktok', 'seo', 'direct', 'referral', 'unknown']);
export const trafficStrategySchema = z.enum([
  'emotional_intense',
  'clarity_first',
  'premium_psychology',
  'visual_focus',
  'minimal_clean',
]);

export type TrafficSource = z.infer<typeof trafficSourceSchema>;
export type TrafficStrategy = z.infer<typeof trafficStrategySchema>;

export interface TrafficContext {
  source: TrafficSource;
  strategy: TrafficStrategy;
  campaign?: string;
}

interface TrafficClassifierInput {
  search?: string;
  referrer?: string;
  currentHost?: string;
}

interface TrafficExperience {
  source: TrafficSource;
  strategy: TrafficStrategy;
  scan: {
    eyebrow: string;
    headline: string;
    body: string;
    cta: string;
    benefitCards: Array<{ title: string; body: string }>;
  };
  result: {
    lockLabel: string;
    lockHeadline: string;
    lockBody: string;
    teaserSuffix: string;
    shareCaptionPrefix: string;
  };
}

const SEARCH_ENGINE_HOSTS = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'baidu.', 'ecosia.'];
const TIKTOK_HOSTS = ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'];

function normalizeHost(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function parseReferrerHost(referrer?: string) {
  if (!referrer) {
    return '';
  }

  try {
    return normalizeHost(new URL(referrer).host);
  } catch {
    return '';
  }
}

export function classifyTrafficSource({
  search = '',
  referrer = '',
  currentHost = '',
}: TrafficClassifierInput): TrafficSource {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const utmSource = normalizeHost(params.get('utm_source') ?? undefined);
  const utmMedium = normalizeHost(params.get('utm_medium') ?? undefined);
  const referrerHost = parseReferrerHost(referrer);
  const normalizedCurrentHost = normalizeHost(currentHost);

  const isTikTok =
    TIKTOK_HOSTS.some((host) => utmSource.includes(host) || referrerHost.includes(host)) ||
    utmSource.includes('tiktok') ||
    utmSource === 'tt';

  if (isTikTok) {
    return 'tiktok';
  }

  const isSeo =
    utmMedium === 'organic' ||
    SEARCH_ENGINE_HOSTS.some((host) => referrerHost.includes(host)) ||
    ['google', 'bing', 'seo', 'search', 'baidu', 'duckduckgo'].some((source) => utmSource.includes(source));

  if (isSeo) {
    return 'seo';
  }

  if (!referrerHost && !utmSource) {
    return 'direct';
  }

  if (referrerHost && normalizedCurrentHost && !referrerHost.includes(normalizedCurrentHost)) {
    return 'referral';
  }

  return 'unknown';
}

export function selectTrafficStrategy(source: TrafficSource): TrafficStrategy {
  switch (source) {
    case 'tiktok':
      return 'emotional_intense';
    case 'seo':
      return 'clarity_first';
    case 'direct':
      return 'premium_psychology';
    case 'referral':
      return 'visual_focus';
    default:
      return 'minimal_clean';
  }
}

export function buildTrafficContext(input: TrafficClassifierInput): TrafficContext {
  const params = new URLSearchParams(input.search?.startsWith('?') ? input.search.slice(1) : input.search ?? '');
  const source = classifyTrafficSource(input);
  const campaign = params.get('utm_campaign')?.trim() ?? '';

  return {
    source,
    strategy: selectTrafficStrategy(source),
    campaign: campaign || undefined,
  };
}

export function getTrafficExperience(source: TrafficSource): TrafficExperience {
  const strategy = selectTrafficStrategy(source);

  switch (source) {
    case 'tiktok':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'TikTok destiny hook',
          headline: 'The pattern people feel around you before they understand you.',
          body: 'This version gets to the emotional signal fast, shows the turning-point curve, and leaves one irresistible lock behind.',
          cta: 'Reveal My Hidden Shift',
          benefitCards: [
            { title: 'Fast emotional hook', body: 'A one-line reading that lands in under ten seconds.' },
            { title: 'Visual proof', body: 'A shareable destiny curve that feels screenshot-ready.' },
            { title: 'Curiosity lock', body: 'The biggest turning point stays hidden until unlock.' },
          ],
        },
        result: {
          lockLabel: 'Hidden shift',
          lockHeadline: 'The relationship change everyone senses is still hidden.',
          lockBody: 'You can see the tension line now. The part that explains who triggers the shift, when it peaks, and how to use it is still locked.',
          teaserSuffix: 'The most magnetic part of this pattern is still hidden.',
          shareCaptionPrefix: 'People can feel this before you explain it.',
        },
      };
    case 'seo':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Search intent scan',
          headline: 'A clearer reading of your timing, relationships, and next move.',
          body: 'This version leads with clarity, shows the timing curve, and makes the premium layer feel concrete instead of vague.',
          cta: 'Reveal My Destiny Scan',
          benefitCards: [
            { title: 'Clear summary', body: 'A precise headline and one-liner without generic astrology filler.' },
            { title: 'Timing explanation', body: 'A readable future curve that shows when momentum changes.' },
            { title: 'Useful premium layer', body: 'The locked section explains the exact shift, not just more mystique.' },
          ],
        },
        result: {
          lockLabel: 'Next step',
          lockHeadline: 'The most actionable part of your next cycle is still locked.',
          lockBody: 'The preview shows the shape of your timing. The premium layer explains which relationship and money move matters most over the next window.',
          teaserSuffix: 'The practical explanation is still locked.',
          shareCaptionPrefix: 'This is the clearest part of the scan so far.',
        },
      };
    case 'direct':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Premium destiny scan',
          headline: 'A deeper read on the pattern behind your next premium life move.',
          body: 'This flow is tuned for higher-intent visitors: stronger positioning, clearer value, and a lock that feels worth paying to open.',
          cta: 'Start My Premium Scan',
          benefitCards: [
            { title: 'Premium framing', body: 'The scan reads like a paid insight product from the first screen.' },
            { title: 'Decision-grade lock', body: 'The paywall sits exactly where the expensive insight begins.' },
            { title: 'Repeat value', body: 'The result is structured to pull users back for timing updates.' },
          ],
        },
        result: {
          lockLabel: 'Premium layer',
          lockHeadline: 'The highest-value part of your destiny profile is still locked.',
          lockBody: 'The free layer shows enough to create conviction. The paid layer is where the relationship signal, money cycle, and action plan become decision-grade.',
          teaserSuffix: 'The premium explanation is still hidden.',
          shareCaptionPrefix: 'This feels like the opening line of a paid reading.',
        },
      };
    case 'referral':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Shared destiny scan',
          headline: 'See why this pattern is the one people actually send to friends.',
          body: 'This flow leans visual and social: stronger screenshot cues, shorter copy, and a lock built to spark sends.',
          cta: 'See What They Shared',
          benefitCards: [
            { title: 'Sendable hook', body: 'The first line is designed to make someone forward it.' },
            { title: 'Visual momentum', body: 'The destiny curve is built to feel social-first.' },
            { title: 'Share-worthy lock', body: 'The premium twist implies there is more to uncover.' },
          ],
        },
        result: {
          lockLabel: 'Shared signal',
          lockHeadline: 'The part worth sending to someone else is still locked.',
          lockBody: 'The preview is already shareable. The premium layer is the part that makes the reading feel personal enough to send and talk about.',
          teaserSuffix: 'The part people usually share next is still hidden.',
          shareCaptionPrefix: 'This is the part people end up sending around.',
        },
      };
    default:
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Destiny scan',
          headline: 'One page. One lock. One reason to pay.',
          body: 'Enter your birth details, get a sharp partial result, and decide whether the hidden turning point is worth unlocking.',
          cta: 'Reveal My Destiny',
          benefitCards: [
            { title: 'One-line destiny', body: 'An emotional hook that feels instantly personal.' },
            { title: 'K-line timing', body: 'A visual future curve that hints at what is coming next.' },
            { title: 'Locked payoff', body: 'Relationship, wealth, and action plan sit behind one clear paywall.' },
          ],
        },
        result: {
          lockLabel: 'Locked turning point',
          lockHeadline: 'Your most important life turning point is still hidden.',
          lockBody: 'The visible scan shows your surface pattern. The full reading unlocks your relationship pattern, your next money cycle, and the exact action plan to move with the next window instead of missing it.',
          teaserSuffix: 'The most decisive pattern is still locked.',
          shareCaptionPrefix: 'This line is already strong enough to share.',
        },
      };
  }
}
