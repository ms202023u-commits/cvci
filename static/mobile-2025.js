// 2025 Mobile-First Interactive Components - Civic Lens Solutions

// Advanced Mobile Detection and Optimization
class MobileOptimizer {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.viewport = this.getViewportSize();
        this.orientation = this.getOrientation();
        
        this.init();
    }
    
    init() {
        this.setupViewportOptimization();
        this.setupTouchOptimization();
        this.setupGestureHandling();
        this.setupPerformanceOptimization();
        this.setupAccessibilityEnhancements();
    }
    
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1
        };
    }
    
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    setupViewportOptimization() {
        // Dynamic viewport height for mobile browsers
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
    }
    
    setupTouchOptimization() {
        if (!this.isTouch) return;
        
        // Enhanced touch targets
        document.body.classList.add('touch-device');
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Optimize scroll performance
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
    }
    
    handleTouchMove(e) {
        if (!this.touchStartY || !this.touchStartX) return;
        
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const diffY = this.touchStartY - touchY;
        const diffX = this.touchStartX - touchX;
        
        // Prevent overscroll bounce
        const target = e.target.closest('.chat-messages, .scrollable');
        if (target) {
            const isAtTop = target.scrollTop === 0;
            const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
            
            if ((isAtTop && diffY < 0) || (isAtBottom && diffY > 0)) {
                e.preventDefault();
            }
        }
    }
    
    setupGestureHandling() {
        // Swipe gestures for navigation
        let startX, startY, startTime;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            const timeDiff = endTime - startTime;
            
            // Swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && timeDiff < 300) {
                if (diffX > 0) {
                    this.handleSwipeLeft();
                } else {
                    this.handleSwipeRight();
                }
            }
        });
    }
    
    handleSwipeLeft() {
        // Navigate to next page or open menu
        const currentPath = window.location.pathname;
        const pages = ['/', '/chatbot', '/report', '/map'];
        const currentIndex = pages.indexOf(currentPath);
        
        if (currentIndex < pages.length - 1) {
            window.location.href = pages[currentIndex + 1];
        }
    }
    
    handleSwipeRight() {
        // Navigate to previous page or close menu
        const currentPath = window.location.pathname;
        const pages = ['/', '/chatbot', '/report', '/map'];
        const currentIndex = pages.indexOf(currentPath);
        
        if (currentIndex > 0) {
            window.location.href = pages[currentIndex - 1];
        }
    }
    
    setupPerformanceOptimization() {
        // Lazy loading for images and heavy content
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Optimize animations for mobile
        if (this.isMobile) {
            document.body.classList.add('mobile-optimized');
        }
    }
    
    setupAccessibilityEnhancements() {
        // Enhanced focus management for mobile
        document.addEventListener('focusin', (e) => {
            if (this.isMobile && e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
        
        // Voice input support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceInput();
        }
    }
    
    setupVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        // Add voice input button to chat input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            const voiceBtn = document.createElement('button');
            voiceBtn.type = 'button';
            voiceBtn.className = 'voice-input-btn';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.setAttribute('aria-label', 'Voice input');
            
            voiceBtn.addEventListener('click', () => {
                recognition.start();
                voiceBtn.classList.add('listening');
            });
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                chatInput.dispatchEvent(new Event('input'));
                voiceBtn.classList.remove('listening');
            };
            
            recognition.onerror = () => {
                voiceBtn.classList.remove('listening');
            };
            
            chatInput.parentNode.appendChild(voiceBtn);
        }
    }
}

// 2025 Advanced UI Components
class ModernUIComponents {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupDynamicIslands();
        this.setupNeuralMorphism();
        this.setupSmartNotifications();
        this.setupAdaptiveTheme();
        this.setupMicroInteractions();
    }
    
    setupDynamicIslands() {
        // Create dynamic notification islands
        const createIsland = (message, type = 'info', duration = 3000) => {
            const island = document.createElement('div');
            island.className = `dynamic-island ${type}`;
            island.innerHTML = `
                <div class="island-content">
                    <i class="fas fa-${this.getIconForType(type)}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(island);
            
            // Animate in
            requestAnimationFrame(() => {
                island.classList.add('show');
            });
            
            // Auto remove
            setTimeout(() => {
                island.classList.remove('show');
                setTimeout(() => island.remove(), 300);
            }, duration);
        };
        
        // Expose globally
        window.showNotification = createIsland;
    }
    
    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    setupNeuralMorphism() {
        // Add neural morphism effects to interactive elements
        const addNeuralEffect = (element) => {
            element.addEventListener('mousedown', () => {
                element.classList.add('neural-pressed');
            });
            
            element.addEventListener('mouseup', () => {
                element.classList.remove('neural-pressed');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('neural-pressed');
            });
        };
        
        document.querySelectorAll('.btn-primary, .service-card, .nav-link').forEach(addNeuralEffect);
    }
    
    setupSmartNotifications() {
        // Intelligent notification system
        class SmartNotificationSystem {
            constructor() {
                this.queue = [];
                this.isShowing = false;
                this.maxVisible = 3;
            }
            
            show(message, type = 'info', options = {}) {
                const notification = {
                    id: Date.now() + Math.random(),
                    message,
                    type,
                    duration: options.duration || 4000,
                    persistent: options.persistent || false
                };
                
                this.queue.push(notification);
                this.processQueue();
            }
            
            processQueue() {
                if (this.isShowing || this.queue.length === 0) return;
                
                const notification = this.queue.shift();
                this.displayNotification(notification);
            }
            
            displayNotification(notification) {
                this.isShowing = true;
                
                const element = document.createElement('div');
                element.className = `smart-notification ${notification.type}`;
                element.innerHTML = `
                    <div class="notification-content">
                        <i class="fas fa-${this.getIconForType(notification.type)}"></i>
                        <span>${notification.message}</span>
                        <button class="notification-close" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                document.body.appendChild(element);
                
                // Close button
                element.querySelector('.notification-close').addEventListener('click', () => {
                    this.hideNotification(element);
                });
                
                // Show animation
                requestAnimationFrame(() => {
                    element.classList.add('show');
                });
                
                // Auto hide
                if (!notification.persistent) {
                    setTimeout(() => {
                        this.hideNotification(element);
                    }, notification.duration);
                }
            }
            
            hideNotification(element) {
                element.classList.remove('show');
                setTimeout(() => {
                    element.remove();
                    this.isShowing = false;
                    this.processQueue();
                }, 300);
            }
        }
        
        window.notifications = new SmartNotificationSystem();
    }
    
    setupAdaptiveTheme() {
        // Adaptive theme based on time and user preference
        const getTimeBasedTheme = () => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 18) {
                return 'day';
            } else if (hour >= 18 && hour < 22) {
                return 'evening';
            } else {
                return 'night';
            }
        };
        
        const applyTheme = (theme) => {
            document.body.setAttribute('data-theme', theme);
        };
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('night');
        } else {
            applyTheme(getTimeBasedTheme());
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            applyTheme(e.matches ? 'night' : 'day');
        });
    }
    
    setupMicroInteractions() {
        // Subtle micro-interactions for better UX
        const addRippleEffect = (element) => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                element.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        };
        
        document.querySelectorAll('.btn-primary, .send-btn, .nav-link').forEach(addRippleEffect);
        
        // Magnetic buttons effect
        const addMagneticEffect = (element) => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        };
        
        if (!window.matchMedia('(hover: none)').matches) {
            document.querySelectorAll('.service-card').forEach(addMagneticEffect);
        }
    }
}

// 2025 Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }
    
    init() {
        this.monitorPerformance();
        this.optimizeForDevice();
        this.setupLazyLoading();
    }
    
    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.metrics.lcp = entry.startTime;
                    }
                    if (entry.entryType === 'first-input') {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                    }
                    if (entry.entryType === 'layout-shift') {
                        this.metrics.cls = (this.metrics.cls || 0) + entry.value;
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    }
    
    optimizeForDevice() {
        // Reduce animations on low-end devices
        const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                              navigator.deviceMemory <= 2 ||
                              /Android.*Chrome\/[.0-9]*\s(?=Mobile)/i.test(navigator.userAgent);
        
        if (isLowEndDevice) {
            document.body.classList.add('low-end-device');
        }
        
        // Optimize for battery level
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                if (battery.level < 0.2) {
                    document.body.classList.add('low-battery');
                }
            });
        }
    }
    
    setupLazyLoading() {
        // Advanced lazy loading with priority hints
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.loading = 'lazy';
                img.src = img.dataset.src;
            });
        }
        
        // Lazy load heavy components
        const lazyComponents = document.querySelectorAll('[data-lazy-component]');
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target;
                    const componentName = component.dataset.lazyComponent;
                    this.loadComponent(componentName, component);
                    componentObserver.unobserve(component);
                }
            });
        }, { rootMargin: '50px' });
        
        lazyComponents.forEach(component => componentObserver.observe(component));
    }
    
    loadComponent(name, element) {
        // Dynamic component loading
        switch (name) {
            case 'map':
                this.loadMapComponent(element);
                break;
            case 'chart':
                this.loadChartComponent(element);
                break;
            default:
                console.warn(`Unknown component: ${name}`);
        }
    }
    
    loadMapComponent(element) {
        // Load map component only when needed
        element.innerHTML = '<div class="map-placeholder">Loading interactive map...</div>';
        // Actual map loading would go here
    }
    
    loadChartComponent(element) {
        // Load chart component only when needed
        element.innerHTML = '<div class="chart-placeholder">Loading analytics...</div>';
        // Actual chart loading would go here
    }
}

// Initialize 2025 Mobile System
document.addEventListener('DOMContentLoaded', () => {
    const mobileOptimizer = new MobileOptimizer();
    const uiComponents = new ModernUIComponents();
    const performanceMonitor = new PerformanceMonitor();
    
    // Global utilities
    window.CivicLens2025 = {
        mobile: mobileOptimizer,
        ui: uiComponents,
        performance: performanceMonitor
    };
    
    // Show welcome notification
    setTimeout(() => {
        if (window.notifications) {
            window.notifications.show('Welcome to Civic Lens Solutions 2025! 🚀', 'success');
        }
    }, 1000);
});

// Service Worker Registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
