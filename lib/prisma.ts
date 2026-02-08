import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma Client with connection pooling and error handling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool configuration
    // @ts-ignore - Prisma connection pool settings
    connection: {
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    },
  })

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Connection health check
let isConnected = false
let connectionAttempts = 0
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000

/**
 * Test database connection with retry logic
 */
export async function connectDatabase(): Promise<boolean> {
  if (isConnected) return true

  try {
    await prisma.$connect()
    isConnected = true
    connectionAttempts = 0
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    connectionAttempts++
    console.error(`❌ Database connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`, error)
    
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return connectDatabase()
    }
    
    isConnected = false
    return false
  }
}

/**
 * Check if database is connected
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    isConnected = true
    return true
  } catch (error) {
    isConnected = false
    console.error('Database connection check failed:', error)
    return false
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    isConnected = false
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Graceful shutdown handlers
if (typeof window === 'undefined') {
  // Server-side only
  process.on('beforeExit', async () => {
    await disconnectDatabase()
  })

  process.on('SIGINT', async () => {
    await disconnectDatabase()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

export default prisma
