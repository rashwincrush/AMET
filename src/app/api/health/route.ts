import { NextResponse } from 'next/server';

/**
 * @route GET /api/health
 * @description Health check endpoint for monitoring and container healthchecks
 * @public
 */
export async function GET() {
  try {
    // You can add more checks here, like database connectivity
    // For simplicity, we'll just return a success response
    
    return NextResponse.json(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '0.1.0' 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString() 
      }, 
      { status: 500 }
    );
  }
} 