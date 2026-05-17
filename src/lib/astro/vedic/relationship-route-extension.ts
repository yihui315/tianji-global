import {
  buildVedicRelationshipPaidReport,
  type VedicRelationshipPaidEntitlement,
  type VedicRelationshipPaidReason,
  type VedicRelationshipPaidStatus,
} from './relationship-paid-adapter';
import type { VedicReportMode } from './config';
import type { VedicChartData } from './types';

export interface VedicRelationshipRouteMeta {
  engine: 'vedic';
  route: 'relationship_paid_vedic';
  status: VedicRelationshipPaidStatus;
  mode: VedicReportMode;
  locked: boolean;
  reason?: VedicRelationshipPaidReason;
  publicReportAttached: boolean;
  liveCall: false;
}

export interface VedicRelationshipPublicReport {
  publicSummary: string;
  fullReportMarkdown: string;
  sections: string[];
  aiMeta: VedicRelationshipRouteMeta;
}

export interface VedicRelationshipRouteExtension {
  status: VedicRelationshipPaidStatus;
  mode: VedicReportMode;
  locked: boolean;
  reason?: VedicRelationshipPaidReason;
  publicSummary: string | null;
  internalPreview: string | null;
  fullReportMarkdown: string | null;
  sections: string[];
  aiMeta: VedicRelationshipRouteMeta;
}

export interface VedicRelationshipRouteExtensionInput {
  chartData?: VedicChartData | null;
  entitlement?: VedicRelationshipPaidEntitlement | null;
  env?: Record<string, string | undefined>;
}

export interface VedicRelationshipReportCarrier {
  generationMeta: object;
  vedicReport?: VedicRelationshipPublicReport | null;
}

export interface ApplyVedicRelationshipRouteExtensionInput<TReport extends VedicRelationshipReportCarrier>
  extends VedicRelationshipRouteExtensionInput {
  report: TReport;
}

function toRouteMeta(input: {
  status: VedicRelationshipPaidStatus;
  mode: VedicReportMode;
  locked: boolean;
  reason?: VedicRelationshipPaidReason;
  publicReportAttached: boolean;
}): VedicRelationshipRouteMeta {
  return {
    engine: 'vedic',
    route: 'relationship_paid_vedic',
    status: input.status,
    mode: input.mode,
    locked: input.locked,
    reason: input.reason,
    publicReportAttached: input.publicReportAttached,
    liveCall: false,
  };
}

export async function buildVedicRelationshipRouteExtension(
  input: VedicRelationshipRouteExtensionInput
): Promise<VedicRelationshipRouteExtension> {
  const result = await buildVedicRelationshipPaidReport(input);
  const publicReportAttached = result.status === 'generated' && Boolean(result.fullReportMarkdown);

  return {
    status: result.status,
    mode: result.mode,
    locked: result.locked,
    reason: result.reason,
    publicSummary: result.publicSummary,
    internalPreview: result.internalPreview,
    fullReportMarkdown: result.fullReportMarkdown,
    sections: result.sections,
    aiMeta: toRouteMeta({
      status: result.status,
      mode: result.mode,
      locked: result.locked,
      reason: result.reason,
      publicReportAttached,
    }),
  };
}

export async function applyVedicRelationshipRouteExtension<TReport extends VedicRelationshipReportCarrier>(
  input: ApplyVedicRelationshipRouteExtensionInput<TReport>
): Promise<{ report: TReport; extension: VedicRelationshipRouteExtension }> {
  const extension = await buildVedicRelationshipRouteExtension(input);

  if (extension.status === 'skipped' && extension.reason === 'disabled') {
    return {
      report: input.report,
      extension,
    };
  }

  const report = {
    ...input.report,
    generationMeta: {
      ...input.report.generationMeta,
      vedic: extension.aiMeta,
    },
  } as TReport;

  if (extension.status !== 'generated' || !extension.publicSummary || !extension.fullReportMarkdown) {
    return { report, extension };
  }

  return {
    report: {
      ...report,
      vedicReport: {
        publicSummary: extension.publicSummary,
        fullReportMarkdown: extension.fullReportMarkdown,
        sections: extension.sections,
        aiMeta: extension.aiMeta,
      },
    } as TReport,
    extension,
  };
}
