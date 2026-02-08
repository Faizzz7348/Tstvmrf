/**
 * Simple script to test Prisma database connection
 * Run: npx tsx test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing Prisma database connection...\n')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'your-database-url-here') {
    console.error('❌ DATABASE_URL is not configured!')
    console.log('\n🔧 Setup instructions:')
    console.log('1. Edit the .env file in your project root')
    console.log('2. Replace "your-database-url-here" with your actual database URL')
    console.log('\n📝 Example formats:')
    console.log('   Supabase: postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres')
    console.log('   Local: postgresql://postgres:password@localhost:5432/mydb')
    console.log('\n💡 After setting DATABASE_URL, run: npx prisma db push')
    process.exit(1)
  }

  try {
    // Test basic connection
    console.log('⏳ Connecting to database...')
    await prisma.$connect()
    console.log('✅ Connection successful!')

    // Test if tables exist
    console.log('\n⏳ Checking database schema...')
    
    try {
      const routeCount = await prisma.route.count()
      const locationCount = await prisma.location.count()
      const galleryRowCount = await prisma.galleryRow.count()
      const galleryImageCount = await prisma.galleryImage.count()

      console.log('✅ Database schema is ready!')
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
    } catch (schemaError: any) {
      if (schemaError.code === 'P2021' || schemaError.message.includes('does not exist')) {
        console.log('⚠️  Database tables do not exist yet!')
        console.log('\n🔧 Run this command to create tables:')
        console.log('   npx prisma db push')
        console.log('\n   Or run migrations:')
        console.log('   npx prisma migrate dev')
      } else {
        throw schemaError
      }
    }

  } catch (error: any) {
    console.error('\n❌ Database connection failed!')
    console.error('\nError details:')
    console.error(`   Code: ${error.code || 'Unknown'}`)
    console.error(`   Message: ${error.message}`)
    
    console.log('\n🔧 Troubleshooting steps:')
    
    if (error.code === 'P1001') {
      console.log('   → Cannot reach database server')
      console.log('   1. Check your internet connection')
      console.log('   2. Verify the database host/port in DATABASE_URL')
      console.log('   3. Check if database server is running')
      console.log('   4. Verify firewall/VPN settings')
    } else if (error.code === 'P1002') {
      console.log('   → Connection timeout')
      console.log('   1. Database may be overloaded')
      console.log('   2. Check network connectivity')
      console.log('   3. Increase timeout in connection string')
    } else if (error.code === 'P1003') {
      console.log('   → Database does not exist')
      console.log('   1. Create the database on your server first')
      console.log('   2. Verify database name in DATABASE_URL')
    } else if (error.message.includes('password authentication failed')) {
      console.log('   → Invalid credentials')
      console.log('   1. Check username and password in DATABASE_URL')
      console.log('   2. Verify user has access to the database')
    } else {
      console.log('   1. Check .env file has correct DATABASE_URL')
      console.log('   2. Run "npx prisma db push" to create tables')
      console.log('   3. Run "npx prisma generate" to update client')
      console.log('   4. Check database provider documentation')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n✅ Test completed')
  }
}

testConnection()
