# Crictellect

**Turn Every Ball into Intelligence.**

Crictellect is a lightweight AI-powered cricket analytics platform that transforms raw cricket match data into easy-to-understand fan intelligence, predictions, visualizations, and fantasy cricket recommendations.

## Features

- **Match Dashboard**: Live scores, momentum tracking, win probability, and milestone trackers.
- **Player Intelligence**: AI-powered comparison of players for high-pressure situations.
- **Team Intelligence**: Visual comparisons of teams using Radar charts.
- **Fantasy Assistant**: AI recommendations for top captain, vice-captain, and differential picks.
- **AI Insights**: Interactive AI assistant powered by Gemini.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Backend**: FastAPI, Python
- **AI**: Google Gemini API

## Local Development

### Prerequisites
- Node.js
- Python 3.9+
- Gemini API Key

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repo-url>
   cd Crictellect
   \`\`\`

2. **Frontend Setup**
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

3. **Backend Setup**
   Open a new terminal.
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   export GEMINI_API_KEY="your_api_key_here"
   python backend/main.py
   \`\`\`

The frontend will run on `http://localhost:5173` and the backend API on `http://localhost:8000`.

## Deployment (Google Cloud Run)

This repository is ready to be deployed to Google Cloud Run as a single service. The included `Dockerfile` builds both the React app and serves it via FastAPI.

1. Build the Docker image:
   \`\`\`bash
   docker build -t crictellect .
   \`\`\`

2. Run locally to test:
   \`\`\`bash
   docker run -p 8000:8000 -e GEMINI_API_KEY="your_api_key_here" crictellect
   \`\`\`

3. Deploy using gcloud:
   \`\`\`bash
   gcloud run deploy crictellect --source . --port 8000 --set-env-vars="GEMINI_API_KEY=your_api_key_here"
   \`\`\`
