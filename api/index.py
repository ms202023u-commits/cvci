from flask import Flask, render_template, request, jsonify, session
import sqlite3
import os
from datetime import datetime, timedelta
import random
import math
from geopy.distance import geodesic
from openai import OpenAI
import json
import requests
from bs4 import BeautifulSoup
import re

# Initialize Flask app for Vercel
app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'civic-lens-solutions-2025-secret-key')

# DeepSeek API Configuration
deepseek_api_key = os.environ.get('DEEPSEEK_API_KEY', 'sk-0c6cc3046e3a4d0a8c16442cc4796e08')
deepseek_client = OpenAI(
    api_key=deepseek_api_key,
    base_url="https://api.deepseek.com"
)

# Database initialization for Vercel (using in-memory SQLite for serverless)
def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(':memory:')  # In-memory database for serverless
    cursor = conn.cursor()
    
    # Create reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            url TEXT,
            report_type TEXT NOT NULL,
            location TEXT,
            latitude REAL,
            longitude REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            credibility_score INTEGER DEFAULT 0,
            user_ip TEXT
        )
    ''')
    
    # Insert sample data for demonstration
    sample_reports = [
        ("Traffic Disruption Downtown", "Major road closure affecting commuter routes", "https://example.com/traffic", "critical_event", "Downtown Area", 40.7128, -74.0060, datetime.now().isoformat(), 85, "127.0.0.1"),
        ("Weather Alert Issued", "Severe weather warning for metropolitan area", "https://example.com/weather", "critical_event", "Metro Area", 40.7589, -73.9851, datetime.now().isoformat(), 92, "127.0.0.1"),
        ("Community Safety Notice", "Enhanced security measures in downtown district", "https://example.com/safety", "critical_event", "Downtown", 40.7505, -73.9934, datetime.now().isoformat(), 78, "127.0.0.1")
    ]
    
    cursor.executemany('''
        INSERT INTO reports (title, content, url, report_type, location, latitude, longitude, timestamp, credibility_score, user_ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_reports)
    
    conn.commit()
    return conn

# Global database connection (will be recreated for each request in serverless)
db_conn = None

def get_db():
    global db_conn
    if db_conn is None:
        db_conn = init_db()
    return db_conn

# Sample news data for Vercel deployment
def get_sample_news_articles():
    """Get sample news articles for demonstration"""
    return [
        {
            'title': 'Qatar Announces Major Infrastructure Development Project',
            'description': 'Qatar has unveiled plans for a comprehensive infrastructure development project as part of its Vision 2030 initiative.',
            'content': 'The State of Qatar announced today a major infrastructure development project that will enhance transportation networks and urban planning across the country.',
            'url': 'https://example.com/qatar-infrastructure',
            'source': {'name': 'Qatar News Agency'},
            'publishedAt': datetime.now().isoformat(),
            'urlToImage': 'https://via.placeholder.com/400x200',
            'credibility_score': 92,
            'credibility_level': 'High',
            'credibility_color': 'high'
        },
        {
            'title': 'UAE Launches New Technology Innovation Hub',
            'description': 'The United Arab Emirates has launched a new technology innovation hub to foster entrepreneurship and digital transformation.',
            'content': 'Dubai has officially opened its new technology innovation hub, designed to support startups and established companies in developing cutting-edge solutions.',
            'url': 'https://example.com/uae-tech-hub',
            'source': {'name': 'Emirates News'},
            'publishedAt': (datetime.now() - timedelta(hours=2)).isoformat(),
            'urlToImage': 'https://via.placeholder.com/400x200',
            'credibility_score': 88,
            'credibility_level': 'High',
            'credibility_color': 'high'
        },
        {
            'title': 'Regional Economic Summit Focuses on Sustainable Development',
            'description': 'Middle Eastern leaders gather to discuss sustainable economic development and environmental initiatives.',
            'content': 'A high-level economic summit brought together regional leaders to address sustainable development goals and environmental protection measures.',
            'url': 'https://example.com/economic-summit',
            'source': {'name': 'Regional Economic Forum'},
            'publishedAt': (datetime.now() - timedelta(hours=4)).isoformat(),
            'urlToImage': 'https://via.placeholder.com/400x200',
            'credibility_score': 85,
            'credibility_level': 'High',
            'credibility_color': 'high'
        }
    ]

def get_sample_social_posts():
    """Get sample social media posts for demonstration"""
    return [
        {
            'platform': 'twitter',
            'source': '@NewsUpdate',
            'source_name': 'News Update',
            'content': 'Breaking: Major technological advancement announced in renewable energy sector with potential regional impact.',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'views': 15420,
            'likes': 342,
            'replies': 89,
            'retweets': 156,
            'verified': True,
            'engagement_rate': 6.2,
            'follower_count': '89K',
            'post_type': 'breaking_news',
            'credibility_score': 87,
            'credibility_level': 'High',
            'credibility_color': 'high'
        },
        {
            'platform': 'facebook',
            'source': 'Regional News Network',
            'source_name': 'Regional News Network',
            'content': 'Economic indicators show positive growth trends across multiple sectors in the region, according to latest quarterly reports.',
            'timestamp': (datetime.now() - timedelta(minutes=45)).strftime('%Y-%m-%d %H:%M'),
            'views': 8930,
            'likes': 234,
            'replies': 45,
            'shares': 67,
            'verified': True,
            'engagement_rate': 4.8,
            'follower_count': '125K',
            'post_type': 'analysis',
            'credibility_score': 82,
            'credibility_level': 'High',
            'credibility_color': 'high'
        }
    ]

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/news')
def unified_news():
    """Unified news page combining all news sources"""
    try:
        # Get sample news articles for Vercel deployment
        articles = get_sample_news_articles()
        
        # Get sample social media posts
        social_posts = get_sample_social_posts()
        
        return render_template('unified_news.html', articles=articles, social_posts=social_posts)
        
    except Exception as e:
        print(f"Error in unified_news route: {e}")
        return render_template('unified_news.html', articles=[], social_posts=[])

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/civic-chatbot.html')
def civic_chatbot():
    return render_template('civic-chatbot.html')

@app.route('/near-me.html')
def near_me():
    return render_template('near-me.html')

@app.route('/enhanced-chatbot')
def enhanced_chatbot():
    return render_template('enhanced-chatbot.html')

@app.route('/ultra-map')
def ultra_map():
    return render_template('ultra-map.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/map')
def map_page():
    return render_template('map.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        analysis_type = data.get('analysis_type', 'full_analysis')
        
        if not message.strip():
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Create system prompt based on analysis type
        system_prompts = {
            'full_analysis': """You are an expert AI news analyst for Civic Lens Solutions. Provide comprehensive analysis including:
            1. Credibility Assessment (0-100 score)
            2. Source Verification
            3. Bias Detection
            4. Fact-checking insights
            5. Key concerns or red flags
            
            Be thorough, professional, and provide actionable insights.""",
            
            'quick_check': """You are an AI news analyst. Provide a quick credibility check with:
            1. Overall credibility score (0-100)
            2. Main concerns (if any)
            3. Quick recommendation
            
            Keep it concise but informative.""",
            
            'source_verification': """You are an AI source verification specialist. Focus on:
            1. Publisher credibility
            2. Domain reputation analysis
            3. Source reliability indicators
            4. Publication standards assessment
            
            Provide detailed source analysis.""",
            
            'bias_detection': """You are an AI bias detection expert. Analyze for:
            1. Political bias indicators
            2. Emotional language patterns
            3. Selective reporting signs
            4. Balanced perspective recommendations
            
            Focus specifically on bias patterns."""
        }
        
        system_prompt = system_prompts.get(analysis_type, system_prompts['full_analysis'])
        
        # Call DeepSeek API
        response = deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this news content: {message}"}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        ai_response = response.choices[0].message.content
        
        # Generate credibility score (extract from response or calculate)
        credibility_score = random.randint(70, 95)  # Placeholder logic
        
        return jsonify({
            'response': ai_response,
            'credibility_score': credibility_score,
            'analysis_type': analysis_type,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/submit-report', methods=['POST'])
def submit_report():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'content', 'type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Get user IP
        user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        
        # Insert report
        cursor.execute('''
            INSERT INTO reports (title, content, url, report_type, location, latitude, longitude, user_ip)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['content'],
            data.get('url', ''),
            data['type'],
            data.get('location', ''),
            data.get('latitude'),
            data.get('longitude'),
            user_ip
        ))
        
        conn.commit()
        report_id = cursor.lastrowid
        
        return jsonify({
            'success': True,
            'message': 'Report submitted successfully',
            'report_id': report_id
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to submit report: {str(e)}'}), 500

@app.route('/recent-reports', methods=['GET'])
def get_recent_reports():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT title, content, report_type, location, timestamp, credibility_score
            FROM reports
            ORDER BY timestamp DESC
            LIMIT 10
        ''')
        
        reports = []
        for row in cursor.fetchall():
            reports.append({
                'title': row[0],
                'content': row[1][:100] + '...' if len(row[1]) > 100 else row[1],
                'type': row[2],
                'location': row[3] or 'Unknown',
                'timestamp': row[4],
                'credibility_score': row[5] or random.randint(70, 95)
            })
        
        return jsonify(reports)
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch reports: {str(e)}'}), 500

@app.route('/nearby-news', methods=['POST'])
def get_nearby_news():
    try:
        data = request.json
        user_lat = data.get('lat')
        user_lng = data.get('lng')
        radius = float(data.get('radius', 10))
        
        if not user_lat or not user_lng:
            return jsonify({'error': 'Location coordinates required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT title, content, url, report_type, location, latitude, longitude, 
                   timestamp, credibility_score
            FROM reports
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            ORDER BY timestamp DESC
        ''')
        
        all_reports = cursor.fetchall()
        nearby_news = []
        
        for report in all_reports:
            if report[5] and report[6]:  # latitude and longitude exist
                distance = geodesic((user_lat, user_lng), (report[5], report[6])).kilometers
                
                if distance <= radius:
                    nearby_news.append({
                        'title': report[0],
                        'content': report[1],
                        'url': report[2],
                        'type': report[3],
                        'location': report[4],
                        'timestamp': report[7],
                        'credibility_score': report[8] or random.randint(70, 95),
                        'distance': round(distance, 1)
                    })
        
        # Add sample events if few real reports
        if len(nearby_news) < 3:
            sample_events = generate_sample_nearby_events(user_lat, user_lng, radius)
            nearby_news.extend(sample_events)
        
        # Sort by distance
        nearby_news.sort(key=lambda x: x['distance'])
        
        return jsonify(nearby_news[:10])
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch nearby news: {str(e)}'}), 500

def generate_sample_nearby_events(user_lat, user_lng, radius):
    """Generate sample nearby events for demonstration"""
    sample_events = [
        {
            'title': 'Traffic Disruption on Main Highway',
            'content': 'Major traffic delays reported due to road construction. Alternative routes recommended.',
            'type': 'critical_event',
            'location': 'Highway intersection',
            'credibility_score': 85,
            'timestamp': datetime.now().isoformat()
        },
        {
            'title': 'Local Weather Alert Issued',
            'content': 'Severe weather warning in effect. Heavy rainfall and strong winds expected.',
            'type': 'critical_event',
            'location': 'Metropolitan area',
            'credibility_score': 92,
            'timestamp': datetime.now().isoformat()
        },
        {
            'title': 'Community Safety Notice',
            'content': 'Increased security measures in downtown area following recent incidents.',
            'type': 'critical_event',
            'location': 'Downtown district',
            'credibility_score': 78,
            'timestamp': datetime.now().isoformat()
        }
    ]
    
    nearby_events = []
    for i, event in enumerate(sample_events):
        # Generate random coordinates within radius
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(1, radius * 0.8)
        
        # Calculate offset coordinates
        lat_offset = distance * math.cos(angle) / 111.0
        lng_offset = distance * math.sin(angle) / (111.0 * math.cos(math.radians(user_lat)))
        
        event_lat = user_lat + lat_offset
        event_lng = user_lng + lng_offset
        
        actual_distance = geodesic((user_lat, user_lng), (event_lat, event_lng)).kilometers
        
        event['distance'] = round(actual_distance, 1)
        nearby_events.append(event)
    
    return nearby_events

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)

# For local development
if __name__ == '__main__':
    app.run(debug=True)

# Export the Flask app for Vercel
app = app
