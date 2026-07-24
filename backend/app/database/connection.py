"""
Database connection module for LeadDesk Mini.
Establishes a singleton PyMongo client connected to MongoDB Atlas.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set.")

client = MongoClient(MONGODB_URI)
db = client.get_default_database()

# Collections
leads_collection = db["leads"]
users_collection = db["users"]

# Create indexes for performance
leads_collection.create_index("email")
leads_collection.create_index("status")
leads_collection.create_index("created_at")
users_collection.create_index("email", unique=True)
