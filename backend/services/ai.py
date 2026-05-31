import os
from google import genai
from pydantic import BaseModel

class AIInsightRequest(BaseModel):
    context: str
    prompt: str

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def generate_insight(self, context: str, prompt: str) -> str:
        if not self.client:
            return "AI Insights are disabled. Please configure GEMINI_API_KEY."
        
        try:
            full_prompt = f"Context: {context}\n\nTask: {prompt}\n\nPlease keep the response concise and formatted as markdown."
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            return f"Error generating insight: {str(e)}"

ai_service = AIService()
