// Ultra-Modern Homepage JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading screen
    initLoadingScreen();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize animations
    initAnimations();
    
    // Initialize stats counter
    initStatsCounter();
    
    // Initialize interactive elements
    initInteractiveElements();
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 2000);
}

// Navigation
function initNavigation() {
    const nav = document.getElementById('ultraNav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(10, 11, 30, 0.95)';
            nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
        } else {
            nav.style.background = 'rgba(10, 11, 30, 0.9)';
            nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        }
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Animations
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .stat-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Add CSS for animate-in class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Floating particles animation
    createFloatingParticles();
}

// Floating Particles
function createFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 20 + 10}s infinite linear;
        `;
        particlesContainer.appendChild(particle);
    }
    
    // Add particle animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Stats Counter
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target > 1000) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    };
    
    // Intersection Observer for stats
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Interactive Elements
function initInteractiveElements() {
    // Service cards hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.hero-btn, .nav-btn, .cta-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
    
    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.gradient-orb');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Dynamic cursor effect
    initCursorEffect();
}

// Cursor Effect
function initCursorEffect() {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: all 0.1s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    // Interactive elements cursor effect
    const interactiveElements = document.querySelectorAll('button, .service-card, .nav-link, a');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        });
    });
}

// Demo functionality
function startDemo() {
    // Create demo modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 3rem;
        max-width: 500px;
        text-align: center;
        backdrop-filter: blur(20px);
        color: white;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
        <h2 style="margin-bottom: 1rem; font-size: 2rem;">Choose Your Experience</h2>
        <p style="margin-bottom: 2rem; color: rgba(255, 255, 255, 0.8);">
            Explore our advanced AI-powered news verification platform
        </p>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button onclick="window.location.href='enhanced-chatbot.html'" style="
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                🤖 Try Enhanced AI Chatbots
            </button>
            <button onclick="window.location.href='ultra-map.html'" style="
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                🗺️ Explore Ultra News Map
            </button>
            <button onclick="window.location.href='report.html'" style="
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                📝 Submit Community Report
            </button>
            <button onclick="this.closest('.demo-modal').remove()" style="
                padding: 0.75rem 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
                margin-top: 1rem;
            ">
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    modal.className = 'demo-modal';
    document.body.appendChild(modal);
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
window.addEventListener('scroll', debounce(() => {
    // Optimized scroll handlers
}, 10));

// Error handling
window.addEventListener('error', (e) => {
    console.warn('Ultra Index Error:', e.error);
});

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('.demo-modal');
        if (modal) {
            modal.remove();
        }
    }
});

// Initialize theme detection
function initThemeDetection() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!prefersDark) {
        // Adjust colors for light mode preference
        document.documentElement.style.setProperty('--text-primary', '#1a1a1a');
        document.documentElement.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.8)');
    }
}

// Initialize on load
initThemeDetection();

// Recent Reports Class
class RecentReports {
    constructor() {
        this.reportsGrid = document.getElementById('reportsGrid');
        this.refreshBtn = document.getElementById('refreshReports');
        this.sampleReports = [
            {
                id: 1,
                type: 'breaking',
                title: 'Local Election Results Under Review',
                content: 'Community members report discrepancies in voting counts at downtown polling station.',
                location: 'Downtown District',
                timestamp: '2 hours ago',
                credibility: 'high',
                score: 85
            },
            {
                id: 2,
                type: 'verified',
                title: 'Infrastructure Project Update',
                content: 'New bridge construction ahead of schedule, expected completion moved to Q2 2025.',
                location: 'Riverside Area',
                timestamp: '4 hours ago',
                credibility: 'high',
                score: 92
            },
            {
                id: 3,
                type: 'pending',
                title: 'Social Media Misinformation Alert',
                content: 'False claims about local business closures circulating on social platforms.',
                location: 'Business District',
                timestamp: '6 hours ago',
                credibility: 'medium',
                score: 67
            },
            {
                id: 4,
                type: 'verified',
                title: 'Community Safety Initiative',
                content: 'New neighborhood watch program shows 30% reduction in reported incidents.',
                location: 'Residential Zone',
                timestamp: '8 hours ago',
                credibility: 'high',
                score: 88
            },
            {
                id: 5,
                type: 'breaking',
                title: 'Weather Emergency Response',
                content: 'Local authorities activate emergency protocols due to severe weather warnings.',
                location: 'City-wide',
                timestamp: '1 hour ago',
                credibility: 'high',
                score: 94
            },
            {
                id: 6,
                type: 'pending',
                title: 'Public Transportation Changes',
                content: 'Unconfirmed reports of route modifications affecting morning commuters.',
                location: 'Transit Hub',
                timestamp: '5 hours ago',
                credibility: 'medium',
                score: 72
            }
        ];
        this.init();
    }

    init() {
        this.bindEvents();
        // Load reports after a short delay to show loading animation
        setTimeout(() => {
            this.loadReports();
        }, 1500);
    }

    bindEvents() {
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.refreshReports();
            });
        }
    }

    getRandomReports(count = 3) {
        const shuffled = [...this.sampleReports].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    createReportCard(report) {
        const typeIcons = {
            breaking: 'fas fa-exclamation-triangle',
            verified: 'fas fa-check-circle',
            pending: 'fas fa-clock'
        };

        return `
            <div class="report-card" data-report-id="${report.id}">
                <div class="report-header">
                    <div class="report-type ${report.type}">
                        <i class="${typeIcons[report.type]}"></i>
                        <span>${report.type}</span>
                    </div>
                    <div class="report-timestamp">
                        <i class="fas fa-clock"></i>
                        <span>${report.timestamp}</span>
                    </div>
                </div>
                
                <div class="report-content">
                    <h3>${report.title}</h3>
                    <p>${report.content}</p>
                </div>
                
                <div class="report-meta">
                    <div class="report-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${report.location}</span>
                    </div>
                    <div class="report-credibility">
                        <span>Credibility:</span>
                        <span class="credibility-score ${report.credibility}">${report.score}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    loadReports() {
        const reports = this.getRandomReports(3);
        
        // Clear loading placeholders
        this.reportsGrid.innerHTML = '';
        
        // Add reports with staggered animation
        reports.forEach((report, index) => {
            setTimeout(() => {
                const reportElement = document.createElement('div');
                reportElement.innerHTML = this.createReportCard(report);
                const reportCard = reportElement.firstElementChild;
                
                // Add click event for navigation to report page
                reportCard.addEventListener('click', () => {
                    window.location.href = '/report';
                });
                
                // Add entrance animation
                reportCard.style.opacity = '0';
                reportCard.style.transform = 'translateY(30px)';
                this.reportsGrid.appendChild(reportCard);
                
                // Trigger animation
                requestAnimationFrame(() => {
                    reportCard.style.transition = 'all 0.6s ease-out';
                    reportCard.style.opacity = '1';
                    reportCard.style.transform = 'translateY(0)';
                });
            }, index * 200);
        });
    }

    refreshReports() {
        // Add loading state
        this.refreshBtn.disabled = true;
        const icon = this.refreshBtn.querySelector('i');
        icon.style.animation = 'spin 1s linear infinite';
        
        // Fade out current reports
        const currentCards = this.reportsGrid.querySelectorAll('.report-card');
        currentCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';
            }, index * 100);
        });
        
        // Load new reports after fade out
        setTimeout(() => {
            this.loadReports();
            
            // Reset refresh button
            setTimeout(() => {
                this.refreshBtn.disabled = false;
                icon.style.animation = '';
            }, 1000);
        }, 800);
    }
}

// Add spin animation for refresh button
const reportsStyle = document.createElement('style');
reportsStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(reportsStyle);

// Initialize Recent Reports when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Recent Reports after a delay to ensure DOM is ready
    setTimeout(() => {
        if (document.getElementById('reportsGrid')) {
            new RecentReports();
        }
    }, 100);
});
