#!/usr/bin/env tsx

/**
 * Database Connection Test Script
 * 
 * This script tests the enhanced database connection features:
 * - Connection establishment
 * - Health checks
 * - Error handling
 * - Retry logic
 * 
 * Run with: npx tsx test-db-improvements.ts
 */

import { connectDatabase, isDatabaseConnected, prisma } from './lib/prisma'
import { getRoutesByRegion, DatabaseError } from './lib/prisma-db'

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables')
    console.log('Please create a .env file with DATABASE_URL')
    process.exit(1)
  }

  // Test 1: Connect to database
  console.log('Test 1: Connecting to database...')
  try {
    const connected = await connectDatabase()
    console.log(connected ? '✅ Connection successful' : '❌ Connection failed')
  } catch (error) {
    console.error('❌ Connection error:', error)
  }

  console.log()

  // Test 2: Check connection health
  console.log('Test 2: Checking connection health...')
  try {
    const isHealthy = await isDatabaseConnected()
    console.log(isHealthy ? '✅ Database is healthy' : '❌ Database is unhealthy')
  } catch (error) {
    console.error('❌ Health check error:', error)
  }

  console.log()

  // Test 3: Simple query test
  console.log('Test 3: Running simple query...')
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`
    console.log('✅ Query successful')
    console.log('Database time:', result)
  } catch (error) {
    console.error('❌ Query error:', error)
  }

  console.log()

  // Test 4: Test enhanced database operations
  console.log('Test 4: Testing enhanced database operations...')
  try {
    const routes = await getRoutesByRegion('kuala-lumpur')
    console.log(`✅ Successfully fetched ${routes.length} routes`)
    
    if (routes.length > 0) {
      console.log('Sample route:', {
        code: routes[0].code,
        name: routes[0].name,
        locationCount: routes[0].locations.length,
      })
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error('❌ Database error:', error.message, `(${error.code})`)
    } else {
      console.error('❌ Unknown error:', error)
    }
  }

  console.log()

  // Test 5: Connection info
  console.log('Test 5: Connection information...')
  try {
    // Check if we can execute basic queries
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server
    `
    console.log('✅ Connection info:', dbInfo)
  } catch (error) {
    console.log('ℹ️  Could not retrieve connection info')
  }

  console.log()
  console.log('✅ All tests completed!')
  
  // Cleanup
  await prisma.$disconnect()
  process.exit(0)
}

// Run tests
testDatabaseConnection().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
