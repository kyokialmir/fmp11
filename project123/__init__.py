from fastapi import FastAPI
from app.routes import auth, users, analytics

app = FastAPI(title="Multi-User Database API")

# Register API routes
app.include_router(auth.router, prefix="/auth")
