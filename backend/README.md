# UE Documentation RAG Backend

This is a Python backend for the Unreal Engine Documentation RAG Dashboard. It provides API endpoints for managing documents, searching, and handling feedback.

## Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`
3. Create a `.env` file based on `.env.example` and add your Pinecone API key
4. Run the application:
   \`\`\`
   uvicorn main:app --reload
   \`\`\`

## API Endpoints

The backend provides the following API endpoints:

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
- `GET /api/versions` - Get all versions
- `POST /api/search` - Search documents

### Feedback
- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Create feedback
- `PUT /api/feedback/{feedback_id}` - Update feedback status

## Docker

You can also run the application using Docker:

\`\`\`
docker build -t ue-rag-backend .
docker run -p 8000:8000 -e PINECONE_API_KEY=your-api-key ue-rag-backend
\`\`\`

## Data Storage

The application stores data in the following files:
- `data/documents_metadata.json` - Document metadata
- `data/feedback.json` - Feedback data
- `data/search_history.json` - Search history
- `data/documents/` - Uploaded document files
