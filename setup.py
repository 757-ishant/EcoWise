#!/usr/bin/env python3
"""
Setup script for AI ML Waste Classification Project
"""

import os
import subprocess
import sys

def upgrade_packaging_tools():
    """Upgrade pip, setuptools, and wheel to avoid build errors."""
    print("Upgrading packaging tools...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"])

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--no-build-isolation", "-r", "requirements.txt"])

def setup_database():
    """Initialize database"""
    print("Setting up database...")
    try:
        from init_db import init_database
        init_database()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Database setup failed: {e}")
        print("Please ensure MySQL is running and credentials are correct")

def download_dataset():
    """Download dataset if not exists"""
    print("Checking dataset...")
    if not os.path.exists("datasets/garbage_classification"):
        print("Downloading dataset...")
        try:
            from download_dataset import download_dataset
            download_dataset()
        except Exception as e:
            print(f"Dataset download failed: {e}")
            print("Please ensure Kaggle credentials are set up")

def main():
    print("Setting up AI ML Waste Classification Project...")
    
    try:
        upgrade_packaging_tools()
        install_requirements()
        setup_database()
        download_dataset()
        print("\nSetup completed successfully!")
        print("Run 'python run_app.py' to start the application")
    except Exception as e:
        print(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()