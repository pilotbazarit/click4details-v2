import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get user from request (if authenticated)
    const token = request.headers.get('authorization');
    
    // Fetch unread message count from your backend/database
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(
      `${backendUrl}/api/product-messages/unread-count?product_id=${productId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': token }),
        },
      }
    );

    if (!response.ok) {
      // If backend endpoint doesn't exist, return 0
      return NextResponse.json(
        { unread_count: 0 },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { unread_count: data.unread_count || 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching message count:', error);
    return NextResponse.json(
      { unread_count: 0, error: error.message },
      { status: 200 }
    );
  }
}
