import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

# Data directory
DATA_DIR = Path("./data")
DOCUMENTS_METADATA_FILE = DATA_DIR / "documents_metadata.json"
FEEDBACK_FILE = DATA_DIR / "feedback.json"
SEARCH_HISTORY_FILE = DATA_DIR / "search_history.json"
USERS_FILE = DATA_DIR / "users.json"

# Helper functions for document metadata
def load_documents_metadata() -> List[Dict[str, Any]]:
    """Load document metadata from JSON file"""
    with open(DOCUMENTS_METADATA_FILE, "r") as f:
        return json.load(f)

def save_documents_metadata(documents: List[Dict[str, Any]]) -> None:
    """Save document metadata to JSON file"""
    with open(DOCUMENTS_METADATA_FILE, "w") as f:
        json.dump(documents, f, indent=2)

# Helper functions for feedback
def load_feedback() -> List[Dict[str, Any]]:
    """Load feedback from JSON file"""
    with open(FEEDBACK_FILE, "r") as f:
        return json.load(f)

def save_feedback(feedback: List[Dict[str, Any]]) -> None:
    """Save feedback to JSON file"""
    with open(FEEDBACK_FILE, "w") as f:
        json.dump(feedback, f, indent=2)

# Helper functions for search history
def load_search_history() -> List[Dict[str, Any]]:
    """Load search history from JSON file"""
    with open(SEARCH_HISTORY_FILE, "r") as f:
        return json.load(f)

def save_search_history(history: List[Dict[str, Any]]) -> None:
    """Save search history to JSON file"""
    with open(SEARCH_HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def update_search_history(query: str, success: bool = True) -> None:
    """Update search history with a new query or increment existing query count"""
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

# Helper functions for users
def load_users() -> List[Dict[str, Any]]:
    """Load users from JSON file"""
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users: List[Dict[str, Any]]) -> None:
    """Save users to JSON file"""
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)
