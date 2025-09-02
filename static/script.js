// News Detector Platform - Enhanced 3D JavaScript

let userLocation = null;
let watchId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Load reports on page load
    loadReports();
    
    // Initialize location services
    initializeLocation();
    
    // Initialize 3D animations
    initialize3DEffects();
    
    // Start real-time updates
    startRealTimeUpdates();
});

function initializeApp() {
    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    // Report form functionality
    const reportForm = document.getElementById('reportForm');
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Chat event listeners
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Report form event listener
    if (reportForm) {
        reportForm.addEventListener('submit', submitReport);
    }
    
    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Auto-detect location if user types "near me"
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.addEventListener('input', function() {
            if (this.value.toLowerCase().includes('near me')) {
                detectLocation();
            }
        });
    }
    
    // Location detection button
    const detectLocationBtn = document.getElementById('detectLocationBtn');
    if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', detectLocation);
    }
    
    // Manual location search
    const searchLocationBtn = document.getElementById('searchLocationBtn');
    if (searchLocationBtn) {
        searchLocationBtn.addEventListener('click', searchManualLocation);
    }
    
    // Action chips and suggestion handling
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-chip') || e.target.classList.contains('action-chip')) {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = e.target.textContent;
                chatInput.focus();
            }
        }
    });
    
    // Character counter
    const charCount = document.getElementById('charCount');
    if (chatInput && charCount) {
        chatInput.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            if (this.value.length > 4500) {
                charCount.style.color = 'var(--warning-color)';
            } else if (this.value.length > 4800) {
                charCount.style.color = 'var(--danger-color)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        });
    }
    
    // Mobile navigation toggle
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    navToggle.style.cssText = `
        display: none;
        background: var(--glass-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.5rem;
        color: var(--text-light);
        cursor: pointer;
        backdrop-filter: blur(10px);
    `;
    
    const header = document.querySelector('.header .container');
    if (header) {
        header.appendChild(navToggle);
    }
    
    navToggle.addEventListener('click', function() {
        const nav = document.querySelector('.nav');
        nav.classList.toggle('active');
        const icon = this.querySelector('i');
        icon.className = nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
    
    // Show mobile nav toggle on small screens
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            navToggle.style.display = 'block';
        } else {
            navToggle.style.display = 'none';
            document.querySelector('.nav').classList.remove('active');
        }
    }
    
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
}

// Initialize location services
function initializeLocation() {
    if (navigator.geolocation) {
        // Try to get initial location
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateLocationDisplay(userLocation);
                loadNearbyNews();
            },
            function(error) {
                console.log('Location access denied or unavailable');
                updateLocationDisplay(null, 'Location access denied');
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    } else {
        updateLocationDisplay(null, 'Geolocation not supported');
    }
}

// Initialize 3D effects and animations
function initialize3DEffects() {
    // Animate stats counters
    animateCounters();
    
    // Add parallax scrolling effect
    window.addEventListener('scroll', handleParallaxScroll);
    
    // Add mouse movement effects for 3D cards
    document.querySelectorAll('.news-card-3d, .stat-card, .dashboard-card').forEach(card => {
        card.addEventListener('mousemove', handle3DCardEffect);
        card.addEventListener('mouseleave', reset3DCardEffect);
    });
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(updateLiveStats, 30000);
    
    // Check for new nearby news every 2 minutes
    setInterval(loadNearbyNews, 120000);
    
    // Update location every 5 minutes if watching
    if (navigator.geolocation && userLocation) {
        watchId = navigator.geolocation.watchPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateLocationDisplay(userLocation);
            },
            function(error) {
                console.log('Location watch error:', error);
            },
            { enableHighAccuracy: false, timeout: 60000, maximumAge: 300000 }
        );
    }
}

// Enhanced chat functionality with DeepSeek API
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const analysisType = document.getElementById('analysisType');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Get analysis type
    const selectedAnalysisType = analysisType ? analysisType.value : 'full';
    
    // Add user message to chat
    addProfessionalMessage(message, 'user');
    
    // Clear input and reset character count
    chatInput.value = '';
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0';
    
    // Show professional typing indicator
    const typingIndicator = addProfessionalTypingIndicator();
    
    try {
        // Send message to backend with analysis type
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                analysis_type: selectedAnalysisType
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add enhanced bot response
        addEnhancedBotResponse(data);
        
    } catch (error) {
        console.error('Error sending message:', error);
        typingIndicator.remove();
        addProfessionalMessage('I apologize, but I encountered a technical issue. Please try again or contact support if the problem persists.', 'bot');
    }
}

// Enhanced professional message display
function addProfessionalMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message professional-message`;
    
    if (sender === 'bot') {
        // Add analyst avatar and header
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `
            <div class="analyst-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="analyst-info">
                <span class="analyst-name">Civic Lens AI Analyst</span>
                <span class="analyst-status">Verified • Online</span>
            </div>
        `;
        messageDiv.appendChild(header);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = message.replace(/\n/g, '<br>');
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    chatMessages.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Enhanced bot response with credibility scoring
function addEnhancedBotResponse(data) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message enhanced-response';
    
    // Add analyst header
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
        <div class="analyst-avatar">
            <i class="fas fa-shield-alt"></i>
        </div>
        <div class="analyst-info">
            <span class="analyst-name">Civic Lens AI Analyst</span>
            <span class="analyst-status">Analysis Complete • ${data.analysis_type || 'Full'}</span>
        </div>
    `;
    messageDiv.appendChild(header);
    
    // Add credibility score if available
    if (data.credibility_score !== null && data.credibility_score !== undefined) {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'credibility-score-display';
        const scoreColor = getScoreColor(data.credibility_score);
        scoreDiv.innerHTML = `
            <div class="score-container">
                <div class="score-circle" style="border-color: ${scoreColor}">
                    <span class="score-value" style="color: ${scoreColor}">${data.credibility_score}</span>
                    <span class="score-label">Score</span>
                </div>
                <div class="score-indicators">
                    ${data.sources_checked ? '<span class="indicator verified"><i class="fas fa-check"></i> Sources Verified</span>' : ''}
                    ${data.bias_detected ? '<span class="indicator bias"><i class="fas fa-exclamation-triangle"></i> Bias Analysis</span>' : ''}
                </div>
            </div>
        `;
        messageDiv.appendChild(scoreDiv);
    }
    
    // Add main response content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content enhanced-content';
    messageContent.innerHTML = data.response.replace(/\n/g, '<br>');
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    chatMessages.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

function getScoreColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
}

// Legacy function for compatibility
function addMessageToChat(message, sender) {
    addProfessionalMessage(message, sender);
}

// Professional typing indicator
function addProfessionalTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator professional-typing';
    
    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="analyst-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="analyst-info">
                <span class="analyst-name">Civic Lens AI Analyst</span>
                <span class="analyst-status">Analyzing content...</span>
            </div>
        </div>
        <div class="message-content">
            <div class="analysis-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <span class="progress-text">Processing your request</span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
    
    return typingDiv;
}

// Legacy function for compatibility
function addTypingIndicator() {
    return addProfessionalTypingIndicator();
}

// Report functionality
async function submitReport(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportData = {
        type: formData.get('type'),
        title: formData.get('title'),
        content: formData.get('content'),
        url: formData.get('url'),
        location: formData.get('location')
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Report submitted successfully!', 'success');
            e.target.reset();
            
            // Show credibility score
            if (result.credibility_score !== undefined) {
                const scoreMessage = `Credibility Analysis: ${result.credibility_score}/100`;
                showNotification(scoreMessage, getScoreType(result.credibility_score));
            }
            
            // Reload reports
            loadReports();
        } else {
            showNotification('Error submitting report. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Error submitting report:', error);
        showNotification('Error submitting report. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load and display reports
async function loadReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    
    try {
        const response = await fetch('/reports');
        const reports = await response.json();
        
        if (reports.length === 0) {
            reportsContainer.innerHTML = '<div class="loading">No reports found.</div>';
            return;
        }
        
        reportsContainer.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <h3 class="report-title">${escapeHtml(report.title)}</h3>
                    <span class="report-type ${report.type}">${report.type.replace('_', ' ')}</span>
                </div>
                <div class="report-content">
                    ${escapeHtml(report.content)}
                </div>
                <div class="report-meta">
                    <div>
                        <strong>Location:</strong> ${escapeHtml(report.location || 'Not specified')} | 
                        <strong>Date:</strong> ${formatDate(report.timestamp)}
                    </div>
                    <div class="credibility-score ${getScoreClass(report.credibility_score)}">
                        Credibility: ${report.credibility_score}/100
                    </div>
                </div>
                ${report.url ? `<div style="margin-top: 1rem;"><a href="${escapeHtml(report.url)}" target="_blank" rel="noopener">View Source</a></div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading reports:', error);
        reportsContainer.innerHTML = '<div class="loading">Error loading reports.</div>';
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#4a90e2'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Use reverse geocoding to get location name
                fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results[0]) {
                            const location = data.results[0].formatted;
                            document.getElementById('location').value = location;
                        }
                    })
                    .catch(error => {
                        console.log('Geocoding error:', error);
                        document.getElementById('location').value = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                    });
            },
            function(error) {
                console.log('Geolocation error:', error);
                showNotification('Could not detect location. Please enter manually.', 'error');
            }
        );
    } else {
        showNotification('Geolocation not supported by this browser.', 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function getScoreClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

function getScoreType(score) {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
}

// Enhanced location functions
function updateLocationDisplay(location, errorMessage = null) {
    const locationSpan = document.getElementById('currentLocation');
    if (locationSpan) {
        if (errorMessage) {
            locationSpan.textContent = errorMessage;
            locationSpan.style.color = 'var(--danger-color)';
        } else if (location) {
            // Reverse geocode to get readable location
            reverseGeocode(location.lat, location.lng).then(address => {
                locationSpan.textContent = address || `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
                locationSpan.style.color = 'var(--success-color)';
            });
        }
    }
}

async function reverseGeocode(lat, lng) {
    try {
        // Using a free geocoding service
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();
        return data.city ? `${data.city}, ${data.countryName}` : data.locality;
    } catch (error) {
        console.log('Geocoding error:', error);
        return null;
    }
}

function searchManualLocation() {
    const manualLocation = document.getElementById('manualLocation');
    if (manualLocation && manualLocation.value.trim()) {
        geocodeLocation(manualLocation.value.trim());
    }
}

async function geocodeLocation(address) {
    try {
        // Using a free geocoding service
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=demo&limit=1`);
        const data = await response.json();
        
        if (data.results && data.results[0]) {
            const result = data.results[0];
            userLocation = {
                lat: result.geometry.lat,
                lng: result.geometry.lng
            };
            updateLocationDisplay(userLocation);
            loadNearbyNews();
            showNotification('Location updated successfully!', 'success');
        } else {
            showNotification('Location not found. Please try a different address.', 'error');
        }
    } catch (error) {
        console.log('Geocoding error:', error);
        showNotification('Error finding location. Please try again.', 'error');
    }
}

// Load nearby news based on user location
async function loadNearbyNews() {
    if (!userLocation) return;
    
    const radius = document.getElementById('radiusSelect')?.value || 10;
    const nearbyNewsGrid = document.getElementById('nearbyNewsGrid');
    
    if (nearbyNewsGrid) {
        try {
            const response = await fetch('/nearby-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    radius: radius
                })
            });
            
            const nearbyNews = await response.json();
            displayNearbyNews(nearbyNews);
        } catch (error) {
            console.error('Error loading nearby news:', error);
        }
    }
}

function displayNearbyNews(newsItems) {
    const nearbyNewsGrid = document.getElementById('nearbyNewsGrid');
    if (!nearbyNewsGrid) return;
    
    if (newsItems.length === 0) {
        nearbyNewsGrid.innerHTML = `
            <div class="no-news-message">
                <i class="fas fa-info-circle"></i>
                <p>No critical news found in your area. That's good news!</p>
            </div>
        `;
        return;
    }
    
    nearbyNewsGrid.innerHTML = newsItems.map(news => `
        <div class="news-card-3d">
            <div class="news-card-header">
                <span class="news-type ${news.type}">${news.type.replace('_', ' ')}</span>
                <span class="news-distance">${news.distance} km</span>
            </div>
            <h3>${escapeHtml(news.title)}</h3>
            <p>${escapeHtml(news.content.substring(0, 150))}...</p>
            <div class="news-meta">
                <span><i class="fas fa-clock"></i> ${formatDate(news.timestamp)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(news.location)}</span>
            </div>
            ${news.credibility_score ? `
                <div class="credibility-badge ${getScoreClass(news.credibility_score)}">
                    Credibility: ${news.credibility_score}/100
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 3D animation functions
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent.replace(/[0-9,]+/, target.toLocaleString());
                clearInterval(timer);
            } else {
                counter.textContent = counter.textContent.replace(/[0-9,]+/, Math.floor(current).toLocaleString());
            }
        }, 20);
    });
}

function handleParallaxScroll() {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
    });
}

function handle3DCardEffect(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
}

function reset3DCardEffect(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
}

// Update live statistics
function updateLiveStats() {
    const analyzedCount = document.getElementById('analyzedCount');
    const accuracyRate = document.getElementById('accuracyRate');
    const reportsCount = document.getElementById('reportsCount');
    
    if (analyzedCount) {
        const current = parseInt(analyzedCount.textContent.replace(/[^0-9]/g, ''));
        analyzedCount.textContent = (current + Math.floor(Math.random() * 5) + 1).toLocaleString();
    }
    
    if (accuracyRate) {
        const variation = (Math.random() - 0.5) * 0.2;
        const newRate = Math.max(94, Math.min(99, 94.7 + variation));
        accuracyRate.textContent = newRate.toFixed(1) + '%';
    }
}

// Enhanced chat with typing indicators
function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .typing-animation {
        display: flex;
        gap: 4px;
        padding: 10px 0;
    }
    
    .typing-animation span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-color);
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-animation span:nth-child(1) { animation-delay: 0s; }
    .typing-animation span:nth-child(2) { animation-delay: 0.2s; }
    .typing-animation span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .no-news-message {
        text-align: center;
        padding: 3rem;
        color: var(--text-light);
        grid-column: 1 / -1;
    }
    
    .no-news-message i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--success-color);
    }
    
    .credibility-badge {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);
