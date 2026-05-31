import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.ai import ai_service, AIInsightRequest

app = FastAPI(title="Crictellect API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mock data
def load_mock_data():
    data_path = os.path.join(os.path.dirname(__file__), "data", "mock_data.json")
    with open(data_path, "r") as f:
        return json.load(f)

# API Endpoints
@app.get("/api/match")
def get_match_data():
    data = load_mock_data()
    return {
        "match_info": data["match_info"],
        "live_score": data["live_score"],
        "partnership": data["partnership"]
    }

@app.get("/api/momentum")
def get_momentum_data():
    data = load_mock_data()
    return {"momentum": data["momentum"]}

@app.get("/api/players")
def get_players_data():
    data = load_mock_data()
    return {"players": data["players"]}

@app.get("/api/teams")
def get_teams_data():
    data = load_mock_data()
    return {"teams": data["teams"]}

@app.get("/api/fantasy")
def get_fantasy_data():
    data = load_mock_data()
    return {"fantasy": data["fantasy"]}

@app.post("/api/insights")
def generate_insight(request: AIInsightRequest):
    insight = ai_service.generate_insight(request.context, request.prompt)
    return {"insight": insight}

# We will serve the static files from the frontend dist folder
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
