#!/bin/bash

# Script to organize documentation files

echo "📁 Organizing documentation files..."

# All MD files are already copied to docs/
# Now we just need to remove the originals from root (except README.md)

echo "🗑️  Removing old documentation files from root..."

# Use git rm to track deletions
git rm COMMIT_INSTRUCTIONS.md 2>/dev/null && echo "✓ Removed COMMIT_INSTRUCTIONS.md"
git rm DATABASE_IMPROVEMENTS.md 2>/dev/null && echo "✓ Removed DATABASE_IMPROVEMENTS.md"
git rm DATABASE_SETUP_GUIDE.md 2>/dev/null && echo "✓ Removed DATABASE_SETUP_GUIDE.md"
git rm DEPLOYMENT.md 2>/dev/null && echo "✓ Removed DEPLOYMENT.md"
git rm PRISMA_DATABASE_SETUP.md 2>/dev/null && echo "✓ Removed PRISMA_DATABASE_SETUP.md"
git rm PWA_SETUP.md 2>/dev/null && echo "✓ Removed PWA_SETUP.md"

echo ""
echo "🗑️  Removing duplicate files..."
git rm PRISMA_SETUP.md 2>/dev/null && echo "✓ Deleted PRISMA_SETUP.md (duplicate of PRISMA_DATABASE_SETUP.md)"
git rm QUICK_PWA_SETUP.md 2>/dev/null && echo "✓ Deleted QUICK_PWA_SETUP.md (duplicate of PWA_SETUP.md)"

echo ""
echo "✅ Documentation organized!"
echo ""
echo "📂 Summary:"
echo "  • All documentation files moved to: docs/"
echo "  • README.md remains at root"
echo "  • Duplicate files removed"
echo ""
echo "📝 Next steps:"
echo "  1. Review changes: git status"
echo "  2. Commit changes: git add -A && git commit -m 'docs: Organize documentation files into docs folder'"
echo "  3. Push to remote: git push"

