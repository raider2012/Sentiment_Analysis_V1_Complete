# Sentiment_Analysis_V1_Complete
Uses TextBlob and Hugging Face/CardiffNLP Models to predict the sentiment of the User's Text input.

To Host it on live servers, make sure you have atleast 1 Gb Memory available for the backend.py as it creates a local Model for the HuggingFace/CardiffNLP.

#Installation and Setup

Prerequisites
Node.js: Install from [nodejs.org](https://nodejs.org/).
Python 3.8+: Download from [python.org](https://www.python.org/).

### Frontend (React)

1. Navigate to the Frontend Directory:

Open a terminal and navigate to your project’s frontend folder (where 'package.json' and 'package-lock.json' are located).

2. Install Dependencies:

npm install

3. Run the Frontend Application:

npm start
   -The application should start on the default port [http://localhost:3000].  
   -If you need to change the port, update your configuration accordingly.

### Backend (Python)

1. Navigate to the Backend Directory:

Open a terminal and navigate to your project’s backend folder (where 'backend.py' and 'requirements.txt' are located).

2. Create a Virtual Environment:

python -m venv virtual_env_name

3. Activate the Virtual Environment:

Windows: venv\Scripts\activate
macOS/Linux: source venv/bin/activate

4. Install Python Dependencies:
   
pip install -r requirements.txt
   - This will install all required packages (e.g., Flask, flask-cors, textblob, openai, transformers, torch).

5. Run the Backend Server:

python backend.py
   - The backend server should start at [http://localhost:3001]. 
   - If required, port can be changed in __main__. Ensure that frontend code points to the new configured port as well.
