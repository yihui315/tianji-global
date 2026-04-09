import { NextRequest, NextResponse } from 'next/server';
import { generateAnimatedCard, generateStaticCard, type ChartType, type OutputFormat } from '@/lib/gif-generator';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, resultData, format = 'webp', animated = true, width, height } = body as {
      type: ChartType;
      resultData: Record<string, unknown>;
      format?: OutputFormat;
      animated?: boolean;
      width?: number;
      height?: number;
    };

    if (!type || !resultData) {
      return NextResponse.json(
        { error: 'Missing required fields: type, resultData' },
        { status: 400 }
      );
    }

    const validTypes: ChartType[] = ['ziwei', 'tarot', 'bazi', 'synastry'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const validFormats: OutputFormat[] = ['gif', 'webp', 'png'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    const options = {
      width: width || 600,
      height: height || 600,
      format,
    };

    const imageUrl = animated
      ? await generateAnimatedCard(type, resultData, options)
      : await generateStaticCard(type, resultData, options);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      type,
      format,
      animated,
    });
  } catch (error) {
    console.error('[/api/share/animated] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate animated image', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Animated chart sharing API',
    endpoints: {
      POST: {
        description: 'Generate an animated chart image (GIF/WebP/PNG)',
        body: {
          type: "Chart type: 'ziwei' | 'tarot' | 'bazi' | 'synastry'",
          resultData: 'The chart result data object',
          format: "Output format: 'gif' | 'webp' | 'png' (default: webp)",
          animated: 'Whether to capture animation (default: true)',
          width: 'Image width in pixels (default: 600)',
          height: 'Image height in pixels (default: 600)',
        },
      },
    },
  });
}
