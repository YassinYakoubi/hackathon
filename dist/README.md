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
