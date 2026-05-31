import json
import os
import urllib.request
import xml.etree.ElementTree as ET
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

# Fetch Live Data from Cricinfo RSS
def fetch_live_match_data():
    try:
        url = "http://static.cricinfo.com/rss/livescores.xml"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        xml_data = response.read()
        root = ET.fromstring(xml_data)
        
        matches = []
        for item in root.findall('.//item'):
            title = item.find('title').text
            if title:
                matches.append(title)
                
        # Try to find an IPL match or take the first one
        selected_match = None
        for m in matches:
            if 'IPL' in m or 'Royal Challengers' in m or 'Gujarat' in m or 'Titans' in m:
                selected_match = m
                break
        
        if not selected_match and matches:
            selected_match = matches[0]
            
        if selected_match:
            # Parse basic info: "TeamA 100/2 v TeamB 150/4"
            parts = selected_match.split(' v ')
            team_a_str = parts[0].strip() if len(parts) > 0 else "Team A"
            team_b_str = parts[1].strip() if len(parts) > 1 else "Team B"
            
            import re
            def parse_team_str(s):
                # look for something like 240/6 or 240/10
                match = re.search(r'(.*?)\s+(\d+)/(\d+)', s)
                if match:
                    return match.group(1).strip(), int(match.group(2)), int(match.group(3))
                # look for just all out e.g., 240
                match_allout = re.search(r'(.*?)\s+(\d+)$', s)
                if match_allout:
                    return match_allout.group(1).strip(), int(match_allout.group(2)), 10
                return s.replace('*', '').strip(), 0, 0

            team_a, score_a, wkts_a = parse_team_str(team_a_str)
            team_b, score_b, wkts_b = parse_team_str(team_b_str)
            
            return {
                "team_a": team_a,
                "team_b": team_b,
                "score_a": score_a,
                "wkts_a": wkts_a,
                "score_b": score_b,
                "wkts_b": wkts_b,
                "status": selected_match
            }
    except Exception as e:
        print("Error fetching live data:", e)
    return None

# API Endpoints
@app.get("/api/match")
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
