// Enhanced 3D Chatbot JavaScript with DeepSeek API Integration

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
    setupEventListeners();
    setupMobileResponsive();
});

// Initialize chatbot functionality
function initializeChatbot() {
    const chatInput = document.getElementById('chatInput');
    const charCount = document.getElementById('charCount');
    const sendButton = document.getElementById('sendButton');
    
    // Character counter
    if (chatInput && charCount) {
        chatInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Update character count styling
            charCount.className = 'char-count';
            if (count > 4500) {
                charCount.classList.add('danger');
            } else if (count > 4000) {
                charCount.classList.add('warning');
            }
            
            // Enable/disable send button
            if (sendButton) {
                sendButton.disabled = count === 0 || count > 5000;
            }
        });
        
        // Enter key to send (Ctrl+Enter for new line)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Analysis type change
    const analysisType = document.getElementById('analysisType');
    if (analysisType) {
        analysisType.addEventListener('change', function() {
            updateAnalysisTypeUI(this.value);
        });
    }
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
}

// Enhanced send message function with DeepSeek API
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const analysisType = document.getElementById('analysisType');
    const sendButton = document.getElementById('sendButton');
    
    if (!chatInput || !chatMessages) {
        console.error('Required elements not found');
        return;
    }
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Get analysis type
    const selectedAnalysisType = analysisType ? analysisType.value : 'full';
    
    // Disable send button during processing
    if (sendButton) {
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    }
    
    // Add user message to chat
    addEnhancedUserMessage(message);
    
    // Clear input and reset character count
    chatInput.value = '';
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0';
    
    // Show professional typing indicator
    const typingIndicator = addEnhancedTypingIndicator(selectedAnalysisType);
    
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Add enhanced bot response
        addEnhancedBotResponse(data, selectedAnalysisType);
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Show error message
        addErrorMessage('I apologize, but I encountered a technical issue. Please check your connection and try again.');
        
    } finally {
        // Re-enable send button
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Analyze';
        }
    }
}

// Enhanced user message display
function addEnhancedUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message enhanced-user-message';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <span class="user-name">You</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        </div>
        <div class="message-content">
            ${formatMessageContent(message)}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    smoothScrollToBottom(chatMessages);
    
    // Add entrance animation
    setTimeout(() => {
        messageDiv.classList.add('message-entered');
    }, 100);
}

// Enhanced typing indicator with analysis progress
function addEnhancedTypingIndicator(analysisType) {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator enhanced-typing';
    
    const analysisTexts = {
        'full': 'Performing comprehensive analysis...',
        'quick': 'Running quick credibility check...',
        'source': 'Verifying source reliability...',
        'bias': 'Detecting bias patterns...'
    };
    
    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="analyst-avatar typing-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="analyst-info">
                <span class="analyst-name">Civic Lens Solutions AI Analyst</span>
                <span class="analyst-status">${analysisTexts[analysisType] || 'Analyzing content...'}</span>
            </div>
        </div>
        <div class="message-content">
            <div class="analysis-progress">
                <div class="progress-steps">
                    <div class="progress-step active">
                        <i class="fas fa-search"></i>
                        <span>Scanning</span>
                    </div>
                    <div class="progress-step">
                        <i class="fas fa-cogs"></i>
                        <span>Processing</span>
                    </div>
                    <div class="progress-step">
                        <i class="fas fa-check-circle"></i>
                        <span>Complete</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    smoothScrollToBottom(chatMessages);
    
    // Animate progress steps
    animateProgressSteps(typingDiv);
    
    return typingDiv;
}

// Enhanced bot response with comprehensive display
function addEnhancedBotResponse(data, analysisType) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message enhanced-response';
    
    // Build response HTML
    let responseHTML = `
        <div class="message-header">
            <div class="analyst-avatar response-avatar">
                <i class="fas fa-shield-check"></i>
            </div>
            <div class="analyst-info">
                <span class="analyst-name">Civic Lens Solutions AI Analyst</span>
                <span class="analyst-status">Analysis Complete • ${getAnalysisTypeLabel(analysisType)}</span>
            </div>
        </div>
    `;
    
    // Add credibility score if available
    if (data.credibility_score !== null && data.credibility_score !== undefined) {
        responseHTML += createCredibilityScoreHTML(data);
    }
    
    // Add main response content
    responseHTML += `
        <div class="message-content enhanced-content">
            ${formatMessageContent(data.response)}
        </div>
        <div class="message-footer">
            <div class="analysis-metadata">
                ${data.sources_checked ? '<span class="metadata-tag verified"><i class="fas fa-check"></i> Sources Verified</span>' : ''}
                ${data.bias_detected ? '<span class="metadata-tag bias"><i class="fas fa-balance-scale"></i> Bias Analysis</span>' : ''}
                <span class="metadata-tag timestamp"><i class="fas fa-clock"></i> ${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="response-actions">
                <button class="action-btn" onclick="copyResponse(this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="action-btn" onclick="shareResponse(this)">
                    <i class="fas fa-share"></i> Share
                </button>
                <button class="action-btn" onclick="saveResponse(this)">
                    <i class="fas fa-bookmark"></i> Save
                </button>
            </div>
        </div>
    `;
    
    messageDiv.innerHTML = responseHTML;
    chatMessages.appendChild(messageDiv);
    smoothScrollToBottom(chatMessages);
    
    // Add entrance animation
    setTimeout(() => {
        messageDiv.classList.add('message-entered');
    }, 100);
}

// Create credibility score HTML
function createCredibilityScoreHTML(data) {
    const score = data.credibility_score;
    const scoreColor = getScoreColor(score);
    const scoreLevel = getScoreLevel(score);
    
    return `
        <div class="credibility-display">
            <div class="score-section">
                <div class="score-circle" style="border-color: ${scoreColor}">
                    <span class="score-value" style="color: ${scoreColor}">${score}</span>
                    <span class="score-label">Score</span>
                </div>
                <div class="score-details">
                    <h4 class="score-level" style="color: ${scoreColor}">${scoreLevel}</h4>
                    <p class="score-description">${getScoreDescription(score)}</p>
                </div>
            </div>
            <div class="score-indicators">
                ${createScoreIndicators(data)}
            </div>
        </div>
    `;
}

// Utility functions
function getScoreColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
}

function getScoreLevel(score) {
    if (score >= 80) return 'Highly Credible';
    if (score >= 60) return 'Moderately Credible';
    if (score >= 40) return 'Low Credibility';
    return 'Not Credible';
}

function getScoreDescription(score) {
    if (score >= 80) return 'This content shows strong credibility indicators with reliable sources and factual accuracy.';
    if (score >= 60) return 'This content has moderate credibility but may benefit from additional verification.';
    if (score >= 40) return 'This content shows credibility concerns and should be cross-referenced with other sources.';
    return 'This content shows significant credibility issues and should be treated with caution.';
}

function getAnalysisTypeLabel(type) {
    const labels = {
        'full': 'Comprehensive Analysis',
        'quick': 'Quick Assessment',
        'source': 'Source Verification',
        'bias': 'Bias Detection'
    };
    return labels[type] || 'Analysis';
}

function createScoreIndicators(data) {
    let indicators = '';
    
    if (data.sources_checked) {
        indicators += '<div class="indicator verified"><i class="fas fa-check-circle"></i> Sources Verified</div>';
    }
    
    if (data.bias_detected) {
        indicators += '<div class="indicator bias"><i class="fas fa-exclamation-triangle"></i> Bias Detected</div>';
    }
    
    if (data.analysis_type === 'full') {
        indicators += '<div class="indicator comprehensive"><i class="fas fa-microscope"></i> Comprehensive Review</div>';
    }
    
    return indicators;
}

// Format message content with proper HTML
function formatMessageContent(content) {
    if (!content) return '';
    
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

// Error message display
function addErrorMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message error-message';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="analyst-avatar error-avatar">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="analyst-info">
                <span class="analyst-name">System Notice</span>
                <span class="analyst-status">Error Occurred</span>
            </div>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    smoothScrollToBottom(chatMessages);
}

// Animation functions
function animateProgressSteps(typingDiv) {
    const steps = typingDiv.querySelectorAll('.progress-step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 800);
}

function smoothScrollToBottom(element) {
    element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
    });
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
}

// Quick action functions
function quickAction(action) {
    const chatInput = document.getElementById('chatInput');
    const analysisType = document.getElementById('analysisType');
    
    const quickPrompts = {
        'fact-check': 'Please fact-check this information: ',
        'source-check': 'Please verify the credibility of this source: ',
        'bias-analysis': 'Please analyze this content for bias: ',
        'credibility-score': 'Please provide a credibility score for: '
    };
    
    if (chatInput && quickPrompts[action]) {
        chatInput.value = quickPrompts[action];
        chatInput.focus();
        
        // Set appropriate analysis type
        if (analysisType) {
            const typeMap = {
                'fact-check': 'full',
                'source-check': 'source',
                'bias-analysis': 'bias',
                'credibility-score': 'quick'
            };
            analysisType.value = typeMap[action] || 'full';
            updateAnalysisTypeUI(analysisType.value);
        }
    }
}

// Session management functions
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // Keep welcome message, remove others
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        chatMessages.innerHTML = '';
        if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage);
        }
    }
}

function newSession() {
    clearChat();
    // Reset analysis type to default
    const analysisType = document.getElementById('analysisType');
    if (analysisType) {
        analysisType.value = 'full';
        updateAnalysisTypeUI('full');
    }
}

function exportChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = Array.from(chatMessages.querySelectorAll('.message:not(.welcome-message)'));
    let exportText = 'Civic Lens Solutions AI Analysis Session\n';
    exportText += '================================\n\n';
    
    messages.forEach(message => {
        const isUser = message.classList.contains('user-message');
        const content = message.querySelector('.message-content').textContent.trim();
        const time = message.querySelector('.message-time, .analyst-status')?.textContent || '';
        
        exportText += `${isUser ? 'User' : 'AI Analyst'} [${time}]:\n${content}\n\n`;
    });
    
    // Download as text file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-lens-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Response action functions
function copyResponse(button) {
    const messageContent = button.closest('.message').querySelector('.message-content').textContent;
    navigator.clipboard.writeText(messageContent).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

function shareResponse(button) {
    const messageContent = button.closest('.message').querySelector('.message-content').textContent;
    if (navigator.share) {
        navigator.share({
            title: 'Civic Lens Solutions AI Analysis',
            text: messageContent,
            url: window.location.href
        });
    } else {
        copyResponse(button);
    }
}

function saveResponse(button) {
    // Implement save functionality (could save to local storage or send to backend)
    button.innerHTML = '<i class="fas fa-check"></i> Saved';
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-bookmark"></i> Save';
    }, 2000);
}

// UI update functions
function updateAnalysisTypeUI(type) {
    // Update UI based on selected analysis type
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        const placeholders = {
            'full': 'Paste a news article or URL for comprehensive credibility analysis...',
            'quick': 'Enter text for quick credibility assessment...',
            'source': 'Enter a news source or publication name to verify...',
            'bias': 'Paste content to analyze for political or editorial bias...'
        };
        chatInput.placeholder = placeholders[type] || placeholders['full'];
    }
}

// Mobile responsive functions
function setupMobileResponsive() {
    // Handle mobile menu
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileToggle.querySelector('i').classList.toggle('fa-bars');
            mobileToggle.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                smoothScrollToBottom(chatMessages);
            }
        }, 100);
    });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle i');
    
    if (navLinks) {
        navLinks.classList.toggle('mobile-open');
    }
    
    if (mobileToggle) {
        mobileToggle.classList.toggle('fa-bars');
        mobileToggle.classList.toggle('fa-times');
    }
}
