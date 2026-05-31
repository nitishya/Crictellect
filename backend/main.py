import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

from services.ai import ai_service
from services.live_data import fetch_live_match_data

app = FastAPI(title="Crictellect API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security: Strict input validation for AI prompts ---
class AIInsightRequest(BaseModel):
    context: str = Field(..., max_length=4000)
    prompt: str = Field(..., min_length=3, max_length=500)

    @field_validator("prompt")
    @classmethod
    def no_injection(cls, v: str) -> str:
        # Block common prompt-injection patterns
        blocked = ["ignore previous", "ignore all", "system:", "you are now", "<script"]
        lower = v.lower()
        for phrase in blocked:
            if phrase in lower:
                raise ValueError("Prompt contains disallowed content.")
        return v

# --- Data helpers ---
def load_mock_data():
    data_path = os.path.join(os.path.dirname(__file__), "data", "mock_data.json")
    with open(data_path, "r") as f:
        return json.load(f)

# --- API Endpoints ---
@app.get("/api/match", tags=["Match"])
def get_match_data():
    data = load_mock_data()
    live_data = fetch_live_match_data()

    if live_data:
        data["match_info"]["team_a"] = live_data["team_a"]
        data["match_info"]["team_b"] = live_data["team_b"]
        data["match_info"]["status"] = "LIVE: " + live_data["status"]
        data["live_score"]["team_a_total"] = live_data["score_a"]
        data["live_score"]["team_a_wickets"] = live_data["wkts_a"]
        data["live_score"]["team_b_total"] = live_data["score_b"]
        data["live_score"]["team_b_wickets"] = live_data["wkts_b"]

    return {
        "match_info": data["match_info"],
        "live_score": data["live_score"],
        "partnership": data["partnership"]
    }

@app.get("/api/momentum", tags=["Match"])
def get_momentum_data():
    data = load_mock_data()
    return {"momentum": data["momentum"]}

@app.get("/api/players", tags=["Intelligence"])
def get_players_data():
    data = load_mock_data()
    return {"players": data["players"]}

@app.get("/api/teams", tags=["Intelligence"])
def get_teams_data():
    data = load_mock_data()
    return {"teams": data["teams"]}

@app.get("/api/fantasy", tags=["Fantasy"])
def get_fantasy_data():
    data = load_mock_data()
    return {"fantasy": data["fantasy"]}

@app.post("/api/insights", tags=["AI"])
def generate_insight(request: AIInsightRequest):
    insight = ai_service.generate_insight(request.context, request.prompt)
    return {"insight": insight}

@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok"}

# Serve static frontend files in production
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
