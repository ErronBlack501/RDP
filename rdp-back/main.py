from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as petri_router

# Création de l'application FastAPI
app = FastAPI(
    title="Petri Net Simulation API",
    description="API pour la simulation de Réseaux de Petri",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(petri_router)


@app.get("/")
async def root():
    """
    Route racine
    """
    return {
        "message": "Petri Net Simulation API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/petri/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)