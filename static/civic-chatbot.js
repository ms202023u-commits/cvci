// Civic Chatbot - Unified JavaScript

class CivicChatbot {
    constructor() {
        this.currentAnalysisType = 'comprehensive';
        this.isTyping = false;
        this.messageHistory = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateWelcomeTime();
        this.updateAnalystInfo();
    }

    initializeElements() {
        this.messagesArea = document.getElementById('messagesArea');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.currentAnalyst = document.getElementById('currentAnalyst');
        this.analystDescription = document.getElementById('analystDescription');
        this.analysisBadge = document.getElementById('analysisBadge');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.analysisOptions = document.querySelectorAll('.analysis-option');
        this.quickActions = document.querySelectorAll('.quick-action');
    }

    setupEventListeners() {
        // Send button and enter key
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Analysis type selection
        this.analysisOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectAnalysisType(option.dataset.type);
            });
        });

        // Quick actions
        this.quickActions.forEach(action => {
            action.addEventListener('click', () => {
                this.messageInput.value = action.dataset.text;
                this.messageInput.focus();
            });
        });

        // Control buttons
        this.exportBtn.addEventListener('click', () => this.exportChat());
        this.clearBtn.addEventListener('click', () => this.clearChat());

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
    }

    selectAnalysisType(type) {
        this.currentAnalysisType = type;
        
        // Update active state
        this.analysisOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.type === type) {
                option.classList.add('active');
            }
        });

        this.updateAnalystInfo();
    }

    updateAnalystInfo() {
        const analysisTypes = {
            comprehensive: {
                name: 'Comprehensive Analyst',
                description: 'Deep analysis mode active',
                badge: 'Comprehensive Analysis Mode',
                icon: 'fas fa-microscope'
            },
            quick: {
                name: 'Quick Check Analyst',
                description: 'Fast assessment mode active',
                badge: 'Quick Check Mode',
                icon: 'fas fa-bolt'
            },
            bias: {
                name: 'Bias Detection Analyst',
                description: 'Bias analysis mode active',
                badge: 'Bias Detection Mode',
                icon: 'fas fa-balance-scale'
            }
        };

        const current = analysisTypes[this.currentAnalysisType];
        this.currentAnalyst.textContent = current.name;
        this.analystDescription.textContent = current.description;
        
        // Update badge
        const badgeIcon = this.analysisBadge.querySelector('i');
        const badgeText = this.analysisBadge.querySelector('span');
        badgeIcon.className = current.icon;
        badgeText.textContent = current.badge;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to backend
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    analysis_type: this.currentAnalysisType
                })
            });

            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                // Add AI response
                this.addMessage(data.response, 'ai', {
                    credibilityScore: data.credibility_score,
                    analysisType: data.analysis_type,
                    sourcesChecked: data.sources_checked,
                    biasDetected: data.bias_detected
                });
            } else {
                this.addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'ai');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I\'m having trouble connecting right now. Please check your connection and try again.', 'ai');
        }
    }

    addMessage(text, sender, metadata = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        if (sender === 'user') {
            messageDiv.classList.add('user-message');
        }

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let metadataHtml = '';
        if (metadata && sender === 'ai') {
            metadataHtml = `
                <div class="message-metadata">
                    <div class="metadata-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Credibility: ${metadata.credibilityScore}/100</span>
                    </div>
                    <div class="metadata-item">
                        <i class="fas fa-cog"></i>
                        <span>Mode: ${metadata.analysisType}</span>
                    </div>
                    ${metadata.sourcesChecked ? '<div class="metadata-item"><i class="fas fa-check-circle"></i><span>Sources Verified</span></div>' : ''}
                    ${metadata.biasDetected ? '<div class="metadata-item"><i class="fas fa-exclamation-triangle"></i><span>Bias Detected</span></div>' : ''}
                </div>
            `;
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">${sender === 'user' ? 'You' : 'Civic Chatbot'}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${text}</div>
                ${metadataHtml}
            </div>
        `;

        this.messagesArea.appendChild(messageDiv);
        this.scrollToBottom();

        // Store in history
        this.messageHistory.push({
            text,
            sender,
            time,
            metadata,
            analysisType: this.currentAnalysisType
        });
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.sendBtn.disabled = true;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.sendBtn.disabled = false;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
        }, 100);
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    }

    updateWelcomeTime() {
        const welcomeTimeElement = document.getElementById('welcomeTime');
        if (welcomeTimeElement) {
            const now = new Date();
            welcomeTimeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    exportChat() {
        if (this.messageHistory.length === 0) {
            alert('No messages to export!');
            return;
        }

        const chatData = {
            timestamp: new Date().toISOString(),
            analysisType: this.currentAnalysisType,
            messages: this.messageHistory
        };

        const dataStr = JSON.stringify(chatData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `civic-chatbot-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    clearChat() {
        if (this.messageHistory.length === 0) {
            return;
        }

        if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
            // Clear messages except welcome message
            const welcomeMessage = this.messagesArea.querySelector('.welcome-message');
            this.messagesArea.innerHTML = '';
            if (welcomeMessage) {
                this.messagesArea.appendChild(welcomeMessage);
            }
            
            this.messageHistory = [];
            this.updateWelcomeTime();
        }
    }
}

// Enhanced CSS for metadata
const metadataCSS = `
<style>
.message-metadata {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.metadata-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    font-size: 0.8rem;
    color: var(--text-muted) !important;
}

.metadata-item i {
    font-size: 0.75rem;
    color: #78dbff !important;
}

@media (max-width: 768px) {
    .message-metadata {
        gap: 10px;
    }
    
    .metadata-item {
        font-size: 0.75rem;
        padding: 4px 10px;
    }
}
</style>
`;

// Add metadata CSS to head
document.head.insertAdjacentHTML('beforeend', metadataCSS);

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.civicChatbot = new CivicChatbot();
});
