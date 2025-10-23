from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from app.config import settings
from app.routers import auth, test, resumes, interviews, audio
from app.websocket.interview_handler import sio

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI Voice Interview Coach Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
)

socket_app = socketio.ASGIApp(sio, app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(test.router)
app.include_router(resumes.router)
app.include_router(interviews.router)
app.include_router(audio.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MockMate API",
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
    }

app = socket_app
