"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, engine
from .api import auth, assessments, finance, ai, reports, opportunities

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (idempotent — safe for existing tables)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="GramUdyam Advisor API",
    description=(
        "Business Decision Intelligence Platform for rural entrepreneurs. "
        "Financial calculations are deterministic. AI responses are advisory only."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(opportunities.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
