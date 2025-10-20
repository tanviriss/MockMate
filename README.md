# MockMate

**AI Voice Interview Coach Platform**

MockMate is a real-time voice-based AI interview coaching platform that helps you practice job interviews with personalized questions, live voice interaction, and detailed AI-powered feedback.

## Features

- 📄 **Resume Analysis** - Upload your resume and extract structured data with AI
- 🎯 **Job-Specific Questions** - Generate tailored interview questions based on your resume and job description
- 🎤 **Voice Practice** - Real-time voice interview simulation with natural speech
- 🤖 **AI Feedback** - Detailed evaluation with strengths, weaknesses, and improvement tips
- 📊 **Progress Tracking** - Track your improvement over multiple practice sessions
- 💯 **100% Free Tier** - Built on free AI services (Gemini, Groq, ElevenLabs)

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Audio**: RecordRTC, Howler.js
- **WebSocket**: Socket.io-client

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Authentication**: JWT
- **WebSocket**: Python-SocketIO

### AI Services
- **LLM**: Google Gemini 2.5 Flash (resume parsing, question generation, evaluation)
- **Speech-to-Text**: Groq Whisper API
- **Text-to-Speech**: ElevenLabs

## Project Structure

```
mockmate/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   ├── auth/           # Authentication
│   │   └── websocket/      # WebSocket handlers
│   ├── tests/              # Backend tests
│   ├── alembic/            # Database migrations
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
│
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── DEVELOPMENT_PLAN.md     # Detailed build plan
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or Supabase account)
- Redis (optional for local dev)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Configure environment variables in `.env`:
- Add your API keys (Gemini, Groq, ElevenLabs)
- Set database URL
- Configure JWT secret

6. Run database migrations:
```bash
alembic upgrade head
```

7. Start the server:
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Development

- **Backend API docs**: http://localhost:8000/docs (auto-generated Swagger)
- **Backend health check**: http://localhost:8000/health

## API Keys Required

You'll need free API keys from:

1. **Google Gemini**: https://ai.google.dev/
2. **Groq**: https://console.groq.com/
3. **ElevenLabs**: https://elevenlabs.io/
4. **Supabase**: https://supabase.com/ (for database and storage)

All services have generous free tiers!

## Development Roadmap

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the detailed 14-phase build plan.

**Current Phase**: Phase 0 - Project Setup ✅

## Contributing

This is an active development project. We're building step-by-step following the development plan.

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for job seekers everywhere**
