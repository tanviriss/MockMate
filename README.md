# Reherse

**AI Voice Interview Coach Platform**

Reherse is a real-time voice-based AI interview coaching platform that helps you practice job interviews with personalized questions, live voice interaction, and detailed AI-powered feedback.

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
- **Authentication**: Clerk
- **State Management**: Zustand
- **Audio**: RecordRTC, Howler.js
- **WebSocket**: Socket.io-client

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Authentication**: Clerk (JWT validation)
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

- Python 3.12+
- Node.js 18+
- Clerk account (for authentication) - https://clerk.com
- Supabase account (for PostgreSQL database and storage)
- Redis instance (required for WebSocket session management)
- API keys for:
  - Clerk API
  - Google Gemini API
  - Groq API (Whisper)
  - ElevenLabs API

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
```env
# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase (Database & Storage only, NOT for auth)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://postgres:[password]@[host]/postgres

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

6. Set up Supabase Storage buckets:
   - Go to Supabase Dashboard → Storage
   - Create two buckets:
     - `resumes` (public: false)
     - `audio-answers` (public: false)
   - Note: No RLS policies needed - backend handles authorization via Clerk

7. Start Redis (if running locally):
```bash
redis-server
```

8. Run database migrations:
```bash
alembic upgrade head
```

9. Start the server:
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk Sign-in/Sign-up URLs (optional, for customization)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage

1. **Sign up / Login** - Create an account or log in
2. **Upload Resume** - Upload your resume (PDF format recommended)
3. **Create Interview** - Paste a job description and generate tailored questions
4. **Start Practice** - Begin live voice interview with AI interviewer
5. **Get Feedback** - Receive detailed evaluation with scores and improvement tips

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests (if configured)
cd frontend
npm test
```

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

### WebSocket Events

The live interview uses Socket.IO with these events:

**Client → Server:**
- `start_interview` - Begin interview session
- `submit_answer` - Send audio answer
- `confirm_answer` - Confirm transcript and move to next question
- `end_interview` - End interview early

**Server → Client:**
- `connected` - Connection established
- `interview_started` - Interview session started
- `question` - New question text
- `question_audio` - Question TTS audio (base64)
- `transcribing` - Answer transcription in progress
- `transcript_ready` - Transcription complete
- `interview_completed` - All questions answered
- `error` - Error occurred

## API Keys Setup

### 1. Clerk (Authentication)
- Visit https://clerk.com/
- Create a free account
- Create a new application
- Get your publishable key and secret key from the API Keys section
- **Frontend**: Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.local`
- **Backend**: Add `CLERK_SECRET_KEY` to `.env`
- Free tier: 10,000 monthly active users

### 2. Google Gemini API
- Visit https://ai.google.dev/
- Create account and get API key
- Free tier: 15 requests/minute, 1500/day

### 3. Groq API (Whisper)
- Visit https://console.groq.com/
- Create account and get API key
- Free tier: Very generous limits

### 4. ElevenLabs API
- Visit https://elevenlabs.io/
- Create account
- Free tier: 10,000 characters/month
- Paid tiers: Creator ($22/month) for more usage

### 5. Supabase (Database & Storage)
- Visit https://supabase.com/
- Create new project
- Get connection string and API keys from project settings
- Create storage buckets: `resumes` and `audio-answers` (set to private)
- **Note**: We use Supabase only for PostgreSQL database and file storage, NOT for authentication
- Free tier: 500MB database, 1GB storage

## Deployment

Ready to deploy to production? See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete step-by-step instructions.

**Quick overview:**
- **Backend**: Railway (with Upstash Redis)
- **Frontend**: Vercel
- **Database**: Supabase (already production)
- **Estimated time**: 1-2 hours
- **Cost**: Free tier available

Deployment includes:
- Production environment configuration
- Redis session management (with in-memory fallback)
- Health check endpoints
- CORS and security headers
- Automatic deployments on git push

## Troubleshooting

### Backend won't start
- Check Redis is running: `redis-cli ping` (should return "PONG")
- App works without Redis (uses in-memory fallback with warning)
- Verify DATABASE_URL is correct
- Ensure all API keys are set in `.env`

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in `.env.local`
- Check CORS settings in backend

### Authentication issues
- Ensure Clerk keys are properly set in both frontend and backend
- Check that CLERK_SECRET_KEY matches in both `.env` files
- Verify Clerk application is active in Clerk dashboard
- Clear browser cache and cookies, then try signing in again

### Audio recording not working
- Use HTTPS or localhost (browser security requirement)
- Grant microphone permissions when prompted
- Check browser compatibility (Chrome/Firefox recommended)

### Network issues on college/corporate WiFi
- Some networks block cloud database connections
- Try using a different network or VPN
- Check firewall settings

