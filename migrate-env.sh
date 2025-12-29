#!/bin/bash
# Bash script to migrate .env to .dev.vars
# Run this script from the project root: ./migrate-env.sh

echo "🔄 Migrating .env to .dev.vars..."

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Please create .env file with your META_ACCESS_TOKEN"
    exit 1
fi

# Extract META_ACCESS_TOKEN
TOKEN_LINE=$(grep -E '^\s*META_ACCESS_TOKEN\s*=' .env | head -1)
API_VERSION_LINE=$(grep -E '^\s*META_API_VERSION\s*=' .env | head -1)

# Create .dev.vars
> .dev.vars

if [ -n "$TOKEN_LINE" ]; then
    # Remove comments and clean up
    CLEAN_TOKEN=$(echo "$TOKEN_LINE" | sed 's/#.*$//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    echo "$CLEAN_TOKEN" >> .dev.vars
    echo "✅ Found META_ACCESS_TOKEN"
else
    echo "⚠️  META_ACCESS_TOKEN not found in .env"
    echo "META_ACCESS_TOKEN=your_meta_access_token_here" >> .dev.vars
fi

# Add API version
if [ -n "$API_VERSION_LINE" ]; then
    CLEAN_VERSION=$(echo "$API_VERSION_LINE" | sed 's/#.*$//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    echo "$CLEAN_VERSION" >> .dev.vars
else
    echo "META_API_VERSION=v19.0" >> .dev.vars
fi

echo ""
echo "✅ Created .dev.vars file!"
echo ""
echo "📝 Contents:"
cat .dev.vars | sed 's/^/   /'
echo ""
echo "🚀 You can now run: npm run dev"

