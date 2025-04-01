# AI-Powered Financial Report Analysis

This project is a web application that uses AI to analyze financial reports and extract key metrics. It supports various document formats including PDF, Word, and Excel.

## Features

- Document upload and processing
- AI-powered extraction of financial metrics
- Visualization of financial data
- Interactive dashboard

## Tech Stack

- **Frontend**: React
- **Backend**: Python (Flask)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting
- **AI Model**: GPT-4o-mini
- **Visualization**: Matplotlib

## Project Structure

```
.
├── frontend/                # React frontend
│   ├── public/              # Public assets
│   └── src/                 # Source code
│       ├── components/      # React components
│       ├── services/        # API services
│       └── ...
├── backend/                 # Python backend
│   ├── app/                 # Application code
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   └── utils/           # Helper functions
│   └── ...
└── Data/                    # Sample financial documents
```

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.8+
- Firebase account

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Firebase configuration.

4. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up Firebase:
   - Create a Firebase project
   - Download the service account key and save it
   - Set the environment variable `FIREBASE_SERVICE_ACCOUNT_PATH` to the path of your service account key

5. Start the Flask server:
   ```
   python app.py
   ```

## Usage

1. Upload a financial document (PDF, Word, or Excel)
2. Wait for the document to be processed
3. View the extracted financial metrics
4. Explore the visualizations

## License

This project is part of a BSc Computer Science undergraduate project. 
