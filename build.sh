#!/bin/bash

echo "�� Building Wellbeing Companion Project..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf dist
mkdir -p dist/frontend dist/backend

# Copy backend files
echo -e "${BLUE}📦 Copying backend files...${NC}"
cp -r backend/server.js dist/backend/
cp backend/package.json dist/backend/
cp backend/.env dist/backend/ 2>/dev/null || echo "No .env file found (that's okay)"

# Copy frontend files
echo -e "${BLUE}📦 Copying frontend files...${NC}"
cp frontend/*.html dist/frontend/
cp frontend/*.css dist/frontend/
cp frontend/*.js dist/frontend/
cp frontend/logo.jpeg dist/frontend/ 2>/dev/null || echo "No logo found (that's okay)"

# Install backend dependencies
echo -e "${BLUE}📥 Installing backend dependencies...${NC}"
cd dist/backend
npm install --production
cd ../..

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
tar -czf wellbeing-companion-v1.0.0.tar.gz dist/

# Create README for deployment
cat > dist/README.md << 'INNEREOF'
# Wellbeing Companion - Deployment Guide

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```

Server runs on: http://localhost:3001

### Frontend Setup
Simply open `frontend/index.html` in a browser or use a static server:

```bash
cd frontend
python3 -m http.server 3000
# or
npx serve -p 3000
```

Frontend runs on: http://localhost:3000

## Environment Variables

Create `backend/.env`:
```
PORT=3001
OPENROUTER_API_KEY=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
```

## Features
- ✅ AI-powered mental health chatbot
- ✅ Personalized quiz assessment
- ✅ Mood tracking dashboard
- ✅ Task recommendations
- ✅ Privacy-first design

## Tech Stack
- Backend: Node.js + Express
- Frontend: Vanilla JS + HTML/CSS
- AI: OpenRouter (DeepSeek, Llama, Gemini)

## Support
For issues, contact: support@wellbeingcompanion.ai
INNEREOF

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo -e "${YELLOW}📁 Build output:${NC}"
echo "  - dist/backend/     → Backend server"
echo "  - dist/frontend/    → Frontend files"
echo "  - wellbeing-companion-v1.0.0.tar.gz → Deployment package"
echo ""
echo -e "${GREEN}🎉 Ready to deploy!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. cd dist/backend && npm start"
echo "  2. cd dist/frontend && python3 -m http.server 3000"
echo "  3. Open http://localhost:3000 in your browser"
