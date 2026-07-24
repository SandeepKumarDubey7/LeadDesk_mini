"""
LeadDesk Mini — FastAPI Application Entry Point.
Configures CORS, mounts all route modules, and provides health check.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import auth, leads, dashboard

load_dotenv()

# --- App Configuration ---
app = FastAPI(
    title="LeadDesk Mini API",
    description="Backend API for LeadDesk Mini — Lead Capture & Admin Dashboard. Built for Digital Heroes Internship.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- CORS Middleware ---
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routers ---
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(dashboard.router)


# --- Health Check ---
@app.get(
    "/",
    tags=["Health"],
    summary="Health Check",
    description="Verify the API is running.",
)
async def health_check():
    """Root endpoint — confirms the API is live."""
    return {
        "status": "healthy",
        "app": "LeadDesk Mini API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get(
    "/api/health",
    tags=["Health"],
    summary="API Health Check",
)
async def api_health():
    """API health endpoint for monitoring services."""
    return {"status": "ok"}
