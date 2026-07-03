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
          eyebrow: 'Six-system destiny hook',
          headline: 'The pattern people feel around you, verified by six systems.',
          body: 'Start with one sharp identity and timing preview, then unlock the relationship, career, wealth, action, and risk layers behind it.',
          cta: 'Start My Destiny Scan',
          benefitCards: [
            { title: 'Identity first', body: 'A one-line destiny pattern that lands before the details.' },
            { title: 'Timing curve', body: 'A visual window that shows where the next shift starts.' },
            { title: 'Premium layers', body: 'Five deeper sections stay locked until the full profile.' },
          ],
        },
        result: {
          lockLabel: 'Six-system profile',
          lockHeadline: 'Your six-system profile still has five premium layers locked.',
          lockBody: 'The free scan shows identity and timing. Unlock the relationship, career, wealth, action, and risk layers that make the profile useful.',
          teaserSuffix: 'The relationship layer is still hidden in the full profile.',
          shareCaptionPrefix: 'People can feel this before you explain it.',
        },
      };
    case 'seo':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Six-system destiny scan',
          headline: 'One destiny profile for timing, relationships, and your next move.',
          body: 'Get a clear identity and timing preview backed by six divination systems, then unlock the practical profile underneath.',
          cta: 'Start My Destiny Scan',
          benefitCards: [
            { title: 'Clear summary', body: 'A precise headline and one-liner without generic astrology filler.' },
            { title: 'Timing explanation', body: 'A readable future curve that shows when momentum changes.' },
            { title: 'Verified depth', body: 'Premium sections translate six lenses into decisions.' },
          ],
        },
        result: {
          lockLabel: 'Premium profile',
          lockHeadline: 'The most actionable parts of your verified profile are still locked.',
          lockBody: 'The preview shows identity and timing. Premium explains which relationship, career, money, action, and risk moves matter most next.',
          teaserSuffix: 'The relationship explanation is still locked.',
          shareCaptionPrefix: 'This is the clearest part of the scan so far.',
        },
      };
    case 'direct':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Premium destiny scan',
          headline: 'A unified destiny profile for your next high-value life move.',
          body: 'Start with identity and timing, then unlock the five decision-grade layers verified by six systems.',
          cta: 'Start My Destiny Scan',
          benefitCards: [
            { title: 'Premium framing', body: 'The scan reads like a paid insight product from the first screen.' },
            { title: 'Decision-grade lock', body: 'The lock starts where the deeper profile becomes useful.' },
            { title: 'Repeat value', body: 'The result is structured to pull users back for timing updates.' },
          ],
        },
        result: {
          lockLabel: 'Premium profile',
          lockHeadline: 'The highest-value layers of your destiny profile are still locked.',
          lockBody: 'The free layer builds conviction. Premium unlocks relationship, career, wealth, action, and risk so the reading becomes decision-grade.',
          teaserSuffix: 'The premium relationship layer is still locked.',
          shareCaptionPrefix: 'This feels like the opening line of a paid reading.',
        },
      };
    case 'referral':
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Shared destiny scan',
          headline: 'See the destiny profile people actually send to friends.',
          body: 'A shareable preview shows identity and timing first; the full profile explains the relationship and action layers worth discussing.',
          cta: 'Start My Destiny Scan',
          benefitCards: [
            { title: 'Sendable hook', body: 'The first line is designed to make someone forward it.' },
            { title: 'Visual momentum', body: 'The destiny curve is built to feel social-first.' },
            { title: 'Share-worthy lock', body: 'The deeper layers give people something to talk about.' },
          ],
        },
        result: {
          lockLabel: 'Shared signal',
          lockHeadline: 'The parts worth discussing with someone else are still locked.',
          lockBody: 'The preview is already shareable. Premium adds relationship, career, wealth, action, and risk so the profile becomes personal enough to talk about.',
          teaserSuffix: 'The relationship layer people usually share next is still locked.',
          shareCaptionPrefix: 'This is the part people end up sending around.',
        },
      };
    default:
      return {
        source,
        strategy,
        scan: {
          eyebrow: 'Destiny scan',
          headline: 'One destiny profile, verified by six systems.',
          body: 'Enter your birth details, get Identity and Timing for free, then unlock Relationship, Career, Wealth, Action, and Risk.',
          cta: 'Start My Destiny Scan',
          benefitCards: [
            { title: 'Identity preview', body: 'A clear pattern that feels instantly personal.' },
            { title: 'Timing preview', body: 'A visual future curve that hints at what is coming next.' },
            { title: 'Premium payoff', body: 'Five deeper sections sit behind one clear unlock.' },
          ],
        },
        result: {
          lockLabel: 'Locked profile layers',
          lockHeadline: 'Your five premium destiny layers are still locked.',
          lockBody: 'The visible scan shows Identity and Timing. The full profile unlocks Relationship, Career, Wealth, Action, and Risk so you can move with the next window.',
          teaserSuffix: 'The relationship layer is still locked.',
          shareCaptionPrefix: 'This line is already strong enough to share.',
        },
      };
  }
}
