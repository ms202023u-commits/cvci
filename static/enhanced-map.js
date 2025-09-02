// Enhanced Professional Map JavaScript - Waze/Google Maps Style

let map;
let userLocation = null;
let newsMarkers = [];
let currentFilters = {
    types: ['critical', 'verified', 'warning'],
    timeRange: '1h',
    credibilityMin: 50
};

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeInterface();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

function initializeMap() {
    // Initialize Leaflet map
    map = L.map('map', {
        center: [40.7128, -74.0060], // Default to NYC
        zoom: 12,
        zoomControl: false,
        attributionControl: false
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Try to get user's location
    locateUser();
    
    // Load initial news data
    loadNewsData();
}

function initializeInterface() {
    // Initialize search functionality
    const searchInput = document.getElementById('locationSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', showSearchSuggestions);
    searchInput.addEventListener('blur', hideSearchSuggestions);
    
    // Initialize filter controls
    initializeFilters();
    
    // Initialize credibility slider
    const credibilitySlider = document.getElementById('credibilityRange');
    const credibilityValue = document.getElementById('credibilityValue');
    
    credibilitySlider.addEventListener('input', function() {
        credibilityValue.textContent = this.value + '%';
        currentFilters.credibilityMin = parseInt(this.value);
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('news-modal')) {
            closeNewsModal();
        }
    });
}

function initializeFilters() {
    // News type filters
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const filterType = this.dataset.filter;
            if (this.checked) {
                if (!currentFilters.types.includes(filterType)) {
                    currentFilters.types.push(filterType);
                }
            } else {
                currentFilters.types = currentFilters.types.filter(type => type !== filterType);
            }
        });
    });
    
    // Time range filters
    const timeFilters = document.querySelectorAll('.time-filter');
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            timeFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            currentFilters.timeRange = this.dataset.time;
        });
    });
}

function locateUser() {
    if (navigator.geolocation) {
        showLoading('Getting your location...');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map.setView([userLocation.lat, userLocation.lng], 14);
                
                // Add user location marker
                const userMarker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: createCustomIcon('user')
                }).addTo(map);
                
                userMarker.bindPopup('<b>Your Location</b>').openPopup();
                
                // Update location display
                updateLocationDisplay(userLocation.lat, userLocation.lng);
                
                // Load nearby news
                loadNewsData();
                
                hideLoading();
                showNotification('Location found successfully!', 'success');
            },
            function(error) {
                hideLoading();
                showNotification('Could not get your location. Using default location.', 'warning');
                loadNewsData();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    } else {
        showNotification('Geolocation is not supported by this browser.', 'error');
        loadNewsData();
    }
}

function updateLocationDisplay(lat, lng) {
    // Reverse geocoding simulation
    const locationNames = [
        'Downtown District',
        'Business Center',
        'Residential Area',
        'City Center',
        'Metropolitan Area'
    ];
    
    const randomLocation = locationNames[Math.floor(Math.random() * locationNames.length)];
    document.getElementById('currentLocation').textContent = randomLocation;
}

function loadNewsData() {
    showLoading('Loading news data...');
    
    // Simulate API call
    setTimeout(() => {
        const newsData = generateSampleNewsData();
        displayNewsOnMap(newsData);
        updateNewsPanel(newsData);
        updateNewsStats(newsData);
        hideLoading();
    }, 1500);
}

function generateSampleNewsData() {
    const newsTypes = [
        { type: 'critical', color: '#f44336', icon: 'exclamation-triangle' },
        { type: 'verified', color: '#4caf50', icon: 'check-circle' },
        { type: 'warning', color: '#ff9800', icon: 'warning' },
        { type: 'fake', color: '#9c27b0', icon: 'times-circle' }
    ];
    
    const sampleNews = [
        {
            id: 1,
            title: 'Traffic Incident on Main Highway',
            summary: 'Multi-vehicle accident causing major delays. Emergency services on scene.',
            type: 'critical',
            credibility: 92,
            distance: '2.3 km',
            time: '15 minutes ago',
            lat: userLocation ? userLocation.lat + 0.01 : 40.7228,
            lng: userLocation ? userLocation.lng + 0.01 : -74.0160,
            details: 'A serious multi-vehicle accident has occurred on the main highway, involving 4 cars and causing significant traffic delays. Emergency services including police, fire department, and ambulances are currently on scene. The incident happened during rush hour, exacerbating the traffic situation. Authorities recommend using alternative routes.'
        },
        {
            id: 2,
            title: 'Severe Weather Alert Issued',
            summary: 'Heavy rainfall and strong winds expected in the next 2 hours.',
            type: 'warning',
            credibility: 95,
            distance: '1.8 km',
            time: '32 minutes ago',
            lat: userLocation ? userLocation.lat - 0.008 : 40.7028,
            lng: userLocation ? userLocation.lng - 0.012 : -74.0260,
            details: 'The National Weather Service has issued a severe weather warning for the metropolitan area. Heavy rainfall with accumulations of 2-4 inches and wind gusts up to 60 mph are expected. Residents are advised to secure outdoor items and avoid unnecessary travel.'
        },
        {
            id: 3,
            title: 'Community Safety Initiative Launch',
            summary: 'New neighborhood watch program begins today with increased patrols.',
            type: 'verified',
            credibility: 88,
            distance: '3.1 km',
            time: '1 hour ago',
            lat: userLocation ? userLocation.lat + 0.015 : 40.7328,
            lng: userLocation ? userLocation.lng - 0.008 : -73.9960,
            details: 'Local authorities have launched a new community safety initiative featuring increased police patrols and a neighborhood watch program. The program aims to enhance community safety through collaboration between residents and law enforcement.'
        },
        {
            id: 4,
            title: 'False Evacuation Alert Circulating',
            summary: 'Fake emergency evacuation notice spreading on social media - IGNORE',
            type: 'fake',
            credibility: 15,
            distance: '4.2 km',
            time: '45 minutes ago',
            lat: userLocation ? userLocation.lat - 0.02 : 40.6928,
            lng: userLocation ? userLocation.lng + 0.015 : -73.9860,
            details: 'A false emergency evacuation notice is circulating on social media platforms. Local authorities confirm this is FAKE NEWS and there is no emergency requiring evacuation. Please do not share this misinformation and report it when seen.'
        },
        {
            id: 5,
            title: 'Public Transportation Delays',
            summary: 'Subway system experiencing delays due to signal problems.',
            type: 'verified',
            credibility: 91,
            distance: '0.9 km',
            time: '25 minutes ago',
            lat: userLocation ? userLocation.lat + 0.005 : 40.7178,
            lng: userLocation ? userLocation.lng + 0.008 : -73.9980,
            details: 'The subway system is experiencing significant delays due to signal problems on multiple lines. Transit authority estimates delays of 15-30 minutes. Alternative transportation methods are recommended for urgent travel.'
        }
    ];
    
    return sampleNews.map(news => ({
        ...news,
        typeData: newsTypes.find(t => t.type === news.type)
    }));
}

function displayNewsOnMap(newsData) {
    // Clear existing markers
    newsMarkers.forEach(marker => map.removeLayer(marker));
    newsMarkers = [];
    
    newsData.forEach(news => {
        if (shouldShowNews(news)) {
            const marker = L.marker([news.lat, news.lng], {
                icon: createCustomIcon(news.type, news.typeData.icon)
            }).addTo(map);
            
            const popupContent = `
                <div class="map-popup">
                    <div class="popup-header">
                        <span class="popup-type ${news.type}">${news.type.toUpperCase()}</span>
                        <span class="popup-credibility">${news.credibility}% credible</span>
                    </div>
                    <h4>${news.title}</h4>
                    <p>${news.summary}</p>
                    <div class="popup-meta">
                        <span><i class="fas fa-clock"></i> ${news.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${news.distance}</span>
                    </div>
                    <button onclick="showNewsDetails(${news.id})" class="popup-btn">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            newsMarkers.push(marker);
        }
    });
}

function createCustomIcon(type, iconName = 'circle') {
    const colors = {
        user: '#4285f4',
        critical: '#f44336',
        verified: '#4caf50',
        warning: '#ff9800',
        fake: '#9c27b0'
    };
    
    const color = colors[type] || '#666';
    
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="marker-icon" style="background-color: ${color};">
                <i class="fas fa-${iconName === 'circle' ? 'circle' : iconName}"></i>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function shouldShowNews(news) {
    // Check type filter
    if (!currentFilters.types.includes(news.type)) {
        return false;
    }
    
    // Check credibility filter
    if (news.credibility < currentFilters.credibilityMin) {
        return false;
    }
    
    // Check time filter (simplified)
    const timeMap = {
        '1h': 60,
        '24h': 1440,
        '7d': 10080,
        'all': Infinity
    };
    
    // For demo, assume all news is within time range
    return true;
}

function updateNewsPanel(newsData) {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '';
    
    const filteredNews = newsData.filter(shouldShowNews);
    
    filteredNews.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = `news-item ${news.type}`;
        newsItem.onclick = () => showNewsDetails(news.id);
        
        newsItem.innerHTML = `
            <div class="news-item-header">
                <span class="news-type">${news.type}</span>
                <span class="news-distance">${news.distance}</span>
            </div>
            <h4 class="news-title">${news.title}</h4>
            <p class="news-summary">${news.summary}</p>
            <div class="news-meta">
                <span class="credibility-badge ${getCredibilityClass(news.credibility)}">
                    ${news.credibility}% credible
                </span>
                <span class="news-time">${news.time}</span>
            </div>
        `;
        
        newsList.appendChild(newsItem);
    });
}

function updateNewsStats(newsData) {
    const filteredNews = newsData.filter(shouldShowNews);
    
    document.getElementById('totalNews').textContent = filteredNews.length;
    document.getElementById('verifiedNews').textContent = filteredNews.filter(n => n.type === 'verified').length;
    document.getElementById('criticalNews').textContent = filteredNews.filter(n => n.type === 'critical').length;
}

function getCredibilityClass(credibility) {
    if (credibility >= 80) return 'high';
    if (credibility >= 60) return 'medium';
    return 'low';
}

// Search functionality
function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
        showSearchSuggestions();
        updateSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

function updateSearchSuggestions(query) {
    const suggestions = [
        { text: 'Downtown District', icon: 'map-marker-alt', type: 'location' },
        { text: 'Traffic incidents near me', icon: 'car-crash', type: 'search' },
        { text: 'Weather alerts', icon: 'cloud-rain', type: 'search' },
        { text: 'Verified news only', icon: 'check-circle', type: 'filter' },
        { text: 'Central Park', icon: 'map-marker-alt', type: 'location' }
    ];
    
    const filteredSuggestions = suggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
    );
    
    const suggestionsContainer = document.getElementById('searchSuggestions');
    suggestionsContainer.innerHTML = '';
    
    filteredSuggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <i class="fas fa-${suggestion.icon}"></i>
            <span>${suggestion.text}</span>
        `;
        item.onclick = () => selectSuggestion(suggestion);
        suggestionsContainer.appendChild(item);
    });
}

function showSearchSuggestions() {
    document.getElementById('searchSuggestions').style.display = 'block';
}

function hideSearchSuggestions() {
    setTimeout(() => {
        document.getElementById('searchSuggestions').style.display = 'none';
    }, 200);
}

function selectSuggestion(suggestion) {
    document.getElementById('locationSearch').value = suggestion.text;
    hideSearchSuggestions();
    
    if (suggestion.type === 'location') {
        // Simulate location search
        showNotification(`Searching for ${suggestion.text}...`, 'info');
    } else if (suggestion.type === 'filter') {
        // Apply filter
        applySearchFilter(suggestion.text);
    }
}

// Map controls
function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

function resetNorth() {
    map.setBearing(0);
    showNotification('Map orientation reset to North', 'info');
}

function toggleTraffic() {
    const btn = event.target.closest('.quick-action-btn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        showNotification('Traffic layer enabled', 'info');
    } else {
        showNotification('Traffic layer disabled', 'info');
    }
}

function toggleSatellite() {
    const btn = event.target.closest('.quick-action-btn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        showNotification('Satellite view enabled', 'info');
    } else {
        showNotification('Standard view enabled', 'info');
    }
}

function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    panel.classList.toggle('active');
}

function toggleNewsPanel() {
    const panel = document.getElementById('newsPanel');
    panel.classList.toggle('minimized');
    
    const icon = event.target;
    if (panel.classList.contains('minimized')) {
        icon.className = 'fas fa-chevron-up';
    } else {
        icon.className = 'fas fa-chevron-down';
    }
}

// Filter functions
function applyFilters() {
    loadNewsData(); // Reload with new filters
    toggleFilters();
    showNotification('Filters applied successfully', 'success');
}

function resetFilters() {
    currentFilters = {
        types: ['critical', 'verified', 'warning'],
        timeRange: '1h',
        credibilityMin: 50
    };
    
    // Reset UI
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
        cb.checked = currentFilters.types.includes(cb.dataset.filter);
    });
    
    document.querySelectorAll('.time-filter').forEach(tf => {
        tf.classList.remove('active');
        if (tf.dataset.time === '1h') tf.classList.add('active');
    });
    
    document.getElementById('credibilityRange').value = 50;
    document.getElementById('credibilityValue').textContent = '50%';
    
    loadNewsData();
    showNotification('Filters reset to default', 'info');
}

function refreshNews() {
    loadNewsData();
    showNotification('News data refreshed', 'success');
}

// News details modal
function showNewsDetails(newsId) {
    const newsData = generateSampleNewsData();
    const news = newsData.find(n => n.id === newsId);
    
    if (!news) return;
    
    const modal = document.getElementById('newsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = news.title;
    modalBody.innerHTML = `
        <div class="news-detail-header">
            <span class="news-type-badge ${news.type}">${news.type.toUpperCase()}</span>
            <span class="credibility-score-badge ${getCredibilityClass(news.credibility)}">
                ${news.credibility}% Credible
            </span>
        </div>
        <div class="news-detail-meta">
            <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>${news.time}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${news.distance} away</span>
            </div>
        </div>
        <div class="news-detail-content">
            <h4>Summary</h4>
            <p>${news.summary}</p>
            <h4>Details</h4>
            <p>${news.details}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeNewsModal() {
    document.getElementById('newsModal').classList.remove('active');
}

function shareNews() {
    if (navigator.share) {
        navigator.share({
            title: 'News Alert from Civic Lens Solutions',
            text: 'Check out this news alert',
            url: window.location.href
        });
    } else {
        // Fallback
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard', 'success');
    }
}

function reportNews() {
    showNotification('Thank you for reporting. We will review this news item.', 'success');
    closeNewsModal();
}

// Voice search
function startVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            showNotification('Listening...', 'info');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('locationSearch').value = transcript;
            showNotification(`Heard: "${transcript}"`, 'success');
        };
        
        recognition.onerror = function(event) {
            showNotification('Voice search error. Please try again.', 'error');
        };
        
        recognition.start();
    } else {
        showNotification('Voice search not supported in this browser', 'warning');
    }
}

// Utility functions
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = timeString;
}

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const spinner = overlay.querySelector('.loading-spinner p');
    spinner.textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Add CSS for animations
const additionalCSS = `
@keyframes slideOutRight {
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.custom-marker .marker-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 3px solid white;
}

.map-popup {
    min-width: 250px;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.popup-type {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba(66, 133, 244, 0.1);
    color: #4285f4;
}

.popup-type.critical {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
}

.popup-type.verified {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
}

.popup-type.warning {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
}

.popup-credibility {
    font-size: 0.8rem;
    color: #666;
}

.popup-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    margin: 10px 0;
}

.popup-btn {
    width: 100%;
    padding: 8px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.popup-btn:hover {
    background: #3367d6;
}

.news-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.news-type-badge {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 12px;
}

.news-type-badge.critical {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
}

.news-type-badge.verified {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
}

.news-type-badge.warning {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
}

.news-type-badge.fake {
    background: rgba(156, 39, 176, 0.1);
    color: #9c27b0;
}

.credibility-score-badge {
    font-size: 0.8rem;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 10px;
}

.credibility-score-badge.high {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
}

.credibility-score-badge.medium {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
}

.credibility-score-badge.low {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
}

.news-detail-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #666;
}

.news-detail-content h4 {
    margin: 20px 0 10px 0;
    color: #333;
    font-size: 1rem;
}

.news-detail-content p {
    line-height: 1.6;
    color: #555;
    margin-bottom: 15px;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
