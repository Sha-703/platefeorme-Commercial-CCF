#!/bin/bash
# Setup script for the platform

set -e

echo "🚀 Initializing Plateforme Correspondance Commerciale..."

# Create directory structure
mkdir -p prisma
mkdir -p app/api/auth
mkdir -p app/api/resources
mkdir -p app/api/courses
mkdir -p app/api/quizzes
mkdir -p app/auth
mkdir -p app/dashboard
mkdir -p app/courses
mkdir -p app/quiz
mkdir -p components
mkdir -p lib
mkdir -p public/uploads

# Move schema to proper location if it exists
if [ -f "schema.prisma" ]; then
  mv schema.prisma prisma/schema.prisma
  echo "✓ Moved schema to prisma/schema.prisma"
fi

echo "✓ Directory structure created"
echo "📦 Next step: npm install && npm run db:migrate"
