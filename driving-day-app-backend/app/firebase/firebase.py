"""
firebase.py

This module is strictly responsible for initializing and connecting Django to 
Firebase using the Firebase Admin SDK. It loads the necessary configuration 
from environment variables, builds the Firebase credentials dynamically, and 
initializes the Firebase app. 

All Firebase-related interactions across the Django project should rely on this 
initialization to ensure a single consistent connection point.

Usage:
    Import this module wherever Firebase services (e.g., Firestore, Auth) are required.
    Example:
        from your_app.firebase import firebase_app

Environment Variables Required:
    - TYPE
    - PROJECT_ID
    - PRIVATE_KEY_ID
    - PRIVATE_KEY
    - CLIENT_EMAIL
    - CLIENT_ID
    - AUTH_URI
    - TOKEN_URI
    - AUTH_PROVIDER_X509_CERT_URL
    - CLIENT_X509_CERT_URL
    - UNIVERSE_DOMAIN
"""
import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv

load_dotenv()


firebase_config = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
}

cred = credentials.Certificate(firebase_config)
firebase_app = firebase_admin.initialize_app(cred)
