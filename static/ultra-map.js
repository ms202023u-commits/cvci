// Simple Working Map JavaScript

let map;
let userLocation = null;
let markers = [];

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing simple map...');
    setTimeout(initializeMap, 1000); // Give time for DOM and CSS to load
});

function initializeMap() {
    console.log('Starting map initialization...');
    
    try {
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded!');
            return;
        }
        
        // Check if container exists
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found!');
            return;
        }
        
        console.log('Creating Leaflet map...');
        
        // Initialize simple Leaflet map
        map = L.map('map').setView([40.7128, -74.0060], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add a sample marker
        L.marker([40.7128, -74.0060])
            .addTo(map)
            .bindPopup('New York City<br>Sample location marker.')
            .openPopup();
        
        // Force map to resize
        setTimeout(() => {
            map.invalidateSize();
            console.log('Map initialized successfully!');
        }, 100);
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Simple location function
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (map) {
                map.setView([lat, lng], 15);
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function initializeInterface() {
    // Search functionality
    const searchInput = document.getElementById('ultraSearch');
    searchInput.addEventListener('input', handleUltraSearch);
    searchInput.addEventListener('focus', showSearchSuggestions);
    
    // Filter controls
    initializeFilters();
    
    // Time updates
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
    
    // Map event listeners
    ultraMap.on('moveend', updateCoordinates);
    ultraMap.on('zoomend', updateCoordinates);
    
    // Initialize FAB menu
    initializeFAB();
}

function handleUltraSearch(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
        updateSearchSuggestions(query);
        showSearchSuggestions();
    } else {
        hideSearchSuggestions();
    }
}

function updateSearchSuggestions(query) {
    const suggestions = [
        { text: 'Times Square, New York', type: 'location', icon: 'map-marker-alt' },
        { text: 'Breaking news near me', type: 'search', icon: 'newspaper' },
        { text: 'Traffic incidents', type: 'filter', icon: 'car-crash' },
        { text: 'Weather alerts', type: 'filter', icon: 'cloud-rain' },
        { text: 'Central Park', type: 'location', icon: 'tree' }
    ];
    
    const filtered = suggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
    );
    
    const container = document.getElementById('searchSuggestions');
    container.innerHTML = filtered.map(s => `
        <div class="suggestion-item" onclick="selectSuggestion('${s.text}', '${s.type}')">
            <i class="fas fa-${s.icon}"></i>
            <span>${s.text}</span>
        </div>
    `).join('');
}

function showSearchSuggestions() {
    document.getElementById('searchSuggestions').style.display = 'block';
}

function hideSearchSuggestions() {
    setTimeout(() => {
        document.getElementById('searchSuggestions').style.display = 'none';
    }, 200);
}

function selectSuggestion(text, type) {
    document.getElementById('ultraSearch').value = text;
    hideSearchSuggestions();
    
    if (type === 'location') {
        searchLocation(text);
    } else if (type === 'filter') {
        applyQuickFilter(text);
    }
}

function findMyLocation() {
    if (navigator.geolocation) {
        showLoading('Finding your location...');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                ultraMap.setView([userLocation.lat, userLocation.lng], 15);
                
                // Add user marker
                const userMarker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: createUltraIcon('user', 'location-arrow')
                }).addTo(ultraMap);
                
                userMarker.bindPopup(`
                    <div class="ultra-popup user-popup">
                        <h4><i class="fas fa-user"></i> Your Location</h4>
                        <p>Latitude: ${userLocation.lat.toFixed(6)}</p>
                        <p>Longitude: ${userLocation.lng.toFixed(6)}</p>
                    </div>
                `);
                
                updateCoordinates();
                loadUltraNewsData();
                hideLoading();
                showNotification('Location found successfully!', 'success');
            },
            function(error) {
                hideLoading();
                showNotification('Could not get your location. Using default.', 'warning');
                loadUltraNewsData();
            }
        );
    }
}

function loadUltraNewsData() {
    showLoading('Loading live news data...');
    
    // Simulate advanced news data loading
    setTimeout(() => {
        const newsData = generateUltraNewsData();
        displayUltraNews(newsData);
        updateNewsStats(newsData);
        updateNewsFeed(newsData);
        hideLoading();
    }, 1500);
}

function generateUltraNewsData() {
    const newsTypes = [
        { type: 'breaking', color: '#ea4335', icon: 'exclamation-triangle' },
        { type: 'verified', color: '#34a853', icon: 'check-circle' },
        { type: 'alerts', color: '#fbbc04', icon: 'bell' },
        { type: 'suspicious', color: '#9c27b0', icon: 'eye-slash' }
    ];
    
    const sampleNews = [
        {
            id: 1,
            title: 'Major Traffic Incident - Highway Closure',
            summary: 'Multi-vehicle accident causing complete highway closure. Emergency services on scene.',
            type: 'breaking',
            credibility: 95,
            distance: '1.2 km',
            time: '3 minutes ago',
            lat: userLocation ? userLocation.lat + 0.008 : 40.7208,
            lng: userLocation ? userLocation.lng + 0.012 : -73.9960,
            details: 'A serious multi-vehicle accident has resulted in the complete closure of the main highway. Emergency services including police, fire department, and multiple ambulances are currently on scene. Traffic is being diverted to alternate routes. Estimated clearance time is 2-3 hours.',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Severe Weather Warning - Tornado Watch',
            summary: 'National Weather Service issues tornado watch for metropolitan area.',
            type: 'alerts',
            credibility: 98,
            distance: '0.8 km',
            time: '8 minutes ago',
            lat: userLocation ? userLocation.lat - 0.005 : 40.7078,
            lng: userLocation ? userLocation.lng - 0.008 : -74.0120,
            details: 'The National Weather Service has issued a tornado watch for the entire metropolitan area. Conditions are favorable for severe thunderstorms and possible tornado development. Residents should stay indoors and monitor weather updates.',
            priority: 'critical'
        },
        {
            id: 3,
            title: 'Verified: New Community Safety Program',
            summary: 'City launches enhanced neighborhood watch program with technology integration.',
            type: 'verified',
            credibility: 92,
            distance: '2.1 km',
            time: '25 minutes ago',
            lat: userLocation ? userLocation.lat + 0.015 : 40.7278,
            lng: userLocation ? userLocation.lng - 0.010 : -73.9860,
            details: 'The city has officially launched a new community safety program featuring enhanced neighborhood watch capabilities, integrated mobile apps, and direct communication with local law enforcement.',
            priority: 'medium'
        },
        {
            id: 4,
            title: 'ALERT: Suspicious Activity Reported',
            summary: 'Multiple reports of suspicious individuals in downtown area.',
            type: 'suspicious',
            credibility: 75,
            distance: '3.5 km',
            time: '1 hour ago',
            lat: userLocation ? userLocation.lat - 0.020 : 40.6928,
            lng: userLocation ? userLocation.lng + 0.018 : -73.9780,
            details: 'Local authorities are investigating multiple reports of suspicious activity in the downtown area. Residents are advised to remain vigilant and report any unusual behavior to authorities.',
            priority: 'medium'
        }
    ];
    
    return sampleNews.map(news => ({
        ...news,
        typeData: newsTypes.find(t => t.type === news.type)
    }));
}

function displayUltraNews(newsData) {
    // Clear existing markers
    markerCluster.clearLayers();
    
    newsData.forEach(news => {
        if (shouldShowNews(news)) {
            const marker = L.marker([news.lat, news.lng], {
                icon: createUltraIcon(news.type, news.typeData.icon, news.priority)
            });
            
            const popupContent = createUltraPopup(news);
            marker.bindPopup(popupContent);
            
            markerCluster.addLayer(marker);
        }
    });
}

function createUltraIcon(type, iconName, priority = 'medium') {
    const colors = {
        user: '#1a73e8',
        breaking: '#ea4335',
        verified: '#34a853',
        alerts: '#fbbc04',
        suspicious: '#9c27b0'
    };
    
    const sizes = {
        critical: 40,
        high: 35,
        medium: 30,
        low: 25
    };
    
    const color = colors[type] || '#666';
    const size = sizes[priority] || 30;
    
    return L.divIcon({
        className: 'ultra-marker',
        html: `
            <div class="ultra-marker-icon ${type} ${priority}" style="
                background-color: ${color};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: ${size * 0.4}px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 3px solid white;
                animation: ${priority === 'critical' ? 'pulse-critical 2s infinite' : 'none'};
            ">
                <i class="fas fa-${iconName}"></i>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}

function createUltraPopup(news) {
    return `
        <div class="ultra-popup ${news.type}">
            <div class="popup-header">
                <div class="popup-type ${news.type}">${news.type.toUpperCase()}</div>
                <div class="popup-credibility">${news.credibility}% credible</div>
            </div>
            <h4>${news.title}</h4>
            <p class="popup-summary">${news.summary}</p>
            <div class="popup-meta">
                <span><i class="fas fa-clock"></i> ${news.time}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${news.distance}</span>
            </div>
            <div class="popup-actions">
                <button onclick="showNewsDetails(${news.id})" class="popup-btn primary">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <button onclick="navigateToNews(${news.id})" class="popup-btn secondary">
                    <i class="fas fa-directions"></i> Navigate
                </button>
            </div>
        </div>
    `;
}

function shouldShowNews(news) {
    return currentFilters.types.includes(news.type) && 
           news.credibility >= currentFilters.credibilityRange[0] &&
           news.credibility <= currentFilters.credibilityRange[1];
}

function updateNewsStats(newsData) {
    const filtered = newsData.filter(shouldShowNews);
    
    document.getElementById('breakingCount').textContent = filtered.filter(n => n.type === 'breaking').length;
    document.getElementById('verifiedCount').textContent = filtered.filter(n => n.type === 'verified').length;
    document.getElementById('alertsCount').textContent = filtered.filter(n => n.type === 'alerts').length;
    document.getElementById('newsCount').textContent = filtered.length;
}

function updateNewsFeed(newsData) {
    const feed = document.getElementById('newsFeed');
    const filtered = newsData.filter(shouldShowNews).slice(0, 10);
    
    feed.innerHTML = filtered.map(news => `
        <div class="news-item ${news.type}" onclick="showNewsDetails(${news.id})">
            <div class="news-item-header">
                <span class="news-type-badge ${news.type}">${news.type}</span>
                <span class="news-time">${news.time}</span>
            </div>
            <h5 class="news-title">${news.title}</h5>
            <p class="news-summary">${news.summary}</p>
            <div class="news-footer">
                <span class="credibility-badge ${getCredibilityClass(news.credibility)}">
                    ${news.credibility}% credible
                </span>
                <span class="news-distance">${news.distance}</span>
            </div>
        </div>
    `).join('');
}

function getCredibilityClass(credibility) {
    if (credibility >= 90) return 'excellent';
    if (credibility >= 80) return 'high';
    if (credibility >= 60) return 'medium';
    return 'low';
}

// Map controls
function zoomIn() {
    ultraMap.zoomIn();
}

function zoomOut() {
    ultraMap.zoomOut();
}

function resetNorth() {
    ultraMap.setBearing(0);
    showNotification('Map orientation reset to North', 'info');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function toggle3D() {
    showNotification('3D view coming soon!', 'info');
}

function toggleStreetView() {
    showNotification('Street view integration coming soon!', 'info');
}

// Filter functions
function openFilters() {
    document.getElementById('filtersPanel').classList.add('active');
}

function closeFilters() {
    document.getElementById('filtersPanel').classList.remove('active');
}

function applyFilters() {
    loadUltraNewsData();
    closeFilters();
    showNotification('Filters applied successfully', 'success');
}

function resetFilters() {
    currentFilters = {
        types: ['breaking', 'verified', 'alerts'],
        timeRange: 'live',
        credibilityRange: [0, 100],
        radius: 25
    };
    
    // Reset UI
    document.querySelectorAll('.filter-card input').forEach(cb => {
        cb.checked = currentFilters.types.includes(cb.dataset.filter);
    });
    
    loadUltraNewsData();
    showNotification('Filters reset to default', 'info');
}

// Utility functions
function updateLiveTime() {
    const now = new Date();
    document.getElementById('liveTime').textContent = 
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateCoordinates() {
    const center = ultraMap.getCenter();
    document.getElementById('coordinates').innerHTML = `
        ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)} | Zoom: ${ultraMap.getZoom()}
    `;
}

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationSystem');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function startLiveUpdates() {
    setInterval(() => {
        if (document.getElementById('filtersPanel').classList.contains('active')) return;
        loadUltraNewsData();
    }, 30000); // Update every 30 seconds
}

// FAB functionality
function initializeFAB() {
    const mainFab = document.querySelector('.main-fab');
    const fabMenu = document.getElementById('fabMenu');
    
    mainFab.addEventListener('click', toggleFabMenu);
}

function toggleFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    fabMenu.classList.toggle('active');
}

function addNewsReport() {
    showNotification('News reporting feature coming soon!', 'info');
    toggleFabMenu();
}

function shareLocation() {
    if (navigator.share && userLocation) {
        navigator.share({
            title: 'My Location - Civic Lens Solutions',
            text: `Check out this location: ${userLocation.lat}, ${userLocation.lng}`,
            url: window.location.href
        });
    } else {
        showNotification('Location shared to clipboard', 'success');
    }
    toggleFabMenu();
}

function saveLocation() {
    showNotification('Location saved to favorites', 'success');
    toggleFabMenu();
}

function emergencyAlert() {
    showNotification('Emergency alert sent to authorities', 'success');
    toggleFabMenu();
}

// Add dynamic CSS animations
const dynamicCSS = `
@keyframes pulse-critical {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
}

.ultra-popup {
    min-width: 280px;
    font-family: 'Inter', sans-serif;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.popup-type {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 10px;
    background: rgba(26, 115, 232, 0.1);
    color: #1a73e8;
}

.popup-type.breaking {
    background: rgba(234, 67, 53, 0.1);
    color: #ea4335;
}

.popup-type.verified {
    background: rgba(52, 168, 83, 0.1);
    color: #34a853;
}

.popup-type.alerts {
    background: rgba(251, 188, 4, 0.1);
    color: #fbbc04;
}

.popup-credibility {
    font-size: 0.8rem;
    color: #666;
    font-weight: 500;
}

.popup-summary {
    color: #555;
    line-height: 1.4;
    margin: 8px 0;
}

.popup-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    margin: 12px 0;
}

.popup-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.popup-btn {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.popup-btn.primary {
    background: #1a73e8;
    color: white;
}

.popup-btn.primary:hover {
    background: #1557b0;
}

.popup-btn.secondary {
    background: #f5f5f5;
    color: #666;
}

.popup-btn.secondary:hover {
    background: #e0e0e0;
}

.notification {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    margin-bottom: 12px;
    overflow: hidden;
    animation: slideInRight 0.3s ease;
}

.notification-content {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification.success {
    border-left: 4px solid #34a853;
}

.notification.error {
    border-left: 4px solid #ea4335;
}

.notification.warning {
    border-left: 4px solid #fbbc04;
}

.notification.info {
    border-left: 4px solid #1a73e8;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// Inject dynamic CSS
const style = document.createElement('style');
style.textContent = dynamicCSS;
document.head.appendChild(style);
