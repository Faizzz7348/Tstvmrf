#!/bin/bash

echo "🚀 Quick Database Setup"
echo "======================="
echo ""

# Step 1: Check .env file
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f .env ]; then
  echo "   ⚠️  .env file not found"
  echo "   Creating from .env.example..."
  cp .env.example .env
  echo "   ✅ Created .env file"
fi

# Check if DATABASE_URL is configured
if grep -q "your-database-url-here" .env 2>/dev/null; then
  echo ""
  echo "   ⚠️  DATABASE_URL needs to be configured!"
  echo ""
  echo "   Please edit .env and set your DATABASE_URL"
  echo ""
  echo "   Where to get your database URL:"
  echo "   ================================"
  echo ""
  echo "   📦 Option 1: Supabase (Recommended - FREE)"
  echo "      1. Go to https://supabase.com"
  echo "      2. Create a new project (takes ~2 minutes)"
  echo "      3. Go to Project Settings → Database"
  echo "      4. Copy the 'Connection pooling' URL"
  echo "      5. Change mode from 'Transaction' to 'Session'"
  echo "      6. Paste into .env as DATABASE_URL"
  echo ""
  echo "   🐘 Option 2: Neon (FREE serverless PostgreSQL)"
  echo "      1. Go to https://neon.tech"
  echo "      2. Create a new project"
  echo "      3. Copy the connection string"
  echo "      4. Paste into .env as DATABASE_URL"
  echo ""
  echo "   🔧 Option 3: Railway (FREE tier)"
  echo "      1. Go to https://railway.app"
  echo "      2. Create new project → Add PostgreSQL"
  echo "      3. Copy the DATABASE_URL"
  echo "      4. Paste into .env"
  echo ""
  echo "   🏠 Option 4: Local PostgreSQL"
  echo "      1. Install PostgreSQL locally"
  echo "      2. Create a database: createdb myapp"
  echo "      3. Use: postgresql://postgres:password@localhost:5432/myapp"
  echo ""
  echo "   After setting DATABASE_URL, run: ./quick-db-setup.sh"
  echo ""
  exit 0
fi

echo "   ✅ DATABASE_URL is configured"
echo ""

# Step 2: Generate Prisma Client
echo "📋 Step 2: Generating Prisma Client..."
npx prisma generate
if [ $? -eq 0 ]; then
  echo "   ✅ Prisma Client generated"
else
  echo "   ❌ Failed to generate Prisma Client"
  exit 1
fi
echo ""

# Step 3: Push schema to database
echo "📋 Step 3: Creating database tables..."
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
  echo "   ✅ Database tables created"
else
  echo "   ❌ Failed to create tables"
  echo ""
  echo "   Common issues:"
  echo "   - Check DATABASE_URL is correct"
  echo "   - Ensure database server is accessible"
  echo "   - Verify internet connection"
  exit 1
fi
echo ""

# Step 4: Test connection
echo "📋 Step 4: Testing database connection..."
npx tsx test-db-connection.ts
if [ $? -eq 0 ]; then
  echo ""
  echo "   ✅ Database connection test passed!"
else
  echo "   ⚠️  Connection test had issues"
fi
echo ""

# Step 5: Optional - Seed database
echo "📋 Step 5: Seed database (optional)"
echo "   Do you want to add sample data? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "   Seeding database..."
  npm run db:seed
  echo "   ✅ Database seeded"
fi
echo ""

echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:push      - Push schema changes"
echo "  npm run db:seed      - Seed database"
echo "  npm run db:test      - Test connection"
echo ""
echo "Health check: http://localhost:3000/api/health (when dev server is running)"
echo ""
