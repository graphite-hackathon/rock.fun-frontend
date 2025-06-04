// src/app/api/kyc-proxy/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const networkId = searchParams.get('networkId') || 'testnet'; // Default to testnet if not specified

  let kycApiUrl: string;
  let apiKey: string | undefined;

  if (networkId === 'mainnet') {
    kycApiUrl = process.env.GRAPHITE_MAINNET_KYC_API_URL || 'https://api.main.atgraphite.com/api';
    apiKey = process.env.GRAPHITE_MAIN_API_KEY;
  } else { // Default to testnet
    kycApiUrl = process.env.GRAPHITE_TESTNET_KYC_API_URL || 'https://api.test.atgraphite.com/api';
    apiKey = process.env.GRAPHITE_TESTNET_API_KEY;
  }

  if (!address) {
    return NextResponse.json({ message: 'Address parameter is required' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ message: 'API key for KYC check is not configured on the server' }, { status: 500 });
  }

  const query = new URLSearchParams({
    module: 'account',
    action: 'kyc',
    address: address,
    tag: 'latest',
    apikey: apiKey,
  });

  try {
    console.log(`[KYC Proxy] Fetching from: ${kycApiUrl}?${query.toString()}`);
    const apiResponse = await fetch(`${kycApiUrl}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseBody = await apiResponse.text(); // Get text first to see raw response if JSON parse fails
    console.log(`[KYC Proxy] Upstream status: ${apiResponse.status}, Body: ${responseBody}`);


    if (!apiResponse.ok) {
      return NextResponse.json({ message: `Upstream API Error: ${apiResponse.status} ${apiResponse.statusText}`, details: responseBody }, { status: apiResponse.status });
    }

    try {
        const data = JSON.parse(responseBody); // Now parse JSON
        return NextResponse.json(data);
    } catch (jsonError: any) {
        console.error("[KYC Proxy] Error parsing JSON response from upstream API:", jsonError);
        return NextResponse.json({ message: 'Failed to parse JSON response from upstream API', rawResponse: responseBody }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[KYC Proxy] Fetch error:", error);
    return NextResponse.json({ message: `Proxy fetch error: ${error.message}` }, { status: 500 });
  }
}