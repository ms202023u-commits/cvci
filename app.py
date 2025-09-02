from flask import Flask, render_template, request, jsonify, session
import sqlite3
import os
from datetime import datetime
import requests
from textblob import TextBlob
import json
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import re
import random
import math
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'news_detector_secret_key_2024')

# DeepSeek API Configuration
deepseek_api_key = os.environ.get('DEEPSEEK_API_KEY', 'sk-0c6cc3046e3a4d0a8c16442cc4796e08')
deepseek_client = OpenAI(
    api_key=deepseek_api_key,
    base_url="https://api.deepseek.com"
)

# NewsAPI Configuration
news_api_key = os.environ.get('NEWS_API_KEY', '1b6a325b95364d4bad0745356986ff45')
news_api_base_url = 'https://newsapi.org/v2'

# Initialize database
def init_db():
    conn = sqlite3.connect('news_reports.db')
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
            credibility_score INTEGER,
            user_ip TEXT
        )
    ''')
    
    # Create chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            bot_response TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# News credibility analysis function
def analyze_news_credibility(text):
    """Analyze news credibility using basic NLP techniques"""
    blob = TextBlob(text)
    
    # Basic credibility indicators
    credibility_score = 50  # Start with neutral score
    
    # Check for emotional language (high emotion = lower credibility)
    polarity = abs(blob.sentiment.polarity)
    if polarity > 0.5:
        credibility_score -= 15
    
    # Check for sensational words
    sensational_words = ['shocking', 'unbelievable', 'amazing', 'incredible', 'breaking', 'urgent']
    text_lower = text.lower()
    sensational_count = sum(1 for word in sensational_words if word in text_lower)
    credibility_score -= sensational_count * 5
    
    # Check for proper sources/citations
    if 'according to' in text_lower or 'source:' in text_lower or 'reported by' in text_lower:
        credibility_score += 10
    
    # Check for specific dates and numbers (more specific = more credible)
    date_pattern = r'\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2}'
    if re.search(date_pattern, text):
        credibility_score += 5
    
    # Ensure score is between 0 and 100
    credibility_score = max(0, min(100, credibility_score))
    
    return credibility_score

# Enhanced AI chatbot response using DeepSeek API
def get_chatbot_response(user_message, analysis_type='full'):
    """Generate enhanced chatbot response using DeepSeek API"""
    try:
        # Create system prompt based on analysis type
        system_prompts = {
            'full': "You are Civic Lens Solutions AI Analyst, an advanced professional news verification specialist powered by cutting-edge AI technology. Provide comprehensive analysis of news credibility, source verification, bias detection, and factual accuracy. Always include a credibility score (0-100), specific recommendations, and actionable insights for civic engagement.",
            'quick': "You are Civic Lens Solutions AI Analyst. Provide a rapid but thorough credibility assessment with a score (0-100), brief explanation, and key warning signs or validation points.",
            'source': "You are Civic Lens Solutions AI Analyst specializing in source verification. Focus on analyzing the reliability and credibility of news sources, publication history, journalistic standards, and institutional trustworthiness. Provide detailed source credibility metrics.",
            'bias': "You are Civic Lens Solutions AI Analyst specializing in bias detection and media literacy. Analyze political bias, emotional language, selective reporting, presentation bias, and provide educational insights about media manipulation techniques."
        }
        
        system_prompt = system_prompts.get(analysis_type, system_prompts['full'])
        
        # Check if it's a simple question or news analysis
        user_message_lower = user_message.lower()
        
        if any(keyword in user_message_lower for keyword in ['help', 'what can you do', 'how to use']):
            return {
                'response': "I'm your Civic Lens AI Analyst, specialized in news verification and civic information assessment. I can help you:\n\n🔍 **Analyze News Credibility** - Paste any news article for comprehensive analysis\n🛡️ **Verify Sources** - Check the reliability of news sources and publications\n📊 **Detect Bias** - Identify political or editorial bias in reporting\n⚡ **Quick Fact-Check** - Get rapid credibility assessments\n📍 **Local News Monitoring** - Find critical events near your location\n\nJust paste a news article, URL, or ask me to verify any information!",
                'credibility_score': None,
                'analysis_type': 'help'
            }
        
        if len(user_message) < 50:
            return {
                'response': "Please provide a news article, URL, or more detailed information for me to analyze. I need sufficient content to perform a thorough credibility assessment.",
                'credibility_score': None,
                'analysis_type': analysis_type
            }
        
        # Use DeepSeek API for comprehensive analysis
        response = deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please analyze this news content for credibility and provide insights: {user_message}"}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        ai_response = response.choices[0].message.content
        
        # Extract credibility score from response or calculate fallback
        credibility_score = extract_credibility_score(ai_response) or analyze_news_credibility(user_message)
        
        return {
            'response': ai_response,
            'credibility_score': credibility_score,
            'analysis_type': analysis_type,
            'sources_checked': True,
            'bias_detected': 'bias' in analysis_type or 'full' in analysis_type
        }
        
    except Exception as e:
        print(f"DeepSeek API error: {e}")
        # Fallback to basic analysis
        score = analyze_news_credibility(user_message)
        return {
            'response': f"I've analyzed this content using our backup systems. Credibility Score: {score}/100. {get_fallback_analysis(score, user_message)}",
            'credibility_score': score,
            'analysis_type': analysis_type,
            'sources_checked': False,
            'bias_detected': False
        }

def extract_credibility_score(text):
    """Extract credibility score from AI response"""
    import re
    # Look for patterns like "Score: 85/100" or "Credibility: 75%"
    patterns = [
        r'(?:score|credibility)\s*:?\s*(\d+)(?:/100|%)',
        r'(\d+)(?:/100|%)\s*(?:score|credibility)',
        r'(\d+)\s*(?:out of 100|percent credible)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    return None

def get_fallback_analysis(score, content):
    """Provide fallback analysis when API is unavailable"""
    if score >= 80:
        return "This content shows strong credibility indicators including proper sourcing, factual language, and verifiable claims."
    elif score >= 60:
        return "This content has moderate credibility but may benefit from additional source verification."
    elif score >= 40:
        return "This content shows some credibility concerns. Cross-reference with established news sources."
    else:
        return "This content shows significant credibility issues including potential bias, lack of sources, or misleading information."

# NewsAPI Integration Functions
def fetch_todays_news(country='us', category=None, page_size=20):
    """Fetch today's top news from NewsAPI"""
    try:
        url = f"{news_api_base_url}/top-headlines"
        params = {
            'apiKey': news_api_key,
            'country': country,
            'pageSize': page_size,
            'sortBy': 'publishedAt'
        }
        
        if category:
            params['category'] = category
            
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if data['status'] == 'ok':
            return data['articles']
        else:
            print(f"NewsAPI Error: {data.get('message', 'Unknown error')}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return []
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def analyze_news_article_credibility(article):
    """Analyze a news article from NewsAPI and return credibility score"""
    try:
        # Combine title and description for analysis
        content = f"{article.get('title', '')} {article.get('description', '')}"
        
        if not content.strip():
            return 50  # Neutral score if no content
            
        # Use existing credibility analysis function
        base_score = analyze_news_credibility(content)
        
        # Additional scoring based on source reliability
        source_name = article.get('source', {}).get('name', '').lower()
        
        # Boost score for well-known reliable sources
        reliable_sources = ['bbc', 'reuters', 'associated press', 'ap news', 'npr', 
                          'the guardian', 'washington post', 'new york times', 
                          'wall street journal', 'cnn', 'abc news', 'cbs news']
        
        for reliable_source in reliable_sources:
            if reliable_source in source_name:
                base_score = min(100, base_score + 15)
                break
                
        # Check if article has URL (complete articles tend to be more credible)
        if article.get('url'):
            base_score = min(100, base_score + 5)
            
        # Check if article has author
        if article.get('author'):
            base_score = min(100, base_score + 5)
            
        return max(0, min(100, base_score))
        
    except Exception as e:
        print(f"Error analyzing article credibility: {e}")
        return 50  # Return neutral score on error

# Main homepage - Ultra-modern index
@app.route('/')
def home():
    return render_template('ultra-index.html')

# Ultra-modern pages (both with and without .html for compatibility)
@app.route('/ultra-index')
@app.route('/ultra-index.html')
def ultra_index_page():
    return render_template('ultra-index.html')

@app.route('/near-me')
@app.route('/near-me.html')
def near_me_page():
    return render_template('near-me.html')

@app.route('/ultra-map')
@app.route('/ultra-map.html')
def ultra_map_page():
    # Redirect to Near Me page
    return render_template('near-me.html')

@app.route('/civic-chatbot')
@app.route('/civic-chatbot.html')
def civic_chatbot():
    return render_template('civic-chatbot.html')

@app.route('/enhanced-chatbot')
@app.route('/enhanced-chatbot.html')
def enhanced_chatbot():
    # Redirect to unified Civic Chatbot
    return render_template('civic-chatbot.html')

@app.route('/social-news')
def social_news():
    """Social media news page with real data from HTML sources"""
    try:
        # Import the HTML parser
        from html_parser import get_all_social_posts
        
        # Get real posts from HTML files
        all_posts = get_all_social_posts()
        
        # Enhanced credibility scoring with multiple factors
        for post in all_posts:
            # Base credibility analysis
            base_score = analyze_news_credibility(post['content'])
            
            # Social media specific factors
            credibility_factors = {
                'source_verification': 15 if post.get('verified', False) else 0,
                'engagement_quality': min(10, post.get('likes', 0) // 10),
                'post_type_bonus': 5 if 'breaking' in post.get('content', '').lower() else 0,
                'recency_bonus': 8 if 'منذ' in post.get('timestamp', '') else 0
            }
            
            # Calculate final score with realistic bounds
            final_score = base_score + sum(credibility_factors.values()) + random.uniform(-3, 3)
            post['credibility_score'] = max(30, min(95, int(final_score)))
            
            # Add credibility level and color
            if post['credibility_score'] >= 80:
                post['credibility_level'] = 'High'
                post['credibility_color'] = 'high'
            elif post['credibility_score'] >= 60:
                post['credibility_level'] = 'Medium'
                post['credibility_color'] = 'medium'
            else:
                post['credibility_level'] = 'Low'
                post['credibility_color'] = 'low'
        
        return render_template('social_news.html', social_posts=all_posts)
        
    except Exception as e:
        print(f"Error in social_news route: {e}")
        return render_template('social_news.html', social_posts=[])

@app.route('/modern-news')
def modern_news():
    """Modern news page with enhanced design and real-time updates"""
    return render_template('modern_news.html')

@app.route('/news')
def unified_news():
    """Unified news page combining all news sources"""
    try:
        # Get latest news articles
        articles = []
        try:
            news_articles = fetch_todays_news(page_size=10)
            if news_articles:
                for article in news_articles:
                    analyzed_article = analyze_news_article_credibility(article)
                    articles.append(analyzed_article)
        except Exception as e:
            print(f"Error fetching news articles: {e}")
        
        # Get social media posts
        social_posts = []
        try:
            from html_parser import get_all_social_posts
            all_posts = get_all_social_posts()
            
            # Enhanced credibility scoring for social posts
            for post in all_posts:
                base_score = analyze_news_credibility(post['content'])
                
                credibility_factors = {
                    'source_verification': 15 if post.get('verified', False) else 0,
                    'engagement_quality': min(10, post.get('likes', 0) // 10),
                    'post_type_bonus': 5 if 'breaking' in post.get('content', '').lower() else 0,
                }
                
                final_score = base_score + sum(credibility_factors.values()) + random.uniform(-3, 3)
                post['credibility_score'] = max(30, min(95, int(final_score)))
                
                # Add credibility level and color
                if post['credibility_score'] >= 80:
                    post['credibility_level'] = 'High'
                    post['credibility_color'] = 'high'
                elif post['credibility_score'] >= 60:
                    post['credibility_level'] = 'Medium'
                    post['credibility_color'] = 'medium'
                else:
                    post['credibility_level'] = 'Low'
                    post['credibility_color'] = 'low'
            
            social_posts = all_posts
        except Exception as e:
            print(f"Error fetching social posts: {e}")
        
        return render_template('unified_news.html', articles=articles, social_posts=social_posts)
        
    except Exception as e:
        print(f"Error in unified_news route: {e}")
        return render_template('unified_news.html', articles=[], social_posts=[])

@app.route('/enhanced-map')
@app.route('/enhanced-map.html')
def enhanced_map():
    # ... (rest of the code remains the same)
    return render_template('enhanced-map.html')

@app.route('/latest-news')
@app.route('/latest-news.html')
def latest_news():
    """Display latest news with credibility scores"""
    try:
        print("Fetching latest news...")
        # Fetch today's news
        articles = fetch_todays_news(page_size=15)
        print(f"Fetched {len(articles)} articles")
        
        if not articles:
            print("No articles returned from NewsAPI")
            return render_template('latest-news.html', articles=[], error="No news articles available at this time")
        
        # Analyze each article and add credibility score
        analyzed_articles = []
        for i, article in enumerate(articles):
            try:
                if article.get('title') and article.get('description'):
                    print(f"Analyzing article {i+1}: {article.get('title', '')[:50]}...")
                    credibility_score = analyze_news_article_credibility(article)
                    
                    # Add credibility info to article
                    article['credibility_score'] = credibility_score
                    article['credibility_level'] = get_credibility_level(credibility_score)
                    article['credibility_color'] = get_credibility_color(credibility_score)
                    
                    analyzed_articles.append(article)
                else:
                    print(f"Skipping article {i+1} - missing title or description")
            except Exception as article_error:
                print(f"Error analyzing article {i+1}: {article_error}")
                continue
        
        print(f"Successfully analyzed {len(analyzed_articles)} articles")
        return render_template('latest-news.html', articles=analyzed_articles)
        
    except Exception as e:
        print(f"Error in latest_news route: {e}")
        import traceback
        traceback.print_exc()
        return render_template('latest-news.html', articles=[], error=f"Unable to fetch news: {str(e)}")

def get_credibility_level(score):
    """Get credibility level text based on score"""
    if score >= 80:
        return "High Credibility"
    elif score >= 60:
        return "Good Credibility"
    elif score >= 40:
        return "Moderate Credibility"
    else:
        return "Low Credibility"

def get_credibility_color(score):
    """Get color class based on credibility score"""
    if score >= 80:
        return "high-credibility"
    elif score >= 60:
        return "good-credibility"
    elif score >= 40:
        return "moderate-credibility"
    else:
        return "low-credibility"

# Legacy pages (both with and without .html for compatibility)
@app.route('/index')
@app.route('/index.html')
def legacy_index():
    return render_template('index.html')

@app.route('/chatbot')
@app.route('/chatbot.html')
def chatbot():
    # Redirect to unified Civic Chatbot
    return render_template('civic-chatbot.html')

@app.route('/report')
@app.route('/report.html')
def report_page():
    return render_template('report.html')

@app.route('/map')
@app.route('/map.html')
def map_page():
    return render_template('map.html')

@app.route('/dashboard')
@app.route('/dashboard.html')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    data = request.json
    user_message = data.get('message', '')
    analysis_type = data.get('analysis_type', 'comprehensive')  # comprehensive, quick, bias
    
    if not user_message:
        return jsonify({'success': False, 'error': 'No message provided'})
    
    try:
        # Get chatbot response using DeepSeek API
        response_data = get_chatbot_response(user_message, analysis_type)
        
        return jsonify({
            'success': True,
            'response': response_data['response'],
            'credibility_score': response_data['credibility_score'],
            'analysis_type': response_data['analysis_type'],
            'sources_checked': response_data['sources_checked'],
            'bias_detected': response_data['bias_detected']
        })
    except Exception as e:
        print(f"Chatbot API error: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'})

@app.route('/chat', methods=['POST'])
def chat():
    # Legacy endpoint - redirect to new API
    return api_chatbot()
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        # Adjust analysis type based on chatbot type
        if chatbot_type == 'quick':
            analysis_type = 'quick'
        elif chatbot_type == 'comprehensive':
            analysis_type = 'full'
            
        # Get AI response
        bot_response = get_chatbot_response(user_message, analysis_type)
        
        # Store chat history with chatbot type
        conn = sqlite3.connect('news_reports.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO chat_history (user_message, bot_response, session_id)
            VALUES (?, ?, ?)
        ''', (user_message, f"[{chatbot_type.upper()}] {bot_response}", session.get('session_id', 'anonymous')))
        conn.commit()
        conn.close()
        
        return jsonify({
            'response': bot_response,
            'chatbot_type': chatbot_type,
            'analysis_type': analysis_type
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/report', methods=['POST'])
def report_news():
    data = request.json
    
    title = data.get('title', '')
    content = data.get('content', '')
    url = data.get('url', '')
    report_type = data.get('type', 'fake_news')
    location = data.get('location', '')
    user_ip = request.remote_addr
    
    # Analyze credibility
    credibility_score = analyze_news_credibility(content)
    
    # Save report to database
    conn = sqlite3.connect('news_reports.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reports (title, content, url, report_type, location, credibility_score, user_ip)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (title, content, url, report_type, location, credibility_score, user_ip))
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Report submitted successfully',
        'credibility_score': credibility_score
    })

@app.route('/reports')
def view_reports():
    conn = sqlite3.connect('news_reports.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT title, content, url, report_type, location, timestamp, credibility_score
        FROM reports
        ORDER BY timestamp DESC
        LIMIT 20
    ''')
    reports = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'title': r[0],
        'content': r[1][:200] + '...' if len(r[1]) > 200 else r[1],
        'url': r[2],
        'type': r[3],
        'location': r[4],
        'timestamp': r[5],
        'credibility_score': r[6]
    } for r in reports])

@app.route('/nearby-news', methods=['POST'])
def get_nearby_news():
    data = request.json
    user_lat = data.get('lat')
    user_lng = data.get('lng')
    radius = float(data.get('radius', 10))  # Default 10km radius
    
    if not user_lat or not user_lng:
        return jsonify({'error': 'Location coordinates required'}), 400
    
    conn = sqlite3.connect('news_reports.db')
    cursor = conn.cursor()
    
    # Get all reports with location data
    cursor.execute('''
        SELECT title, content, url, report_type, location, latitude, longitude, 
               timestamp, credibility_score
        FROM reports
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY timestamp DESC
    ''')
    
    all_reports = cursor.fetchall()
    conn.close()
    
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
                    'credibility_score': report[8],
                    'distance': round(distance, 1)
                })
    
    # Add some sample critical events for demonstration
    if len(nearby_news) < 3:
        sample_events = generate_sample_nearby_events(user_lat, user_lng, radius)
        nearby_news.extend(sample_events)
    
    # Sort by distance
    nearby_news.sort(key=lambda x: x['distance'])
    
    return jsonify(nearby_news[:10])  # Return max 10 items

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
        lat_offset = distance * math.cos(angle) / 111.0  # Rough conversion
        lng_offset = distance * math.sin(angle) / (111.0 * math.cos(math.radians(user_lat)))
        
        event_lat = user_lat + lat_offset
        event_lng = user_lng + lng_offset
        
        actual_distance = geodesic((user_lat, user_lng), (event_lat, event_lng)).kilometers
        
        event['distance'] = round(actual_distance, 1)
        nearby_events.append(event)
    
    return nearby_events

@app.route('/geocode', methods=['POST'])
def geocode_location():
    """Convert address to coordinates"""
    data = request.json
    address = data.get('address')
    
    if not address:
        return jsonify({'error': 'Address required'}), 400
    
    try:
        geolocator = Nominatim(user_agent="news_detector")
        location = geolocator.geocode(address)
        
        if location:
            return jsonify({
                'lat': location.latitude,
                'lng': location.longitude,
                'formatted_address': location.address
            })
        else:
            return jsonify({'error': 'Location not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
