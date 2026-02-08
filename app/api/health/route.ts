import { NextResponse } from 'next/server'
import { isDatabaseConnected, prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Health check endpoint for monitoring database connection
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    const isConnected = await isDatabaseConnected()
    
    if (!isConnected) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
        },
        { status: 503 }
      )
    }

    // Perform a simple query to test database responsiveness
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      databaseTime: result,
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    )
  }
}
