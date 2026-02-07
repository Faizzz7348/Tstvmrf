/**
 * Simple script to test Prisma database connection
 * Run: npx tsx test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing Prisma database connection...\n')

  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Check if tables exist by trying to count records
    const routeCount = await prisma.route.count()
    const locationCount = await prisma.location.count()
    const galleryRowCount = await prisma.galleryRow.count()
    const galleryImageCount = await prisma.galleryImage.count()

    console.log('\n📊 Current database status:')
    console.log(`   Routes: ${routeCount}`)
    console.log(`   Locations: ${locationCount}`)
    console.log(`   Gallery Rows: ${galleryRowCount}`)
    console.log(`   Gallery Images: ${galleryImageCount}`)

    if (routeCount === 0 && galleryRowCount === 0) {
      console.log('\n💡 Database is empty. Run "npm run db:seed" to add initial data.')
    } else {
      console.log('\n✅ Database has data!')
    }

  } catch (error: any) {
    console.error('❌ Database connection failed!')
    console.error('\nError details:')
    console.error(error.message)
    
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Check .env file has correct DATABASE_URL')
    console.log('2. Run "npx prisma db push" to create tables')
    console.log('3. Verify internet connection to Prisma Cloud')
    console.log('4. Check Prisma Cloud dashboard for database status')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
