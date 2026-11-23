import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Fallback DZD per 1 EUR if upstream API is temporarily unreachable
const FALLBACK_DZD_PER_EUR = 145;

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
      next: { revalidate: 21600 }, // 6 hours cache on Edge
    });

    if (!res.ok) {
      throw new Error(`Exchange rate API HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };

    const rate = data?.rates?.DZD;
    if (typeof rate === 'number' && Number.isFinite(rate) && rate > 50 && rate < 1000) {
      return NextResponse.json(
        {
          success: true,
          dzdPerEur: Number(rate.toFixed(2)),
          updatedAt: data.time_last_update_utc || new Date().toISOString(),
          source: 'live-api',
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
          },
        }
      );
    }

    throw new Error('Invalid DZD rate in API response');
  } catch (error) {
    console.error('Exchange rate fetch failed, using fallback:', error);
    return NextResponse.json(
      {
        success: true,
        dzdPerEur: FALLBACK_DZD_PER_EUR,
        updatedAt: new Date().toISOString(),
        source: 'fallback',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600',
        },
      }
    );
  }
}
