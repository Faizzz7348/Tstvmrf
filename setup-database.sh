#!/bin/bash

echo "🚀 Setting up Prisma Database..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Step 2: Push schema to database
echo "📊 Step 2: Pushing schema to database..."
npx prisma db push --skip-generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to push schema to database"
  echo ""
  echo "🔍 Troubleshooting tips:"
  echo "  1. Check your .env file has valid DATABASE_URL"
  echo "  2. Verify internet connection"
  echo "  3. Check Prisma Cloud credentials"
  exit 1
fi
echo "✅ Database schema pushed successfully"
echo ""

# Step 3: Seed database
echo "🌱 Step 3: Seeding database with initial data..."
npm run db:seed
if [ $? -ne 0 ]; then
  echo "❌ Failed to seed database"
  exit 1
fi
echo "✅ Database seeded successfully"
echo ""

echo "🎉 All done! Your database is ready to use."
echo ""
echo "💡 Next steps:"
echo "  - Run 'npm run db:studio' to view your data"
echo "  - Update frontend pages to use Prisma API routes"
