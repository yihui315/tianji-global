// POST /api/relationship/share
// GET /api/relationship/share?slug=xxx
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import type { ApiResponse, RelationshipShareSettings } from '@/types/relationship';
import { randomSlug } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { readingId, shareSettings } = body as {
      readingId: string;
      shareSettings?: Partial<RelationshipShareSettings>;
    };

    if (!readingId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'readingId is required',
      }, { status: 400 });
    }

    const settings: RelationshipShareSettings = {
      includeNames: shareSettings?.includeNames ?? true,
      includeBirthData: shareSettings?.includeBirthData ?? false,
      shareMode: shareSettings?.shareMode ?? 'summary',
    };

    const slug = randomSlug(12);
    let shareUrl = `https://tianji.global/relationship/share/${slug}`;

    if (isSupabaseConfigured()) {
      try {
        // Verify reading exists
        const supabase = getSupabaseAdmin();
        const { data: reading, error } = await supabase
          .from('relationship_readings')
          .select('id')
          .eq('id', readingId)
          .single();

        if (error || !reading) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Reading not found',
          }, { status: 404 });
        }

        const { data, error: shareError } = await supabase
          .from('relationship_shares')
          .insert({
            relationship_reading_id: readingId,
            public_slug: slug,
            share_mode: settings.shareMode,
            include_names: settings.includeNames,
            include_birth_data: settings.includeBirthData,
          })
          .select()
          .single();

        if (shareError) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to create share link',
          }, { status: 500 });
        }
      } catch (dbErr) {
        console.warn('[relationship/share] DB error, continuing without persistence:', dbErr);
      }
    }

    return NextResponse.json<ApiResponse<{ slug: string; shareUrl: string; shareSettings: RelationshipShareSettings }>>({
      success: true,
      data: { slug, shareUrl, shareSettings: settings },
    });
  } catch (err) {
    console.error('[relationship/share POST]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to create share link',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'slug is required',
    }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: share, error } = await supabase
      .from('relationship_shares')
      .select('*')
      .eq('public_slug', slug)
      .single();

    if (error || !share) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Share not found',
      }, { status: 404 });
    }

    // Increment view count (fire and forget)
    supabase
      .from('relationship_shares')
      .update({ view_count: (share.view_count ?? 0) + 1 })
      .eq('id', share.id)
      .then(() => {})
      .catch(() => {});

    // Fetch the reading
    const { data: reading, error: readingError } = await supabase
      .from('relationship_readings')
      .select('*')
      .eq('id', share.relationship_reading_id)
      .single();

    if (readingError || !reading) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Reading not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<{ share: typeof share; reading: typeof reading }>>({
      success: true,
      data: { share, reading },
    });
  } catch (err) {
    console.error('[relationship/share GET]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to fetch share',
    }, { status: 500 });
  }
}
