from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import pinecone
import os
import uuid
from datetime import datetime
import json
import shutil
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="UE Documentation RAG Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-custom-domain.com",  # Replace with your actual domain
        "https://www.your-custom-domain.com",  # Include www subdomain
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "ue-docs")

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
        print(f"Connected to Pinecone index: {PINECONE_INDEX_NAME}")
    except Exception as e:
        print(f"Error connecting to Pinecone: {e}")
        # Continue without Pinecone for development purposes
        app.state.pinecone_index = None

# Shutdown Pinecone connection
@app.on_event("shutdown")
async def shutdown_db_client():
    if hasattr(app.state, "pinecone_index") and app.state.pinecone_index:
        app.state.pinecone_index = None
        pinecone.deinit()

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
        "success_rate": 100 if success else 0
    })
    save_search_history(history)

# Pydantic models
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
    filters: SearchFilters = SearchFilters()

class FeedbackCreate(BaseModel):
    documentId: str
    content: str
    correction: str
    submittedBy: str = "anonymous"

class FeedbackStatusUpdate(BaseModel):
    status: str  # approved, rejected

# API Routes

# Dashboard stats
@app.get("/api/stats")
async def get_stats():
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
            print(f"Error getting Pinecone stats: {e}")
    
    return {
        "totalDocuments": len(documents),
        "totalSearches": sum(item["count"] for item in search_history),
        "totalFeedback": len(feedback),
        "vectorCount": vector_count
    }

# Recent documents
@app.get("/api/documents/recent")
async def get_recent_documents(limit: int = 5):
    documents = load_documents_metadata()
    # Sort by uploadedAt in descending order
    documents.sort(key=lambda x: x["uploadedAt"], reverse=True)
    return documents[:limit]

# Popular searches
@app.get("/api/searches/popular")
async def get_popular_searches(limit: int = 5):
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
async def get_category_distribution():
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
    tags: Optional[str] = Form(None)
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
        "uploadedAt": datetime.now().isoformat()
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
async def get_documents():
    documents = load_documents_metadata()
    return documents

# Get document by ID
@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
    documents = load_documents_metadata()
    for doc in documents:
        if doc["id"] == document_id:
            return doc
    
    raise HTTPException(status_code=404, detail="Document not found")

# Update document
@app.put("/api/documents/{document_id}")
async def update_document(document_id: str, document_update: DocumentUpdate):
    documents = load_documents_metadata()
    
    for i, doc in enumerate(documents):
        if doc["id"] == document_id:
            # Update document fields
            documents[i].update(document_update.dict(exclude_unset=True))
            save_documents_metadata(documents)
            return documents[i]
    
    raise HTTPException(status_code=404, detail="Document not found")

# Delete document
@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
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
async def get_categories():
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
async def get_versions():
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
async def search(search_request: SearchRequest):
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
async def get_feedback():
    feedback = load_feedback()
    return feedback

# Create feedback
@app.post("/api/feedback")
async def create_feedback(feedback_create: FeedbackCreate):
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
        "submittedBy": feedback_create.submittedBy
    }
    
    # Save feedback
    feedback = load_feedback()
    feedback.append(new_feedback)
    save_feedback(feedback)
    
    return new_feedback

# Update feedback status
@app.put("/api/feedback/{feedback_id}")
async def update_feedback_status(feedback_id: str, status_update: FeedbackStatusUpdate):
    feedback = load_feedback()
    
    for i, item in enumerate(feedback):
        if item["id"] == feedback_id:
            feedback[i]["status"] = status_update.status
            save_feedback(feedback)
            return {"id": feedback_id, "status": status_update.status}
    
    raise HTTPException(status_code=404, detail="Feedback not found")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "UE Documentation RAG Backend API"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
