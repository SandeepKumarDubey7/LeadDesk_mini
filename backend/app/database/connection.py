"""
Database connection module for LeadDesk Mini.
Establishes a singleton PyMongo client connected to MongoDB Atlas.
Includes GridFS for file storage.
"""

import os
import logging
from pymongo import MongoClient
from dotenv import load_dotenv
import gridfs

load_dotenv()
logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set.")

client = MongoClient(MONGODB_URI)
db = client.get_default_database()

# Collections
leads_collection = db["leads"]
users_collection = db["users"]

# GridFS for file uploads
fs = gridfs.GridFS(db)

# Create indexes safely for performance
try:
    leads_collection.create_index("email")
    leads_collection.create_index("status")
    leads_collection.create_index("created_at")
    users_collection.create_index("email", unique=True)
except Exception as e:
    logger.warning(f"Could not initialize database indexes on module load: {e}")
