# UE Documentation RAG Backend

This is a Python backend for the Unreal Engine Documentation RAG Dashboard. It provides API endpoints for managing documents, searching, and handling feedback.

## Features

- **Document Management**: Upload, retrieve, update, and delete documents
- **Search**: Search documents using semantic, keyword, or hybrid search
- **User Authentication**: JWT-based authentication with role-based access control
- **Feedback Management**: Collect and manage user feedback on documentation
- **Vector Database Integration**: Integration with Pinecone for vector storage

## Setup

### Prerequisites

- Python 3.9+
- Pinecone account (for vector database)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/ue-rag-backend.git
   cd ue-rag-backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Create a `.env` file based on `.env.example` and add your configuration:
   \`\`\`
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=gcp-starter
   PINECONE_INDEX_NAME=ue-docs
   JWT_SECRET=your-secret-key
   \`\`\`

4. Run the application:
   \`\`\`bash
   uvicorn main:app --reload
   \`\`\`

5. Access the API documentation at [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

### Authentication
- `POST /token` - Get access token
- `GET /users/me` - Get current user
- `POST /users` - Create a new user (admin only)
- `GET /users` - List all users (admin only)

### Dashboard
- `GET /api/stats` - Get dashboard statistics
- `GET /api/documents/recent` - Get recent documents
- `GET /api/searches/popular` - Get popular searches
- `GET /api/categories/distribution` - Get category distribution

### Documents
- `POST /api/documents` - Upload a document
- `GET /api/documents` - Get all documents
- `GET /api/documents/{document_id}` - Get a document by ID
- `PUT /api/documents/{document_id}` - Update a document
- `DELETE /api/documents/{document_id}` - Delete a document

### Search
- `GET /api/categories` - Get all categories
- `GET /api  - Delete a document

### Search
- `GET /api/categories` - Get all categories
- `GET /api/versions` - Get all versions
- `POST /api/search` - Search documents

### Feedback
- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Create feedback
- `PUT /api/feedback/{feedback_id}` - Update feedback status

### Health Check
- `GET /health` - Check system health
- `GET /` - API root information

## Docker

You can also run the application using Docker:

\`\`\`bash
docker build -t ue-rag-backend .
docker run -p 8000:8000 -e PINECONE_API_KEY=your-api-key -e JWT_SECRET=your-secret ue-rag-backend
\`\`\`

## Data Storage

The application stores data in the following files:
- `data/documents_metadata.json` - Document metadata
- `data/feedback.json` - Feedback data
- `data/search_history.json` - Search history
- `data/users.json` - User data
- `data/documents/` - Uploaded document files

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Get a token by sending a POST request to `/token` with your username and password
2. Include the token in the Authorization header of subsequent requests:
   \`\`\`
   Authorization: Bearer your-token-here
   \`\`\`

## Default User

The system creates a default admin user on first run:
- Username: `admin`
- Password: `password123`

Make sure to change this password in production!

## Deployment

### Railway

1. Push this code to a GitHub repository
2. Connect the repository to Railway
3. Set the required environment variables
4. Deploy

### Heroku

1. Push this code to a GitHub repository
2. Connect the repository to Heroku
3. Set the required environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's also create a simple script to generate embeddings:

```python file="utils/embeddings.py"
import os
import json
import pinecone
from typing import List, Dict, Any
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "ue-docs")

def initialize_pinecone():
    """Initialize Pinecone connection"""
    try:
        pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
        
        # Check if index exists, if not create it
        if PINECONE_INDEX_NAME not in pinecone.list_indexes():
            pinecone.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,  # Using OpenAI's embedding dimension
                metric="cosine"
            )
        
        index = pinecone.Index(PINECONE_INDEX_NAME)
        logger.info(f"Connected to Pinecone index: {PINECONE_INDEX_NAME}")
        return index
    except Exception as e:
        logger.error(f"Error connecting to Pinecone: {e}")
        return None

def get_embedding(text: str) -> List[float]:
    """
    Get embedding for text using OpenAI's API
    In a real application, you would use OpenAI's API or another embedding service
    For this example, we'll return a mock embedding
    """
    # Mock embedding - in a real application, you would use:
    # from openai import OpenAI
    # client = OpenAI()
    # response = client.embeddings.create(input=text, model="text-embedding-ada-002")
    # return response.data[0].embedding
    
    # Return a mock embedding of dimension 1536
    import random
    return [random.uniform(-1, 1) for _ in range(1536)]

def process_document(doc_id: str, content: str, metadata: Dict[str, Any]) -> bool:
    """Process a document and store its embeddings in Pinecone"""
    try:
        # Initialize Pinecone
        index = initialize_pinecone()
        if not index:
            return False
        
        # Get embedding for the document
        embedding = get_embedding(content)
        
        # Store in Pinecone
        index.upsert(
            vectors=[
                {
                    "id": doc_id,
                    "values": embedding,
                    "metadata": metadata
                }
            ]
        )
        
        logger.info(f"Successfully processed document: {doc_id}")
        return True
    except Exception as e:
        logger.error(f"Error processing document {doc_id}: {e}")
        return False

def search_documents(query: str, filter_metadata: Dict[str, Any] = None, top_k: int = 5):
    """Search for documents similar to the query"""
    try:
        # Initialize Pinecone
        index = initialize_pinecone()
        if not index:
            return []
        
        # Get embedding for the query
        query_embedding = get_embedding(query)
        
        # Search in Pinecone
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_metadata
        )
        
        return results.matches
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return []

if __name__ == "__main__":
    # Example usage
    doc_id = "test-doc-1"
    content = "This is a test document about Unreal Engine blueprints."
    metadata = {
        "title": "Test Document",
        "category": "Blueprints",
        "version": "UE 5.3"
    }
    
    success = process_document(doc_id, content, metadata)
    print(f"Document processing {'successful' if success else 'failed'}")
    
    # Example search
    results = search_documents("How do blueprints work?")
    print(f"Found {len(results)} results")
    for result in results:
        print(f"Document ID: {result.id}, Score: {result.score}")
        print(f"Metadata: {result.metadata}")
