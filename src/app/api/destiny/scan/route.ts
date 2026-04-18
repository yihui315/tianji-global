import { NextRequest, NextResponse } from 'next/server';
import {
  buildDestinyScan,
  type DestinyScanResult,
  decodeDestinyScanId,
  destinyScanInputSchema,
  encodeDestinyScanId,
  toDestinyPreview,
} from '@/lib/destiny-scan';
import { getPlatformContext } from '@/lib/unified-platform';
import { buildTrafficContext } from '@/lib/traffic-evolution';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { persistDestinyScanResult } from '@/lib/unified-write';

function asPersistedScanResult(value: unknown): DestinyScanResult | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as DestinyScanResult;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const inferredTraffic =
      payload?.traffic ??
      buildTrafficContext({
        referrer: request.headers.get('referer') ?? '',
      });
    const body = destinyScanInputSchema.parse({
      ...payload,
      traffic: inferredTraffic,
    });
    const id = encodeDestinyScanId(body);
    const result = buildDestinyScan(body, id);

    const platformContext = await getPlatformContext().catch(() => null);
    if (platformContext) {
      await persistDestinyScanResult({
        context: platformContext,
        scanInput: body,
        scanId: id,
        scanResult: result,
      }).catch((persistError) => {
        console.warn('[api/destiny/scan] unified persistence skipped:', persistError);
      });
    }

    return NextResponse.json({
      success: true,
      id,
      preview: toDestinyPreview(result),
    });
  } catch (error) {
    console.error('[api/destiny/scan] POST error:', error);
    return NextResponse.json({ error: 'Invalid destiny scan input' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('module_results')
        .select('raw_payload')
        .contains('raw_payload', { scanId: id })
        .order('created_at', { ascending: false });

      const persisted = data?.[0]?.raw_payload as { scanResult?: unknown } | undefined;
      const persistedResult = asPersistedScanResult(persisted?.scanResult);
      if (persistedResult) {
        return NextResponse.json(toDestinyPreview(persistedResult));
      }
    } catch (error) {
      console.warn('[api/destiny/scan] persisted lookup skipped:', error);
    }
  }

  const input = decodeDestinyScanId(id);
  if (!input) {
    return NextResponse.json({ error: 'Invalid destiny scan id' }, { status: 400 });
  }

  const result = buildDestinyScan(input, id);
  return NextResponse.json(toDestinyPreview(result));
}
