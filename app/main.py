from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.routers.events import router as events_router
from app.storage.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler: initializes database on startup."""
    init_db()
    yield


# Initialize the FastAPI application instance
app = FastAPI(
    title="Q-SHIELD Backend API",
    description="Quantum-Classical Cyber Anomaly Detection Backend",
    version="0.2.0",
    lifespan=lifespan,
)


@app.get("/api/health")
def get_health():
    """Health check endpoint to confirm that the backend server is running."""
    return {
        "status": "healthy",
        "service": "Q-SHIELD Backend",
        "message": "API is running successfully",
    }


# Include Phase 2 Events and Dashboard router
app.include_router(events_router)
