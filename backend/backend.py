import sqlite3
import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from textblob import TextBlob
from datetime import datetime
from transformers import pipeline

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True) 

hf_sentiment_pipeline = pipeline(
    "sentiment-analysis", 
    model="cardiffnlp/twitter-roberta-base-sentiment", 
    tokenizer="cardiffnlp/twitter-roberta-base-sentiment"
)

#SQLite3 Initialization
def init_db():
    conn = sqlite3.connect('app.db', check_same_thread=False)
    c = conn.cursor()
    # Create users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT
        )
    ''')
    # Create history table
    c.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            statement TEXT,
            TEXTBLOB_Analysis TEXT,
            HUGGING_FACE_Analysis TEXT,
            created_at TEXT,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    ''')
    conn.commit()
    return conn

db = init_db()

@app.route('/create', methods=['POST'])
def create_account():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    c = db.cursor()
    try:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"message": "Username already exists"}), 409

    return jsonify({"message": "Account created successfully"}), 200

#Initial User
def insert_dummy_users():
    c = db.cursor()
    dummy_users = [("user1", "password123")]
    for user in dummy_users:
        c.execute("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)", user)
    db.commit()

insert_dummy_users()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    c = db.cursor()
    c.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
    user = c.fetchone()
    
    if user:
        session['username'] = username
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401


def analyze_text_huggingface(text):
    try:
        result = hf_sentiment_pipeline(text)
        sentiment = result[0]["label"]
        label_map = {
            "LABEL_0": "Negative",
            "LABEL_1": "Neutral",
            "LABEL_2": "Positive"
        }
        return label_map.get(sentiment, "Neutral")
    except Exception as e:
        print("HuggingFace pipeline error:", e)
        return "Neutral"


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'username' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"message": "No text provided"}), 400

    #TEXTBLOB ANALYSIS
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity > 0.1:
        textblob_sentiment = "Positive"
    elif polarity < -0.1:
        textblob_sentiment = "Negative"
    else:
        textblob_sentiment = "Neutral"
    
    #HuggING FACE ANALYSIS
    huggingface_sentiment = analyze_text_huggingface(text)

    analysis_result = {
        "text": text,
        "TEXTBLOB_Analysis": textblob_sentiment,
        "HUGGING_FACE_Analysis": huggingface_sentiment
    }
    
    username = session['username']
    c = db.cursor()
    created_at = datetime.now().strftime('%m-%d-%y T%H-%M-%S')
    c.execute("""
        INSERT INTO history (username, statement, TEXTBLOB_Analysis, HUGGING_FACE_Analysis, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (username, text, textblob_sentiment, huggingface_sentiment, created_at))
    db.commit()
    
    return jsonify(analysis_result), 200

@app.route('/history', methods=['GET'])
def get_history():
    if 'username' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    username = session['username']
    c = db.cursor()
    c.execute("""
        SELECT statement, TEXTBLOB_Analysis, HUGGING_FACE_Analysis, created_at
        FROM history
        WHERE username = ?
        ORDER BY id DESC
    """, (username,))

    rows = c.fetchall()
    history_data = []
    for row in rows:
        history_data.append({
            "text": row[0],
            "TEXTBLOB_Analysis": row[1],
            "HUGGING_FACE_Analysis": row[2],
            "timestamp": row[3]
        })
    return jsonify(history_data), 200

if __name__ == '__main__':
    app.run(port=3001)
