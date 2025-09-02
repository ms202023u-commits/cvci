# 🔍 Civic Lens Solutions - News Detector Platform

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

A comprehensive AI-powered news verification and civic engagement platform that helps users analyze news credibility, report critical events, and stay informed about local happenings through advanced machine learning and natural language processing.

## 🌟 Features

### 🤖 AI-Powered News Analysis
- **Advanced Credibility Scoring**: Uses DeepSeek AI API for sophisticated news verification
- **Sentiment Analysis**: Analyzes emotional language and bias indicators
- **Source Verification**: Checks for proper citations and credible sources
- **Real-time Chat Interface**: Interactive AI chatbot for instant news verification

### 📍 Location-Based Services
- **Interactive News Map**: Visualize news events and reports on an interactive map
- **Nearby Events**: Find critical news and events within a specified radius
- **Geocoding Support**: Convert addresses to coordinates for precise location tracking
- **Enhanced Map View**: Modern, responsive map interface with clustering

### 📊 Reporting & Analytics
- **News Reporting System**: Users can report suspicious news or critical events
- **Credibility Dashboard**: View and analyze reported news with credibility scores
- **Historical Data**: SQLite database stores all reports and chat history
- **User Analytics**: Track reporting patterns and engagement metrics

### 💻 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Multiple Themes**: Professional, enhanced, and ultra-modern UI options
- **Progressive Web App**: Service worker support for offline functionality
- **Accessibility**: WCAG compliant design with keyboard navigation support

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**: Core programming language
- **Flask 2.3.3**: Web framework for API and routing
- **SQLite**: Lightweight database for data persistence
- **DeepSeek AI API**: Advanced language model for news analysis
- **TextBlob**: Natural language processing library

### Frontend
- **HTML5/CSS3**: Modern semantic markup and styling
- **JavaScript ES6+**: Interactive functionality and API integration
- **Font Awesome**: Icon library for enhanced UI
- **Google Fonts**: Typography (Inter font family)
- **Responsive Grid**: CSS Grid and Flexbox for layout

### APIs & Services
- **Geopy**: Geocoding and distance calculations
- **Nominatim**: OpenStreetMap geocoding service
- **OpenAI Compatible API**: DeepSeek integration for AI analysis

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/news-detector-platform.git
   cd news-detector-platform
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API keys
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   FLASK_SECRET_KEY=your_secret_key_here
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080` to access the platform

## 📱 Application Pages

### Main Pages
- **`/`** - Ultra-modern homepage with feature overview
- **`/chatbot.html`** - AI-powered news analysis chatbot
- **`/report.html`** - News and event reporting interface
- **`/map.html`** - Interactive news map with location-based filtering
- **`/enhanced-map.html`** - Advanced map with clustering and analytics

### API Endpoints
- **`/api/chat`** - Chatbot API for news analysis
- **`/api/report`** - Submit news reports
- **`/api/nearby`** - Get nearby news events
- **`/api/geocode`** - Convert addresses to coordinates

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Required
DEEPSEEK_API_KEY=your_deepseek_api_key
FLASK_SECRET_KEY=your_flask_secret_key

# Optional
PORT=8080
DEBUG=False
```

### Database Setup
The application automatically creates the SQLite database on first run. No manual setup required.

## 🎨 UI Themes

The platform includes multiple UI themes:
- **Professional**: Clean, business-focused design
- **Enhanced**: Modern with advanced animations
- **Ultra**: Cutting-edge design with 3D elements
- **Mobile-First**: Optimized for mobile devices

## 📊 API Documentation

### Chat API
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Analyze this news article...",
  "analysis_type": "full"
}
```

### Report API
```http
POST /api/report
Content-Type: application/json

{
  "title": "News Title",
  "content": "News content...",
  "url": "https://example.com",
  "type": "fake_news",
  "location": "City, Country"
}
```

## 🚀 Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- DeepSeek AI for advanced language processing
- OpenStreetMap for geocoding services
- Font Awesome for icons
- Google Fonts for typography

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/news-detector-platform/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Mobile app development
- [ ] Real-time notifications
- [ ] Machine learning model training interface

---

**Built with ❤️ for civic engagement and media literacy**
