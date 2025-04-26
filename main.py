from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
import pinecone
import os
import uuid
from datetime import datetime, timedelta
import json
import shutil
from pathlib import Path
import logging
import time
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log"),
    ],
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="UE Documentation RAG Backend",
    description="Backend API for Unreal Engine Documentation RAG system",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-custom-domain.com",  # Replace with your actual domain
        "https://www.your-custom-domain.com",  # Include www subdomain
        "http://localhost:3000",  # For local development
        "*",  # Allow all origins in development (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "ue-docs")

# JWT Authentication
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-should-be-long-and-random")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Create data directory if it doesn't exist
DATA_DIR = Path("./data")
DOCUMENTS_DIR = DATA_DIR / "documents"
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Store documents metadata in a JSON file
DOCUMENTS_METADATA_FILE = DATA_DIR / "documents_metadata.json"
if not DOCUMENTS_METADATA_FILE.exists():
    with open(DOCUMENTS_METADATA_FILE, "w") as f:
        json.dump([], f)

# Store feedback in a JSON file
FEEDBACK_FILE = DATA_DIR / "feedback.json"
if not FEEDBACK_FILE.exists():
    with open(FEEDBACK_FILE, "w") as f:
        json.dump([], f)

# Store search history in a JSON file
SEARCH_HISTORY_FILE = DATA_DIR / "search_history.json"
if not SEARCH_HISTORY_FILE.exists():
    with open(SEARCH_HISTORY_FILE, "w") as f:
        json.dump([], f)

# Store users in a JSON file
USERS_FILE = DATA_DIR / "users.json"
if not USERS_FILE.exists():
    # Create default admin user
    with open(USERS_FILE, "w") as f:
        json.dump([
            {
                "id": "1",
                "username": "admin",
                "hashed_password": pwd_context.hash("password123"),
                "name": "Admin User",
                "email": "admin@example.com",
                "role": "admin",
                "created_at": datetime.now().isoformat(),
            }
        ], f, indent=2)

# Initialize Pinecone on startup
@app.on_event("startup")
async def startup_db_client():
    try:
        pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
        
        # Check if index exists, if not create it
        if PINECONE_INDEX_NAME not in pinecone.list_indexes():
            pinecone.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,  # Using OpenAI's embedding dimension
                metric="cosine"
            )
        
        app.state.pinecone_index = pinecone.Index(PINECONE_INDEX_NAME)
        logger.info(f"Connected to Pinecone index: {PINECONE_INDEX_NAME}")
    except Exception as e:
        logger.error(f"Error connecting to Pinecone: {e}")
        # Continue without Pinecone for development purposes
        app.state.pinecone_index = None

# Shutdown Pinecone connection
@app.on_event("shutdown")
async def shutdown_db_client():
    if hasattr(app.state, "pinecone_index") and app.state.pinecone_index:
        app.state.pinecone_index = None
        pinecone.deinit()
        logger.info("Disconnected from Pinecone")

# Helper functions
def load_documents_metadata():
    with open(DOCUMENTS_METADATA_FILE, "r") as f:
        return json.load(f)

def save_documents_metadata(documents):
    with open(DOCUMENTS_METADATA_FILE, "w") as f:
        json.dump(documents, f, indent=2)

def load_feedback():
    with open(FEEDBACK_FILE, "r") as f:
        return json.load(f)

def save_feedback(feedback):
    with open(FEEDBACK_FILE, "w") as f:
        json.dump(feedback, f, indent=2)

def load_search_history():
    with open(SEARCH_HISTORY_FILE, "r") as f:
        return json.load(f)

def save_search_history(history):
    with open(SEARCH_HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def load_users():
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def update_search_history(query, success=True):
    history = load_search_history()
    
    # Check if query exists
    for item in history:
        if item["query"] == query:
            item["count"] += 1
            if success:
                item["successful_count"] += 1
            item["success_rate"] = round((item["successful_count"] / item["count"]) * 100)
            save_search_history(history)
            return
    
    # Add new query
    history.append({
        "query": query,
        "count": 1,
        "successful_count": 1 if success else 0,
        "success_rate": 100 if success else 0,
        "timestamp": datetime.now().isoformat(),
    })
    save_search_history(history)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(username: str):
    users = load_users()
    for user in users:
        if user["username"] == username:
            return user
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    return current_user

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    name: str
    email: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: str

class UserInDB(User):
    hashed_password: str

class DocumentBase(BaseModel):
    title: str
    category: str
    version: str
    description: Optional[str] = None
    tags: Optional[str] = None

class DocumentUpdate(DocumentBase):
    pass

class SearchFilters(BaseModel):
    categories: List[str] = []
    versions: List[str] = []

class SearchRequest(BaseModel):
    query: str
    mode: str = "semantic"  # semantic, keyword, hybrid
    filters: SearchFilters = Field(default_factory=SearchFilters)

class FeedbackCreate(BaseModel):
    documentId: str
    content: str
    correction: str
    submittedBy: str = "anonymous"

class FeedbackStatusUpdate(BaseModel):
    status: str  # approved, rejected

# API Routes

# Authentication
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

@app.post("/users", response_model=User)
async def create_user(user: UserCreate, current_user: dict = Depends(get_current_active_user)):
    # Only admins can create users
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    users = load_users()
    
    # Check if username already exists
    if any(u["username"] == user.username for u in users):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "username": user.username,
        "hashed_password": get_password_hash(user.password),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": datetime.now().isoformat(),
    }
    
    users.append(new_user)
    save_users(users)
    
    # Return user without password
    user_dict = new_user.copy()
    del user_dict["hashed_password"]
    return user_dict

@app.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(get_current_active_user)):
    # Only admins can list users
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to list users")
    
    users = load_users()
    
    # Remove hashed passwords
    for user in users:
        user.pop("hashed_password", None)
    
    return users

# Dashboard stats
@app.get("/api/stats")
async def get_stats(current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    search_history = load_search_history()
    feedback = load_feedback()
    
    # Get vector count from Pinecone
    vector_count = 0
    if hasattr(app.state, "pinecone_index") and app.state.pinecone_index:
        try:
            stats = app.state.pinecone_index.describe_index_stats()
            vector_count = stats.get("total_vector_count", 0)
        except Exception as e:
            logger.error(f"Error getting Pinecone stats: {e}")
    
    return {
        "totalDocuments": len(documents),
        "totalSearches": sum(item["count"] for item in search_history),
        "totalFeedback": len(feedback),
        "vectorCount": vector_count,
        "version": "1.0.0",
    }

# Recent documents
@app.get("/api/documents/recent")
async def get_recent_documents(limit: int = 5, current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    # Sort by uploadedAt in descending order
    documents.sort(key=lambda x: x["uploadedAt"], reverse=True)
    return documents[:limit]

# Popular searches
@app.get("/api/searches/popular")
async def get_popular_searches(limit: int = 5, current_user: dict = Depends(get_current_active_user)):
    search_history = load_search_history()
    # Sort by count in descending order
    search_history.sort(key=lambda x: x["count"], reverse=True)
    
    result = []
    for item in search_history[:limit]:
        result.append({
            "query": item["query"],
            "count": item["count"],
            "successRate": item["success_rate"]
        })
    
    return result

# Category distribution
@app.get("/api/categories/distribution")
async def get_category_distribution(current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    
    # Count documents by category
    category_counts = {}
    for doc in documents:
        category = doc["category"]
        if category in category_counts:
            category_counts[category] += 1
        else:
            category_counts[category] = 1
    
    # Calculate percentages
    total_docs = len(documents)
    result = []
    
    for category, count in category_counts.items():
        percentage = round((count / total_docs) * 100) if total_docs > 0 else 0
        result.append({
            "name": category,
            "count": count,
            "percentage": percentage
        })
    
    # Sort by count in descending order
    result.sort(key=lambda x: x["count"], reverse=True)
    
    return result

# Upload document
@app.post("/api/documents")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    version: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_active_user)
):
    # Generate a unique ID for the document
    doc_id = str(uuid.uuid4())
    
    # Save the file
    file_path = DOCUMENTS_DIR / f"{doc_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create document metadata
    document = {
        "id": doc_id,
        "title": title,
        "category": category,
        "version": version,
        "description": description,
        "tags": tags,
        "filename": file.filename,
        "filepath": str(file_path),
        "size": file_size,
        "status": "processing",  # Initial status
        "uploadedAt": datetime.now().isoformat(),
        "uploadedBy": current_user["username"],
    }
    
    # Save document metadata
    documents = load_documents_metadata()
    documents.append(document)
    save_documents_metadata(documents)
    
    # In a real application, you would process the document here
    # For now, we'll just update the status to "processed" after a delay
    # This would be done asynchronously in a real application
    
    # Update document status to "processed"
    for doc in documents:
        if doc["id"] == doc_id:
            doc["status"] = "processed"
            break
    
    save_documents_metadata(documents)
    
    return {"id": doc_id, "status": "processing"}

# Get all documents
@app.get("/api/documents")
async def get_documents(current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    return documents

# Get document by ID
@app.get("/api/documents/{document_id}")
async def get_document(document_id: str, current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    for doc in documents:
        if doc["id"] == document_id:
            return doc
    
    raise HTTPException(status_code=404, detail="Document not found")

# Update document
@app.put("/api/documents/{document_id}")
async def update_document(
    document_id: str, 
    document_update: DocumentUpdate, 
    current_user: dict = Depends(get_current_active_user)
):
    documents = load_documents_metadata()
    
    for i, doc in enumerate(documents):
        if doc["id"] == document_id:
            # Update document fields
            update_dict = document_update.dict(exclude_unset=True)
            documents[i].update(update_dict)
            documents[i]["updatedAt"] = datetime.now().isoformat()
            documents[i]["updatedBy"] = current_user["username"]
            save_documents_metadata(documents)
            return documents[i]
    
    raise HTTPException(status_code=404, detail="Document not found")

# Delete document
@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str, current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    
    for i, doc in enumerate(documents):
        if doc["id"] == document_id:
            # Delete the file
            file_path = Path(doc["filepath"])
            if file_path.exists():
                os.remove(file_path)
            
            # Remove from metadata
            deleted_doc = documents.pop(i)
            save_documents_metadata(documents)
            
            # In a real application, you would also remove the document from Pinecone
            
            return {"success": True, "id": document_id}
    
    raise HTTPException(status_code=404, detail="Document not found")

# Get categories
@app.get("/api/categories")
async def get_categories(current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    
    # Extract unique categories
    categories = set()
    for doc in documents:
        categories.add(doc["category"])
    
    result = []
    for category in categories:
        result.append({
            "id": category.lower(),
            "name": category
        })
    
    return result

# Get versions
@app.get("/api/versions")
async def get_versions(current_user: dict = Depends(get_current_active_user)):
    documents = load_documents_metadata()
    
    # Extract unique versions
    versions = set()
    for doc in documents:
        versions.add(doc["version"])
    
    result = []
    for version in versions:
        result.append({
            "id": version.lower().replace(" ", ""),
            "name": version
        })
    
    return result

# Search
@app.post("/api/search")
async def search(
    search_request: SearchRequest, 
    current_user: dict = Depends(get_current_active_user)
):
    query = search_request.query
    mode = search_request.mode
    filters = search_request.filters
    
    # In a real application, you would:
    # 1. Convert the query to an embedding
    # 2. Search Pinecone with the embedding
    # 3. Retrieve the matching documents
    # 4. Apply filters
    # 5. Return the results
    
    # For now, we'll return mock results
    documents = load_documents_metadata()
    
    # Filter by category and version if specified
    filtered_docs = documents
    if filters.categories:
        filtered_docs = [doc for doc in filtered_docs if doc["category"].lower() in [c.lower() for c in filters.categories]]
    if filters.versions:
        filtered_docs = [doc for doc in filtered_docs if doc["version"].lower().replace(" ", "") in [v.lower() for v in filters.versions]]
    
    # Simple keyword matching for demo purposes
    results = []
    for doc in filtered_docs:
        if query.lower() in doc["title"].lower():
            # Create a mock search result
            results.append({
                "id": doc["id"],
                "title": doc["title"],
                "content": f"This is a sample content from {doc['title']}. In a real application, this would be the actual content from the document.",
                "category": doc["category"],
                "version": doc["version"],
                "score": 0.85,  # Mock score
                "highlights": [f"This is a sample content from <mark>{query}</mark>. In a real application, this would be the actual content with highlighted matches."]
            })
    
    # Update search history
    update_search_history(query, len(results) > 0)
    
    return results

# Get feedback
@app.get("/api/feedback")
async def get_feedback(current_user: dict = Depends(get_current_active_user)):
    feedback = load_feedback()
    return feedback

# Create feedback
@app.post("/api/feedback")
async def create_feedback(
    feedback_create: FeedbackCreate, 
    current_user: dict = Depends(get_current_active_user)
):
    documents = load_documents_metadata()
    
    # Check if document exists
    document_exists = False
    document_title = ""
    for doc in documents:
        if doc["id"] == feedback_create.documentId:
            document_exists = True
            document_title = doc["title"]
            break
    
    if not document_exists:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Create feedback
    feedback_id = str(uuid.uuid4())
    new_feedback = {
        "id": feedback_id,
        "documentId": feedback_create.documentId,
        "documentTitle": document_title,
        "content": feedback_create.content,
        "correction": feedback_create.correction,
        "status": "pending",
        "submittedAt": datetime.now().isoformat(),
        "submittedBy": current_user["username"],
    }
    
    # Save feedback
    feedback = load_feedback()
    feedback.append(new_feedback)
    save_feedback(feedback)
    
    return new_feedback

# Update feedback status
@app.put("/api/feedback/{feedback_id}")
async def update_feedback_status(
    feedback_id: str, 
    status_update: FeedbackStatusUpdate, 
    current_user: dict = Depends(get_current_active_user)
):
    # Only admins can update feedback status
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update feedback status")
    
    feedback = load_feedback()
    
    for i, item in enumerate(feedback):
        if item["id"] == feedback_id:
            feedback[i]["status"] = status_update.status
            feedback[i]["updatedAt"] = datetime.now().isoformat()
            feedback[i]["updatedBy"] = current_user["username"]
            save_feedback(feedback)
            return {"id": feedback_id, "status": status_update.status}
    
    raise HTTPException(status_code=404, detail="Feedback not found")

# Health check endpoint
@app.get("/health")
async def health_check():
    # Check Pinecone connection
    pinecone_status = "disconnected"
    if hasattr(app.state, "pinecone_index") and app.state.pinecone_index:
        try:
            stats = app.state.pinecone_index.describe_index_stats()
            pinecone_status = "connected"
        except Exception as e:
            pinecone_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "connections": {
            "pinecone": pinecone_status,
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "UE Documentation RAG Backend API",
        "version": "1.0.0",
        "docs": "/docs",
    }

# Run the application
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
