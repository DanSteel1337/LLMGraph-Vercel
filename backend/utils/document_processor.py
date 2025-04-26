import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import time
from dotenv import load_dotenv

from .pinecone_client import process_document

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Data directory
DATA_DIR = Path("./data")
DOCUMENTS_DIR = DATA_DIR / "documents"
DOCUMENTS_METADATA_FILE = DATA_DIR / "documents_metadata.json"

def load_documents_metadata() -> List[Dict[str, Any]]:
    """Load document metadata from JSON file"""
    try:
        with open(DOCUMENTS_METADATA_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading document metadata: {e}")
        return []

def save_documents_metadata(documents: List[Dict[str, Any]]) -> bool:
    """Save document metadata to JSON file"""
    try:
        with open(DOCUMENTS_METADATA_FILE, "w") as f:
            json.dump(documents, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving document metadata: {e}")
        return False

def extract_text_from_file(file_path: Path) -> Optional[str]:
    """Extract text from a file based on its extension"""
    try:
        extension = file_path.suffix.lower()
        
        # Text files
        if extension in ['.txt', '.md', '.html', '.htm', '.xml', '.json', '.csv']:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        # PDF files
        elif extension == '.pdf':
            # In a real application, you would use a library like PyPDF2 or pdfminer.six
            # For this example, we'll return a mock extraction
            return f"Mock text extraction from PDF file: {file_path.name}"
        
        # Word documents
        elif extension in ['.doc', '.docx']:
            # In a real application, you would use a library like python-docx
            # For this example, we'll return a mock extraction
            return f"Mock text extraction from Word document: {file_path.name}"
        
        # Unsupported file type
        else:
            logger.warning(f"Unsupported file type: {extension}")
            return None
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {e}")
        return None

def process_pending_documents() -> int:
    """Process all pending documents"""
    documents = load_documents_metadata()
    processed_count = 0
    
    for doc in documents:
        if doc.get("status") == "processing":
            file_path = Path(doc["filepath"])
            
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                doc["status"] = "failed"
                doc["error"] = "File not found"
                continue
            
            # Extract text from file
            content = extract_text_from_file(file_path)
            if not content:
                logger.warning(f"Failed to extract text from {file_path}")
                doc["status"] = "failed"
                doc["error"] = "Text extraction failed"
                continue
            
            # Process document and store embeddings
            metadata = {
                "title": doc["title"],
                "category": doc["category"],
                "version": doc["version"],
                "description": doc.get("description", ""),
                "tags": doc.get("tags", ""),
            }
            
            success = process_document(doc["id"], content, metadata)
            
            if success:
                doc["status"] = "processed"
                doc["processedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S")
                processed_count += 1
            else:
                doc["status"] = "failed"
                doc["error"] = "Processing failed"
    
    # Save updated metadata
    save_documents_metadata(documents)
    
    return processed_count
