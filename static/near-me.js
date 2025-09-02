// Near Me Page - JavaScript Functionality

class NearMePage {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.markers = [];
        this.currentFilter = 'all';
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeMap();
        this.getUserLocation();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.resultsList = document.getElementById('resultsList');
        this.resultsCount = document.getElementById('resultsCount');
        this.locationBadge = document.getElementById('locationBadge');
        this.locateBtn = document.getElementById('locateBtn');
        this.layersBtn = document.getElementById('layersBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
    }

    setupEventListeners() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setActiveFilter(tab.dataset.filter);
            });
        });

        // Map controls
        this.locateBtn.addEventListener('click', () => this.getUserLocation());
        this.layersBtn.addEventListener('click', () => this.toggleLayers());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Result item clicks
        this.resultsList.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.result-item');
            if (resultItem) {
                this.selectResult(resultItem);
            }
        });
    }

    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([40.7128, -74.0060], 12); // Default to NYC

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add some sample markers
        this.addSampleMarkers();

        // Map event listeners
        this.map.on('click', (e) => {
            this.onMapClick(e);
        });
    }

    addSampleMarkers() {
        const sampleData = [
            {
                lat: 40.7128,
                lng: -74.0060,
                type: 'news',
                title: 'Local Election Updates',
                description: 'Latest updates on municipal elections'
            },
            {
                lat: 40.7200,
                lng: -74.0100,
                type: 'events',
                title: 'Community Town Hall',
                description: 'Public meeting to discuss infrastructure'
            },
            {
                lat: 40.7080,
                lng: -74.0020,
                type: 'civic',
                title: 'City Council Meeting',
                description: 'Monthly city council session'
            }
        ];

        sampleData.forEach(item => {
            const icon = this.getMarkerIcon(item.type);
            const marker = L.marker([item.lat, item.lng], { icon })
                .addTo(this.map)
                .bindPopup(`
                    <div class="marker-popup">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                        <div class="popup-actions">
                            <button class="popup-btn" onclick="nearMePage.viewDetails('${item.title}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="popup-btn" onclick="nearMePage.getDirections(${item.lat}, ${item.lng})">
                                <i class="fas fa-directions"></i> Directions
                            </button>
                        </div>
                    </div>
                `);
            
            this.markers.push({
                marker,
                data: item
            });
        });
    }

    getMarkerIcon(type) {
        const iconColors = {
            news: '#182d43',
            events: '#28a745',
            civic: '#ffc107'
        };

        const iconSymbols = {
            news: 'newspaper',
            events: 'calendar',
            civic: 'landmark'
        };

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-icon" style="background: ${iconColors[type]}">
                    <i class="fas fa-${iconSymbols[type]}"></i>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    getUserLocation() {
        if (navigator.geolocation) {
            this.updateLocationBadge('Getting your location...', 'loading');
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Update map view
                    this.map.setView([this.userLocation.lat, this.userLocation.lng], 14);
                    
                    // Add user location marker
                    if (this.userMarker) {
                        this.map.removeLayer(this.userMarker);
                    }
                    
                    this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<div class="user-marker"><i class="fas fa-user"></i></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(this.map);
                    
                    // Reverse geocode to get address
                    this.reverseGeocode(this.userLocation.lat, this.userLocation.lng);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.updateLocationBadge('Location unavailable', 'error');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        } else {
            this.updateLocationBadge('Geolocation not supported', 'error');
        }
    }

    reverseGeocode(lat, lng) {
        // Simple reverse geocoding using Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(response => response.json())
            .then(data => {
                const address = data.display_name || 'Unknown location';
                const shortAddress = address.split(',').slice(0, 2).join(',');
                this.updateLocationBadge(shortAddress, 'success');
            })
            .catch(error => {
                console.error('Reverse geocoding error:', error);
                this.updateLocationBadge(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
            });
    }

    updateLocationBadge(text, status) {
        const badge = this.locationBadge;
        const icon = badge.querySelector('i');
        const span = badge.querySelector('span');
        
        // Update icon based on status
        switch (status) {
            case 'loading':
                icon.className = 'fas fa-spinner fa-spin';
                break;
            case 'success':
                icon.className = 'fas fa-location-dot';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-triangle';
                break;
        }
        
        span.textContent = text;
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        this.filterTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });
        
        // Filter markers
        this.filterMarkers();
        
        // Filter results
        this.filterResults();
    }

    filterMarkers() {
        this.markers.forEach(({ marker, data }) => {
            if (this.currentFilter === 'all' || data.type === this.currentFilter) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    filterResults() {
        const resultItems = this.resultsList.querySelectorAll('.result-item');
        let visibleCount = 0;
        
        resultItems.forEach(item => {
            const type = item.querySelector('.result-icon').classList.contains('news') ? 'news' :
                        item.querySelector('.result-icon').classList.contains('events') ? 'events' : 'civic';
            
            if (this.currentFilter === 'all' || type === this.currentFilter) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        this.resultsCount.textContent = `${visibleCount} items found`;
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        
        console.log('Searching for:', query);
        // Implement search functionality here
        // This would typically involve API calls to search for local content
        
        // For demo purposes, just filter existing results
        this.searchResults(query);
    }

    searchResults(query) {
        const resultItems = this.resultsList.querySelectorAll('.result-item');
        let visibleCount = 0;
        
        resultItems.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        this.resultsCount.textContent = `${visibleCount} items found`;
    }

    selectResult(resultItem) {
        // Remove previous selection
        this.resultsList.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        resultItem.classList.add('selected');
        
        // Get result data and center map
        const title = resultItem.querySelector('h4').textContent;
        const markerData = this.markers.find(m => m.data.title === title);
        
        if (markerData) {
            this.map.setView([markerData.data.lat, markerData.data.lng], 16);
            markerData.marker.openPopup();
        }
    }

    toggleLayers() {
        // Implement layer toggle functionality
        console.log('Toggle layers');
        // This could show/hide different map layers
    }

    toggleFullscreen() {
        const mapContainer = document.querySelector('.map-container');
        
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().then(() => {
                this.fullscreenBtn.querySelector('i').className = 'fas fa-compress';
                setTimeout(() => this.map.invalidateSize(), 100);
            });
        } else {
            document.exitFullscreen().then(() => {
                this.fullscreenBtn.querySelector('i').className = 'fas fa-expand';
                setTimeout(() => this.map.invalidateSize(), 100);
            });
        }
    }

    onMapClick(e) {
        console.log('Map clicked at:', e.latlng);
        // Implement map click functionality
    }

    viewDetails(title) {
        console.log('View details for:', title);
        // Implement view details functionality
        alert(`Viewing details for: ${title}`);
    }

    getDirections(lat, lng) {
        if (this.userLocation) {
            const url = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${lat},${lng}`;
            window.open(url, '_blank');
        } else {
            alert('Please allow location access to get directions');
        }
    }
}

// Enhanced CSS for markers and popups
const markerCSS = `
<style>
.custom-marker {
    background: transparent;
    border: none;
}

.marker-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 2px solid white;
}

.user-location-marker {
    background: transparent;
    border: none;
}

.user-marker {
    width: 20px;
    height: 20px;
    background: #dc3545;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
    border: 2px solid white;
}

.marker-popup {
    min-width: 200px;
}

.marker-popup h4 {
    margin: 0 0 8px 0;
    color: #182d43 !important;
    font-size: 14px;
    font-weight: 600;
}

.marker-popup p {
    margin: 0 0 12px 0;
    color: #666 !important;
    font-size: 12px;
    line-height: 1.4;
}

.popup-actions {
    display: flex;
    gap: 8px;
}

.popup-btn {
    background: #182d43 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px !important;
    padding: 6px 10px !important;
    font-size: 11px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
}

.popup-btn:hover {
    background: #2a4a6b !important;
    transform: translateY(-1px) !important;
}

.result-item.selected {
    background: rgba(120, 219, 255, 0.2) !important;
    border-left: 4px solid #78dbff;
}

.leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.leaflet-popup-tip {
    background: white;
}
</style>
`;

// Add marker CSS to head
document.head.insertAdjacentHTML('beforeend', markerCSS);

// Initialize Near Me page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nearMePage = new NearMePage();
});
