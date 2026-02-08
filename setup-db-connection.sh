#!/bin/bash

# Database Setup Script
# This script helps set up the database connection for the project

echo "🔧 Database Connection Setup"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found"
  echo "📝 Creating .env file from .env.example..."
  
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your actual database credentials"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL"
    echo "  - DATABASE_POSTGRES_URL (for migrations)"
    echo ""
    echo "Example:"
    echo "  DATABASE_URL=\"postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=20\""
    echo ""
  else
    echo "❌ .env.example file not found"
    exit 1
  fi
else
  echo "✅ .env file exists"
fi

echo ""

# Check if DATABASE_URL is set
if grep -q "^DATABASE_URL=your-database-url" .env 2>/dev/null; then
  echo "⚠️  DATABASE_URL is still set to default value"
  echo "Please update DATABASE_URL in .env with your actual database credentials"
  echo ""
  exit 1
fi

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🔄 Checking database connection..."

# Try to connect to database
if npx prisma db execute --stdin < /dev/null 2>/dev/null; then
  echo "✅ Database connection successful!"
else
  echo "⚠️  Could not connect to database"
  echo "Please verify your DATABASE_URL in .env"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check if database server is running"
  echo "  2. Verify connection string format"
  echo "  3. Check firewall/network settings"
  echo "  4. Verify database credentials"
  exit 1
fi

echo ""
echo "📊 Database setup complete!"
echo ""
echo "Available commands:"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:push      - Push schema to database"
echo "  npm run db:migrate   - Run migrations"
echo "  npm run db:seed      - Seed database"
echo "  npm run db:test      - Test database connection"
echo ""
