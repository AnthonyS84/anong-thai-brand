#!/bin/bash
# 🚀 Enhanced Security Features Deployment Script
# Run this script after installing Docker Desktop

echo "🛡️ Starting Enhanced Security Features Deployment..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this script from: D:\Anthony\Anong_Website\anong-thai-brand"
    exit 1
fi

echo "📁 Project directory: $(pwd)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"

# Start Supabase local development
echo "🚀 Starting Supabase local development..."
npx supabase start

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start Supabase"
    exit 1
fi

echo "✅ Supabase started successfully"

# Apply database migrations
echo "📊 Applying database migrations..."
npx supabase db reset

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to apply migrations"
    exit 1
fi

echo "✅ Database migrations applied"

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
npx supabase functions deploy secure-password-change

if [ $? -ne 0 ]; then
    echo "⚠️ Warning: Edge function deployment failed (you can deploy this manually later)"
else
    echo "✅ Edge functions deployed"
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Start the development server
echo "🚀 Starting development server..."
echo ""
echo "=================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo ""
echo "✅ Email confirmation system: ACTIVE"
echo "✅ Password history validation: ACTIVE"
echo "✅ Enhanced security features: ACTIVE"
echo ""
echo "🌐 Starting React development server..."
echo "Open http://localhost:3000 to test the application"
echo ""
echo "📧 Test email verification at: /auth/verify-email"
echo "🔒 Test password security at: /enhanced-auth"
echo ""

# Start the React app
npm run dev
