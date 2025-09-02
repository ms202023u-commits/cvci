// Enhanced Navigation with Smooth Transitions and Bug Fixes
class EnhancedNavigation {
    constructor() {
        this.isNavigating = false;
        this.transitionElement = null;
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.createPageTransition();
        this.bindNavigationEvents();
        this.bindMobileNavigation();
        this.handleActiveStates();
        this.preventDoubleClicks();
    }

    createPageTransition() {
        // Create page transition overlay
        this.transitionElement = document.createElement('div');
        this.transitionElement.className = 'page-transition';
        this.transitionElement.innerHTML = `
            <div class="page-transition-content">
                <div class="page-transition-spinner"></div>
                <div class="page-transition-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(this.transitionElement);
    }

    bindNavigationEvents() {
        // Enhanced navigation link handling
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });

        // Enhanced button navigation
        const navButtons = document.querySelectorAll('.nav-btn[onclick], .cta-btn[onclick]');
        navButtons.forEach(button => {
            const originalOnclick = button.getAttribute('onclick');
            button.removeAttribute('onclick');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleButtonNavigation(originalOnclick);
            });
        });
    }

    bindMobileNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.mobileMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close mobile menu on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    handleNavigation(link) {
        if (this.isNavigating) return;

        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        this.isNavigating = true;
        link.classList.add('loading');

        // Show transition
        this.showTransition();

        // Navigate after transition starts
        setTimeout(() => {
            try {
                window.location.href = href;
            } catch (error) {
                console.error('Navigation error:', error);
                this.hideTransition();
                this.isNavigating = false;
                link.classList.remove('loading');
            }
        }, 200);
    }

    handleButtonNavigation(onclickCode) {
        if (this.isNavigating || !onclickCode) return;

        this.isNavigating = true;
        this.showTransition();

        setTimeout(() => {
            try {
                // Safely execute the onclick code
                if (onclickCode.includes('window.location.href')) {
                    const urlMatch = onclickCode.match(/window\.location\.href\s*=\s*['"`]([^'"`]+)['"`]/);
                    if (urlMatch) {
                        window.location.href = urlMatch[1];
                    }
                } else if (onclickCode.includes('startDemo')) {
                    if (typeof startDemo === 'function') {
                        this.hideTransition();
                        this.isNavigating = false;
                        startDemo();
                    }
                } else {
                    // Fallback: execute the code directly (with caution)
                    eval(onclickCode);
                }
            } catch (error) {
                console.error('Button navigation error:', error);
                this.hideTransition();
                this.isNavigating = false;
            }
        }, 200);
    }

    toggleMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!navToggle || !navMenu) return;

        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            navToggle.classList.add('active');
            navMenu.classList.add('mobile-active');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('mobile-active');
            document.body.style.overflow = '';
            this.mobileMenuOpen = false;
        }
    }

    handleActiveStates() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            // Handle active state based on current page
            if (href === currentPath || 
                (currentPath === '/' && href === '/') ||
                (currentPath.includes('/civic-chatbot') && href.includes('civic_chatbot')) ||
                (currentPath.includes('/near-me') && href.includes('near_me')) ||
                (currentPath.includes('/report') && href.includes('report')) ||
                (currentPath.includes('/dashboard') && href.includes('dashboard'))) {
                link.classList.add('active');
            }
        });
    }

    preventDoubleClicks() {
        // Prevent double-click issues on all clickable elements
        const clickableElements = document.querySelectorAll('.nav-link, .nav-btn, .cta-btn, button');
        
        clickableElements.forEach(element => {
            let lastClickTime = 0;
            element.addEventListener('click', (e) => {
                const currentTime = Date.now();
                if (currentTime - lastClickTime < 300) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                lastClickTime = currentTime;
            });
        });
    }

    showTransition() {
        if (this.transitionElement) {
            this.transitionElement.classList.add('active');
        }
    }

    hideTransition() {
        if (this.transitionElement) {
            this.transitionElement.classList.remove('active');
        }
    }

    // Public method to manually trigger navigation
    navigateTo(url, showTransition = true) {
        if (this.isNavigating) return;

        this.isNavigating = true;
        
        if (showTransition) {
            this.showTransition();
            setTimeout(() => {
                window.location.href = url;
            }, 200);
        } else {
            window.location.href = url;
        }
    }
}

// Navigation Error Handler
class NavigationErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        // Handle navigation errors
        window.addEventListener('error', (e) => {
            if (e.message.includes('navigation') || e.message.includes('location')) {
                console.warn('Navigation error caught:', e.message);
                this.handleNavigationError();
            }
        });

        // Handle unhandled promise rejections (for async navigation)
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason && e.reason.message && e.reason.message.includes('navigation')) {
                console.warn('Navigation promise rejection:', e.reason);
                this.handleNavigationError();
            }
        });
    }

    handleNavigationError() {
        // Reset navigation state
        const navLinks = document.querySelectorAll('.nav-link.loading');
        navLinks.forEach(link => link.classList.remove('loading'));
        
        // Hide transition overlay
        const transition = document.querySelector('.page-transition.active');
        if (transition) {
            transition.classList.remove('active');
        }
        
        // Show user-friendly error message
        this.showErrorMessage();
    }

    showErrorMessage() {
        // Create temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        errorDiv.textContent = 'Navigation error. Please try again.';
        
        document.body.appendChild(errorDiv);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize enhanced navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced navigation
    window.enhancedNav = new EnhancedNavigation();
    
    // Initialize error handler
    new NavigationErrorHandler();
    
    // Add CSS animations for error messages
    const style = document.createElement('style');
    style.textContent = `
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
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Export for global access
window.EnhancedNavigation = EnhancedNavigation;
