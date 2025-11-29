import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ITS_BASE_URL = process.env.ITS_API_BASE_URL || 'https://openapi.its.go.kr:9443';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apiKey = process.env.ITS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ITS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  // ITS API endpoint for CCTV
  const apiUrl = `${ITS_BASE_URL}/cctvInfo`;

  try {
    // Forward all search params to the ITS API
    // Expected params: type, cctvType, minX, maxX, minY, maxY, getType, etc.
    // We append the apiKey here so it's not exposed to the client
    const response = await axios.get(apiUrl, {
      params: {
        ...Object.fromEntries(searchParams),
        apiKey: apiKey,
        type: 'all', // Default to all if not specified
        cctvType: '1', // 1: Realtime Streaming (HLS), 2: MP4, 3: Image. We prefer 1.
        getType: 'json', // Force JSON response
      },
      timeout: 5000, // 5s timeout
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching CCTV data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from ITS API' },
      { status: 502 }
    );
  }
}

