# Vector RAG Documentation

## Overview

This documentation provides guidance for the Vector RAG system deployed at [https://www.vector-rag.com/](https://www.vector-rag.com/).

## Contents

1. [Service Testing Guide](./service-testing-guide.md) - How to test individual services to isolate issues
2. [Pinecone Node.js Issues](./pinecone-nodejs-issues.md) - Solutions for Node.js module issues with Pinecone

## Quick Links

- Production Site: [https://www.vector-rag.com/](https://www.vector-rag.com/)
- Dashboard: [https://www.vector-rag.com/dashboard](https://www.vector-rag.com/dashboard)
- API Health Check: [https://www.vector-rag.com/api/health](https://www.vector-rag.com/api/health)

## Getting Started

To get started with testing and troubleshooting the Vector RAG system, first check the system status at [https://www.vector-rag.com/dashboard](https://www.vector-rag.com/dashboard) and then follow the guides in this documentation to resolve any issues.

## Project Overview

LLMGraph is a vector-based RAG system that allows users to:

1. Upload documents for processing and embedding
2. Search through documents using semantic search
3. Get AI-powered responses based on the document content
4. Manage documents and track search analytics

## Environment Variables

The application requires the following environment variables:

- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX_NAME` - The name of your Pinecone index
- `OPENAI_API_KEY` - Your OpenAI API key
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL (client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key (client-side)

## Deployment

The application is deployed at: https://www.vector-rag.com/

## Troubleshooting

If you encounter issues with the application, refer to the documentation in this folder for troubleshooting steps.
