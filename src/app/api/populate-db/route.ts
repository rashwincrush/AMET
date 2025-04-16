import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { populateDatabase } from '@/lib/populateDb';

/**
 * API route to initialize the database with production data
 * POST /api/populate-db
 */
export async function POST(request: NextRequest) {
  try {
    // For production build, we're using a mock function
    const result = await populateDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize database'
    }, { status: 500 });
  }
}