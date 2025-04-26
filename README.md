# Unreal Engine Documentation RAG Dashboard

A comprehensive dashboard for managing a Retrieval-Augmented Generation (RAG) system for Unreal Engine documentation. This project provides a user-friendly interface for uploading, managing, searching, and collecting feedback on documentation.

## Features

- **Dashboard**: Overview of system statistics, recent documents, popular searches, and category distribution
- **Document Upload**: Upload documents with metadata, preview content before uploading
- **Document Management**: View, edit, and delete documents in the system
- **Search Interface**: Search documents using semantic, keyword, or hybrid search with filters
- **Feedback Management**: Collect and manage user feedback on documentation

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend**: FastAPI Python backend (optional)
- **Vector Database**: Pinecone (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- (Optional) Python 3.9+ for the backend

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/ue-rag-dashboard.git
   cd ue-rag-dashboard
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:8000
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_HOSTNAME=your-pinecone-hostname
   USE_MOCK_DATA=true # Set to false to use real backend
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup (Optional)

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Create a `.env` file with your Pinecone credentials:
   \`\`\`
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=gcp-starter
   PINECONE_INDEX_NAME=ue-docs
   \`\`\`

4. Run the backend server:
   \`\`\`bash
   uvicorn main:app --reload
   \`\`\`

## Development

### Project Structure

- `app/`: Next.js App Router pages and API routes
- `components/`: React components organized by feature
- `lib/`: Utility functions and API client
- `backend/`: FastAPI backend (optional)

### Mock Data

The application can run with mock data for development purposes. Set `USE_MOCK_DATA=true` in your environment variables to use mock data instead of making real API calls.

### Deployment

#### Frontend

The frontend can be deployed to Vercel:

\`\`\`bash
vercel
\`\`\`

#### Backend

The backend can be deployed to any platform that supports Python, such as:

- Railway
- Heroku
- AWS
- Google Cloud Run

## License

This project is licensed under the MIT License - see the LICENSE file for details.
