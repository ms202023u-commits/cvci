// Enhanced Multi-Chatbot JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedChatbots();
});

function initializeEnhancedChatbots() {
    // Initialize chatbot switching
    const chatbotOptions = document.querySelectorAll('.chatbot-option');
    const chatbotContainers = document.querySelectorAll('.chatbot-container');
    
    chatbotOptions.forEach(option => {
        option.addEventListener('click', function() {
            const chatbotType = this.dataset.chatbot;
            switchChatbot(chatbotType);
        });
    });
    
    // Initialize send buttons
    document.getElementById('comprehensiveSendButton').addEventListener('click', function() {
        sendMessage('comprehensive');
    });
    
    document.getElementById('quickSendButton').addEventListener('click', function() {
        sendMessage('quick');
    });
    
    // Initialize enter key support
    document.getElementById('comprehensiveInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage('comprehensive');
        }
    });
    
    document.getElementById('quickInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage('quick');
        }
    });
    
    // Add floating animation to shapes
    animateFloatingShapes();
}

function switchChatbot(chatbotType) {
    // Update option selection
    document.querySelectorAll('.chatbot-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-chatbot="${chatbotType}"]`).classList.add('active');
    
    // Switch chatbot containers
    document.querySelectorAll('.chatbot-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`${chatbotType}-chatbot`).classList.add('active');
    
    // Add switch animation
    const activeContainer = document.getElementById(`${chatbotType}-chatbot`);
    activeContainer.style.animation = 'none';
    setTimeout(() => {
        activeContainer.style.animation = 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
}

function sendMessage(chatbotType) {
    const inputId = `${chatbotType}Input`;
    const messagesId = `${chatbotType}Messages`;
    const input = document.getElementById(inputId);
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message, messagesId);
        input.value = '';
        
        // Show typing indicator
        showTypingIndicator(messagesId, chatbotType);
        
        // Simulate API call delay
        setTimeout(() => {
            hideTypingIndicator(messagesId);
            addBotResponse(message, messagesId, chatbotType);
        }, getResponseDelay(chatbotType));
    }
}

function addUserMessage(message, messagesId) {
    const chatMessages = document.getElementById(messagesId);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${escapeHtml(message)}</div>
        </div>
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom(chatMessages);
}

function addBotResponse(userMessage, messagesId, chatbotType) {
    const chatMessages = document.getElementById(messagesId);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    const response = getEnhancedResponse(userMessage, chatbotType);
    const icon = chatbotType === 'comprehensive' ? 'fas fa-microscope' : 'fas fa-bolt';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${icon}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${response.text}</div>
            ${response.score ? createCredibilityScore(response.score, chatbotType) : ''}
            ${response.actions ? createMessageActions(response.actions, chatbotType) : ''}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom(chatMessages);
    
    // Animate score bar if present
    setTimeout(() => {
        const scoreFill = messageDiv.querySelector('.score-fill');
        if (scoreFill) {
            scoreFill.style.width = response.score + '%';
        }
    }, 500);
}

function getEnhancedResponse(message, chatbotType) {
    const lowerMessage = message.toLowerCase();
    
    if (chatbotType === 'comprehensive') {
        return getComprehensiveResponse(lowerMessage, message);
    } else {
        return getQuickResponse(lowerMessage, message);
    }
}

function getComprehensiveResponse(lowerMessage, originalMessage) {
    const responses = {
        'full analysis': {
            text: `<h4>🔬 Comprehensive Analysis Complete</h4>
                   <p><strong>Article Assessment:</strong> This is a detailed demo analysis of your content.</p>
                   <ul>
                       <li><strong>Source Credibility:</strong> Publisher verification shows established media outlet with good track record</li>
                       <li><strong>Content Analysis:</strong> Factual claims cross-referenced with multiple reliable sources</li>
                       <li><strong>Bias Detection:</strong> Slight left-leaning perspective detected, but within acceptable journalistic standards</li>
                       <li><strong>Language Analysis:</strong> Professional tone with minimal emotional language</li>
                       <li><strong>Fact Verification:</strong> Key claims verified against primary sources and databases</li>
                   </ul>
                   <p><strong>Recommendation:</strong> This article appears to be from a credible source with good factual accuracy. Consider cross-referencing with additional sources for complete verification.</p>`,
            score: Math.floor(Math.random() * 20) + 75, // 75-95%
            actions: [
                { text: 'View Source Details', icon: 'fas fa-external-link-alt' },
                { text: 'Check Similar Articles', icon: 'fas fa-search' },
                { text: 'Export Analysis', icon: 'fas fa-download' }
            ]
        },
        'source verification': {
            text: `<h4>🛡️ Source Verification Report</h4>
                   <p><strong>Publisher Analysis:</strong></p>
                   <ul>
                       <li><strong>Domain Authority:</strong> High (85/100)</li>
                       <li><strong>Publication History:</strong> Established 15+ years</li>
                       <li><strong>Editorial Standards:</strong> Professional editorial board</li>
                       <li><strong>Fact-Checking:</strong> Internal fact-checking team</li>
                       <li><strong>Bias Rating:</strong> Center-left, factual reporting</li>
                   </ul>
                   <p><strong>Verification Status:</strong> ✅ Verified credible source</p>`,
            score: Math.floor(Math.random() * 15) + 80, // 80-95%
        },
        'bias detection': {
            text: `<h4>⚖️ Bias Analysis Report</h4>
                   <p><strong>Political Bias Assessment:</strong></p>
                   <ul>
                       <li><strong>Overall Lean:</strong> Slightly left of center</li>
                       <li><strong>Emotional Language:</strong> Minimal use detected</li>
                       <li><strong>Source Selection:</strong> Balanced expert quotes</li>
                       <li><strong>Framing Analysis:</strong> Neutral presentation of facts</li>
                       <li><strong>Opinion vs Fact:</strong> Clear separation maintained</li>
                   </ul>
                   <p><strong>Bias Score:</strong> Low bias detected - within acceptable journalistic standards</p>`,
            score: Math.floor(Math.random() * 10) + 85, // 85-95%
        }
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key.replace(' ', ''))) {
            return response;
        }
    }
    
    return {
        text: `<h4>🔬 Comprehensive Analysis</h4>
               <p>Thank you for your query: "<em>${escapeHtml(originalMessage)}</em>"</p>
               <p>In the full version powered by DeepSeek AI, I would provide:</p>
               <ul>
                   <li><strong>Complete credibility assessment</strong> with detailed scoring methodology</li>
                   <li><strong>Source verification</strong> including publisher background and reputation analysis</li>
                   <li><strong>Comprehensive bias detection</strong> with political lean and emotional language analysis</li>
                   <li><strong>Fact-checking</strong> with cross-reference to multiple reliable databases</li>
                   <li><strong>Context analysis</strong> comparing with historical reporting patterns</li>
               </ul>
               <p><strong>Demo Note:</strong> This is a demonstration. For real-time AI analysis, run locally with DeepSeek API integration.</p>`,
        score: Math.floor(Math.random() * 30) + 65, // 65-95%
    };
}

function getQuickResponse(lowerMessage, originalMessage) {
    const responses = {
        'quick': {
            text: `<h4>⚡ Quick Check Complete!</h4>
                   <p><strong>Instant Assessment:</strong></p>
                   <ul>
                       <li>✅ <strong>Source:</strong> Recognized publisher</li>
                       <li>✅ <strong>Facts:</strong> Claims appear verifiable</li>
                       <li>⚠️ <strong>Bias:</strong> Slight lean detected</li>
                       <li>✅ <strong>Language:</strong> Professional tone</li>
                   </ul>
                   <p><strong>Quick Verdict:</strong> Generally reliable with minor bias considerations.</p>`,
            score: Math.floor(Math.random() * 20) + 75, // 75-95%
        },
        'fast': {
            text: `<h4>🚀 Fast Verification Done!</h4>
                   <p><strong>Rapid Analysis Results:</strong></p>
                   <ul>
                       <li>📊 <strong>Credibility Score:</strong> Above average</li>
                       <li>🔍 <strong>Key Indicators:</strong> Positive signals detected</li>
                       <li>⚡ <strong>Red Flags:</strong> None identified</li>
                   </ul>`,
            score: Math.floor(Math.random() * 25) + 70, // 70-95%
        },
        'instant': {
            text: `<h4>⚡ Instant Analysis</h4>
                   <p><strong>Lightning-fast check complete!</strong></p>
                   <ul>
                       <li>🎯 <strong>Reliability:</strong> Good</li>
                       <li>📈 <strong>Trust Score:</strong> High</li>
                       <li>🔒 <strong>Safety:</strong> No concerns</li>
                   </ul>`,
            score: Math.floor(Math.random() * 20) + 75, // 75-95%
        }
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return {
        text: `<h4>⚡ Quick Check Results</h4>
               <p>Analyzed: "<em>${escapeHtml(originalMessage)}</em>"</p>
               <p><strong>Instant Assessment:</strong></p>
               <ul>
                   <li>📊 <strong>Credibility:</strong> Preliminary analysis shows good indicators</li>
                   <li>🔍 <strong>Quick Scan:</strong> No immediate red flags detected</li>
                   <li>⚡ <strong>Speed Check:</strong> Basic verification passed</li>
               </ul>
               <p><strong>Note:</strong> This is a demo quick check. Full DeepSeek AI integration provides real-time instant analysis with detailed scoring.</p>`,
        score: Math.floor(Math.random() * 30) + 65, // 65-95%
    };
}

function createCredibilityScore(score, chatbotType) {
    const color = score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336';
    const label = chatbotType === 'comprehensive' ? 'Comprehensive Credibility Score' : 'Quick Credibility Score';
    
    return `
        <div class="credibility-score">
            <div class="score-label">${label}</div>
            <div class="score-bar">
                <div class="score-fill" style="width: 0%; background: ${color};"></div>
            </div>
            <div class="score-value" style="color: ${color};">${score}%</div>
        </div>
    `;
}

function createMessageActions(actions, chatbotType) {
    const actionClass = chatbotType === 'quick' ? 'action-btn quick' : 'action-btn';
    return `
        <div class="message-actions">
            ${actions.map(action => `
                <button class="${actionClass}" onclick="handleActionClick('${action.text}')">
                    <i class="${action.icon}"></i> ${action.text}
                </button>
            `).join('')}
        </div>
    `;
}

function showTypingIndicator(messagesId, chatbotType) {
    const chatMessages = document.getElementById(messagesId);
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const icon = chatbotType === 'comprehensive' ? 'fas fa-microscope' : 'fas fa-bolt';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${icon}"></i>
        </div>
        <div class="message-content">
            <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom(chatMessages);
}

function hideTypingIndicator(messagesId) {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function getResponseDelay(chatbotType) {
    // Comprehensive analysis takes longer
    return chatbotType === 'comprehensive' ? 2000 + Math.random() * 1000 : 800 + Math.random() * 500;
}

function insertSampleQuery(chatbotType, query) {
    const inputId = `${chatbotType}Input`;
    const input = document.getElementById(inputId);
    input.value = query;
    input.focus();
}

function clearChat(chatbotType) {
    const messagesId = `${chatbotType}Messages`;
    const chatMessages = document.getElementById(messagesId);
    
    // Keep only the welcome message (first message)
    const messages = chatMessages.querySelectorAll('.message');
    for (let i = 1; i < messages.length; i++) {
        messages[i].remove();
    }
}

function exportChat(chatbotType) {
    const messagesId = `${chatbotType}Messages`;
    const chatMessages = document.getElementById(messagesId);
    const messages = chatMessages.querySelectorAll('.message');
    
    let exportText = `Civic Lens Solutions - ${chatbotType.charAt(0).toUpperCase() + chatbotType.slice(1)} Chat Export\n`;
    exportText += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    messages.forEach((message, index) => {
        const isBot = message.classList.contains('bot-message');
        const messageText = message.querySelector('.message-text').textContent;
        exportText += `${isBot ? 'AI Assistant' : 'User'}: ${messageText}\n\n`;
    });
    
    // Create and download file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-lens-${chatbotType}-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleActionClick(actionText) {
    // Handle action button clicks
    console.log('Action clicked:', actionText);
    // You can implement specific actions here
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function animateFloatingShapes() {
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    shapes.forEach((shape, index) => {
        const duration = 10 + Math.random() * 10; // 10-20 seconds
        const delay = index * 2; // Stagger animations
        
        shape.style.animation = `float ${duration}s ${delay}s infinite linear`;
    });
}

// Add CSS for typing animation
const typingCSS = `
.typing-indicator .message-content {
    padding: 15px 20px;
}

.typing-animation {
    display: flex;
    gap: 4px;
    align-items: center;
}

.typing-animation span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(1) { animation-delay: 0s; }
.typing-animation span:nth-child(2) { animation-delay: 0.2s; }
.typing-animation span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

@keyframes float {
    0% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.7;
    }
    33% {
        transform: translateY(-20px) rotate(120deg);
        opacity: 0.4;
    }
    66% {
        transform: translateY(10px) rotate(240deg);
        opacity: 0.8;
    }
    100% {
        transform: translateY(0px) rotate(360deg);
        opacity: 0.7;
    }
}
`;

// Inject typing CSS
const style = document.createElement('style');
style.textContent = typingCSS;
document.head.appendChild(style);
