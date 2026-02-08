import { NextResponse } from 'next/server'
import { isDatabaseConnected } from './prisma'
import { DatabaseError } from './prisma-db'

/**
 * Middleware wrapper for API routes to ensure database connectivity
 * 
 * Usage:
 * ```typescript
 * export const GET = withDatabaseCheck(async (request) => {
 *   // Your API logic here
 *   // Database is guaranteed to be connected
 *   return NextResponse.json({ data: 'success' })
 * })
 * ```
 */
export function withDatabaseCheck<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      // Check database connection before processing request
      const isConnected = await isDatabaseConnected()
      
      if (!isConnected) {
        return NextResponse.json(
          {
            error: 'Database is currently unavailable',
            code: 'DATABASE_UNAVAILABLE',
            message: 'Please try again in a few moments',
          },
          { status: 503 }
        )
      }

      // Call the actual handler
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      // Handle DatabaseError
      if (error instanceof DatabaseError) {
        const statusCode = getStatusCodeForDatabaseError(error.code)
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: statusCode }
        )
      }

      // Handle generic errors
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Map database error codes to HTTP status codes
 */
function getStatusCodeForDatabaseError(code?: string): number {
  switch (code) {
    case 'P2002': // Unique constraint violation
      return 409 // Conflict
    case 'P2003': // Foreign key constraint violation
      return 400 // Bad Request
    case 'P2025': // Record not found
      return 404 // Not Found
    case 'P1001': // Cannot reach database
    case 'NOT_CONNECTED':
      return 503 // Service Unavailable
    case 'P1008': // Timeout
      return 504 // Gateway Timeout
    case 'VALIDATION_ERROR':
      return 422 // Unprocessable Entity
    default:
      return 500 // Internal Server Error
  }
}

/**
 * Rate limiting helper for database operations
 * Helps prevent database overload
 */
export class RateLimiter {
  private requestCounts = new Map<string, { count: number; resetTime: number }>()

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const record = this.requestCounts.get(identifier)

    // No record or window expired
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return false
    }

    // Increment count
    record.count++

    // Check if limit exceeded
    if (record.count > this.maxRequests) {
      return true
    }

    return false
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requestCounts.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - record.count)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.requestCounts.entries()) {
      if (now > value.resetTime) {
        this.requestCounts.delete(key)
      }
    }
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter(100, 60000)

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    globalRateLimiter.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Combine database check with rate limiting
 */
export function withDatabaseAndRateLimit<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  rateLimiter: RateLimiter = globalRateLimiter
) {
  return withDatabaseCheck(async (...args: T) => {
    // Get identifier (IP address or user ID)
    const request = args[0] as Request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Check rate limit
    if (rateLimiter.isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Please try again later',
          remaining: 0,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      )
    }

    const remaining = rateLimiter.getRemainingRequests(ip)
    const response = await handler(...args)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(rateLimiter['maxRequests']))
    response.headers.set('X-RateLimit-Remaining', String(remaining))

    return response
  })
}
