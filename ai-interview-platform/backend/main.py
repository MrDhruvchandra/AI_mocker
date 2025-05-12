from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from pydantic import BaseModel
from prompt_templates import question_prompt_template, evaluation_prompt_template
from utils import get_gemini_llm
import json

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for API key at application start
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY environment variable is not set. API functionality will be limited.")

llm = get_gemini_llm()

class QuestionInput(BaseModel):
    topic: str
    experience: str
    duration: int
    difficulty: str

class EvaluateInput(BaseModel):
    question: str
    answer: str

class ChatInput(BaseModel):
    text: str

@app.post("/chat")
async def chat(data: ChatInput):
    """Give proper answer for provided text."""
    try:
        response = llm.invoke(data.text)
        content = response.content if hasattr(response, 'content') else str(response)
        return {"response": content}
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

@app.post("/generate-questions")
async def generate_questions(data: QuestionInput):
    """Generate questions based on the provided input data."""
    try:
        logger.info(f"Received question generation request: {data.dict()}")
        chain = question_prompt_template | llm
        response = chain.invoke(data.dict())
        logger.info("Questions successfully generated")
        # Handle both string and object responses
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Clean up the response and parse JSON
        content = content.replace('```json', '').replace('```', '').strip()
        try:
            questions = json.loads(content)
            if isinstance(questions, list):
                return {"questions": questions}
            else:
                raise ValueError("Expected a list of questions")
        except json.JSONDecodeError:
            # Fallback: split by newlines if JSON parsing fails
            questions = [q.strip() for q in content.split('\n') if q.strip()]
            return {"questions": questions}
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@app.post("/evaluate-answer")
async def evaluate_answer(data: EvaluateInput):
    """Evaluate the given answer based on the question."""
    try:
        logger.info(f"Received evaluation request for question: {data.question[:50]}...")
        chain = evaluation_prompt_template | llm
        response = chain.invoke(data.dict())
        logger.info("Answer successfully evaluated")
        # Handle both string and object responses
        content = response.content if hasattr(response, 'content') else str(response)
        return {"evaluation": content}
    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")
