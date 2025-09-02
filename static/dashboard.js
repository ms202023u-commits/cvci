// Dashboard JavaScript - Unified with #182d43 Design

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeCharts();
    setupEventListeners();
    loadDashboardData();
});

// Initialize dashboard components
function initializeDashboard() {
    // Set default values
    document.getElementById('countrySelect').value = 'global';
    document.getElementById('citySelect').value = 'all';
    document.getElementById('timeRange').value = '24h';
    
    // Update city options based on country selection
    updateCityOptions();
}

// Setup event listeners
function setupEventListeners() {
    // Location selectors
    document.getElementById('countrySelect').addEventListener('change', function() {
        updateCityOptions();
        loadDashboardData();
    });
    
    document.getElementById('citySelect').addEventListener('change', loadDashboardData);
    document.getElementById('timeRange').addEventListener('change', loadDashboardData);
    
    // Chart controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateChart(this.dataset.chart);
        });
    });
    
    // Source filter
    document.querySelector('.source-filter').addEventListener('change', function() {
        updateSourcesDisplay(this.value);
    });
}

// Update city options based on selected country
function updateCityOptions() {
    const countrySelect = document.getElementById('countrySelect');
    const citySelect = document.getElementById('citySelect');
    const country = countrySelect.value;
    
    // Clear existing options
    citySelect.innerHTML = '<option value="all">All Cities</option>';
    
    // City options by country
    const cityOptions = {
        'us': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
        'uk': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
        'ca': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
        'au': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
        'de': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
        'fr': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
        'jp': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Kobe']
    };
    
    if (cityOptions[country]) {
        cityOptions[country].forEach(city => {
            const option = document.createElement('option');
            option.value = city.toLowerCase().replace(' ', '-');
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// Load dashboard data based on current selections
function loadDashboardData() {
    const country = document.getElementById('countrySelect').value;
    const city = document.getElementById('citySelect').value;
    const timeRange = document.getElementById('timeRange').value;
    
    // Simulate API call with sample data
    const data = generateSampleData(country, city, timeRange);
    
    // Update metrics
    updateMetrics(data.metrics);
    
    // Update charts
    updateChartsData(data.charts);
    
    // Update activity
    updateActivity(data.activity);
    
    // Update sources
    updateSources(data.sources);
}

// Generate sample data based on selections
function generateSampleData(country, city, timeRange) {
    const baseMultiplier = getLocationMultiplier(country, city);
    const timeMultiplier = getTimeMultiplier(timeRange);
    
    return {
        metrics: {
            totalNews: Math.floor(1000 * baseMultiplier * timeMultiplier),
            fakeNews: Math.floor(80 * baseMultiplier * timeMultiplier),
            verifiedNews: Math.floor(920 * baseMultiplier * timeMultiplier),
            avgResponseTime: (2.3 + Math.random() * 0.5).toFixed(1)
        },
        charts: generateChartData(baseMultiplier, timeMultiplier),
        activity: generateActivityData(country, city),
        sources: generateSourcesData(baseMultiplier)
    };
}

// Get location-based multiplier
function getLocationMultiplier(country, city) {
    const countryMultipliers = {
        'global': 1.0,
        'us': 1.2,
        'uk': 0.8,
        'ca': 0.6,
        'au': 0.5,
        'de': 0.7,
        'fr': 0.7,
        'jp': 0.9
    };
    
    let multiplier = countryMultipliers[country] || 1.0;
    
    // City-specific adjustments
    if (city !== 'all') {
        const majorCities = ['new-york', 'london', 'tokyo', 'paris', 'berlin'];
        if (majorCities.includes(city)) {
            multiplier *= 1.5;
        } else {
            multiplier *= 0.8;
        }
    }
    
    return multiplier;
}

// Get time-based multiplier
function getTimeMultiplier(timeRange) {
    const multipliers = {
        '24h': 1.0,
        '7d': 7.0,
        '30d': 30.0,
        '90d': 90.0
    };
    return multipliers[timeRange] || 1.0;
}

// Update metrics display
function updateMetrics(metrics) {
    document.getElementById('totalNews').textContent = metrics.totalNews.toLocaleString();
    document.getElementById('fakeNews').textContent = metrics.fakeNews.toLocaleString();
    document.getElementById('verifiedNews').textContent = metrics.verifiedNews.toLocaleString();
    document.getElementById('avgResponseTime').textContent = metrics.avgResponseTime + 's';
}

// Initialize charts
function initializeCharts() {
    // Trends Chart
    const trendsCtx = document.getElementById('trendsChart').getContext('2d');
    window.trendsChart = new Chart(trendsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Verified News',
                data: [],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4
            }, {
                label: 'Fake News',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e7eb'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                y: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                }
            }
        }
    });
    
    // Geographic Chart
    const geoCtx = document.getElementById('geoChart').getContext('2d');
    window.geoChart = new Chart(geoCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#182d43',
                    '#22c55e',
                    '#3b82f6',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e5e7eb',
                        padding: 20
                    }
                }
            }
        }
    });
}

// Generate chart data
function generateChartData(baseMultiplier, timeMultiplier) {
    const days = timeMultiplier <= 7 ? Math.ceil(timeMultiplier) : 7;
    const labels = [];
    const verifiedData = [];
    const fakeData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        verifiedData.push(Math.floor((80 + Math.random() * 40) * baseMultiplier));
        fakeData.push(Math.floor((5 + Math.random() * 10) * baseMultiplier));
    }
    
    return {
        trends: { labels, verifiedData, fakeData },
        geographic: {
            labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'],
            data: [35, 28, 20, 8, 6, 3]
        }
    };
}

// Update charts with new data
function updateChartsData(chartData) {
    // Update trends chart
    window.trendsChart.data.labels = chartData.trends.labels;
    window.trendsChart.data.datasets[0].data = chartData.trends.verifiedData;
    window.trendsChart.data.datasets[1].data = chartData.trends.fakeData;
    window.trendsChart.update();
    
    // Update geographic chart
    window.geoChart.data.labels = chartData.geographic.labels;
    window.geoChart.data.datasets[0].data = chartData.geographic.data;
    window.geoChart.update();
}

// Update chart display based on selected type
function updateChart(chartType) {
    // This would switch between different chart views
    console.log('Switching to chart type:', chartType);
}

// Generate activity data
function generateActivityData(country, city) {
    const activities = [
        {
            type: 'fake-news',
            title: `Fake news detected in ${getLocationName(country, city)}`,
            description: 'Misleading article about local politics flagged by AI',
            time: '2 minutes ago',
            status: 'High Risk'
        },
        {
            type: 'verified',
            title: `Article verified in ${getLocationName(country, city)}`,
            description: 'Breaking news story confirmed by multiple sources',
            time: '5 minutes ago',
            status: 'Verified'
        },
        {
            type: 'analysis',
            title: 'AI analysis completed',
            description: `Batch processing of 50 articles from ${getLocationName(country, city)}`,
            time: '8 minutes ago',
            status: 'Processed'
        }
    ];
    
    return activities;
}

// Get location name for display
function getLocationName(country, city) {
    if (city !== 'all') {
        return city.charAt(0).toUpperCase() + city.slice(1).replace('-', ' ');
    }
    
    const countryNames = {
        'global': 'Global',
        'us': 'United States',
        'uk': 'United Kingdom',
        'ca': 'Canada',
        'au': 'Australia',
        'de': 'Germany',
        'fr': 'France',
        'jp': 'Japan'
    };
    
    return countryNames[country] || 'Global';
}

// Update activity display
function updateActivity(activities) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const statusClass = activity.status === 'High Risk' ? 'danger' : 
                           activity.status === 'Verified' ? 'success' : 'info';
        
        activityItem.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
            <div class="activity-status">
                <span class="status-badge ${statusClass}">${activity.status}</span>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Get activity icon
function getActivityIcon(type) {
    const icons = {
        'fake-news': 'fa-exclamation-triangle',
        'verified': 'fa-check-circle',
        'analysis': 'fa-brain'
    };
    return icons[type] || 'fa-info-circle';
}

// Generate sources data
function generateSourcesData(baseMultiplier) {
    return [
        {
            name: 'Reuters',
            domain: 'reuters.com',
            credibility: 95,
            articles: Math.floor(234 * baseMultiplier)
        },
        {
            name: 'BBC News',
            domain: 'bbc.com',
            credibility: 93,
            articles: Math.floor(189 * baseMultiplier)
        },
        {
            name: 'Associated Press',
            domain: 'apnews.com',
            credibility: 91,
            articles: Math.floor(156 * baseMultiplier)
        }
    ];
}

// Update sources display
function updateSources(sources) {
    const sourcesGrid = document.querySelector('.sources-grid');
    sourcesGrid.innerHTML = '';
    
    sources.forEach(source => {
        const sourceCard = document.createElement('div');
        sourceCard.className = 'source-card';
        
        sourceCard.innerHTML = `
            <div class="source-info">
                <div class="source-name">${source.name}</div>
                <div class="source-domain">${source.domain}</div>
            </div>
            <div class="source-metrics">
                <div class="credibility-score">
                    <span class="score-value">${source.credibility}</span>
                    <span class="score-label">Credibility</span>
                </div>
                <div class="article-count">
                    <span class="count-value">${source.articles}</span>
                    <span class="count-label">Articles</span>
                </div>
            </div>
        `;
        
        sourcesGrid.appendChild(sourceCard);
    });
}

// Update sources display based on filter
function updateSourcesDisplay(filterType) {
    console.log('Filtering sources by:', filterType);
    // This would re-sort the sources based on the selected filter
}

// Refresh activity data
function refreshActivity() {
    const country = document.getElementById('countrySelect').value;
    const city = document.getElementById('citySelect').value;
    
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    
    setTimeout(() => {
        const newActivity = generateActivityData(country, city);
        updateActivity(newActivity);
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    }, 1000);
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});
