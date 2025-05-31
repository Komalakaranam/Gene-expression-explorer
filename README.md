# Gene Expression Explorer

A web application for analyzing and visualizing gene expression data from NCBI's GEO repository. This project was created for Hack 4 Mini 2.0 in the HealthTech & Bioinformatics category.

## Features

- Search and fetch datasets from NCBI's GEO repository
- Analyze differential gene expression between healthy and disease samples
- Interactive visualizations of gene expression data
- User-friendly web interface for data exploration

## Tech Stack

- Backend: Python (Flask)
- Frontend: React with TypeScript
- Data Analysis: Pandas, SciPy, scikit-learn
- Visualization: Plotly
- Database: SQLite (for caching)

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python backend/app.py
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Team

Team Name: anits girls 