import os
import pinecone
import logging
from typing import Optional, Dict, Any, List
import random

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_HOSTNAME = os.getenv("PINECONE_HOSTNAME")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "ue-docs")

def initialize_pinecone():
    """Initialize Pinecone connection"""
    try:
        if not PINECONE_API_KEY:
            logger.error("PINECONE_API_KEY environment variable not set")
            return None
            
        if not PINECONE_HOSTNAME:
            logger.error("PINECONE_HOSTNAME environment variable not set")
            return None
            
        pinecone.init(api_key=PINECONE_API_KEY, host=PINECONE_HOSTNAME)
        
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
