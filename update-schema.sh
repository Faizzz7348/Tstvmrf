#!/bin/bash

echo "🔧 Applying Database Schema Updates..."
echo ""

echo "Step 1: Pushing schema changes to database..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema changes"
    exit 1
fi

echo "✅ Schema pushed successfully!"
echo ""

echo "Step 2: Regenerating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated successfully!"
echo ""

echo "🎉 All done! Database now has lat and lng fields."
echo ""
echo "Next steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Test editing lat/lng fields in the app"
echo "  3. Verify data saves correctly"
echo ""
