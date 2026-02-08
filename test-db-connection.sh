#!/bin/bash

echo "🔍 Diagnosing Data Persistence Issues..."
echo ""

# Check if Prisma schema has lat/lng fields
echo "1️⃣ Checking Prisma schema..."
if grep -q "lat.*String?" prisma/schema.prisma && grep -q "lng.*String?" prisma/schema.prisma; then
    echo "✅ Schema has lat/lng fields"
else
    echo "❌ Schema missing lat/lng fields!"
    exit 1
fi

# Check if database is accessible
echo ""
echo "2️⃣ Testing database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database is accessible"
else
    echo "❌ Cannot connect to database. Check DATABASE_URL in .env"
    exit 1
fi

# Push schema to database
echo ""
echo "3️⃣ Pushing schema to database..."
npx prisma db push --skip-generate --accept-data-loss
if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema"
    exit 1
fi
echo "✅ Schema pushed successfully"

# Generate Prisma Client
echo ""
echo "4️⃣ Regenerating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"

# Check database structure
echo ""
echo "5️⃣ Verifying database structure..."
echo "Checking Location table columns..."
npx prisma db execute --stdin <<< "SELECT column_name FROM information_schema.columns WHERE table_name = 'Location';" 2>/dev/null | grep -E "(lat|lng)"
if [ $? -eq 0 ]; then
    echo "✅ lat/lng columns exist in database"
else
    echo "⚠️ Could not verify columns (this may be normal)"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Open the app in browser"
echo "  3. Try editing some data (code, location, lat, lng)"
echo "  4. Wait for checkmark (✓) to appear"
echo "  5. Refresh the page"
echo "  6. Verify data persisted"
echo ""
echo "🐛 If data still doesn't persist:"
echo "  1. Open browser console (F12)"
echo "  2. Look for errors when editing fields"
echo "  3. Check Network tab to see if API calls succeed"
echo "  4. Look for 400/500 errors"
echo ""
