let currentChatIndex = 0;
let chatsData = [
    {
        title: "Quantum Computing Analysis",
        messages: [
            { sender: 'ai', text: "Hello Alex! I am your autonomous AI agent. I can write code, analyze data, browse simulated web sources, and solve complex problems. What can we tackle today?" },
            { sender: 'user', text: "Explain Quantum Entanglement in simple terms" },
            { sender: 'ai', text: "Quantum entanglement is a phenomenon where two particles become interconnected in such a way that the physical state of one instantly dictates the state of the other, no matter how far apart they are—even light-years across the universe. Einstein famously called it 'spooky action at a distance'." }
        ]
    },
    {
        title: "Python Code Refactoring",
        messages: [
            { sender: 'ai', text: "Ready to review and refactor your Python codebase. What script are we optimizing?" },
            { sender: 'user', text: "Write a Python script for web scraping with BeautifulSoup" },
            { sender: 'ai', text: "Here is a clean, robust web scraper template using `requests` and `BeautifulSoup`:\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\n\nurl = 'https://news.ycombinator.com/'\nresponse = requests.get(url)\n\nif response.status_code == 200:\n    soup = BeautifulSoup(response.text, 'html.parser')\n    titles = soup.find_all('span', class_='titleline')\n    \n    for idx, title in enumerate(titles[:5], 1):\n        print(f\"{idx}. {title.text}\")\nelse:\n    print('Failed to fetch webpage')\n```" }
        ]
    },
    {
        title: "Market Trend Strategy",
        messages: [
            { sender: 'ai', text: "Financial and market strategist mode active. How can I assist your portfolio or startup today?" },
            { sender: 'user', text: "Give me 3 startup ideas combining AI and renewable energy" },
            { sender: 'ai', text: "Here are 3 high-potential AI + Renewable Energy startup concepts:\n\n1. **Predictive Solar/Wind Microgrid Optimizer**: AI agents that dynamically shift battery storage based on real-time weather forecasting.\n2. **AI Carbon Credit Verification Agent**: Automated IoT & satellite imagery audit tool for verified carbon offsetting.\n3. **Smart EV Fleet V2G (Vehicle-to-Grid) Dispatcher**: Optimizing when electric vehicles charge and discharge back into the grid using reinforcement learning." }
        ]
    }
];

let webSearchActive = false;

// Initialize chat on load
document.addEventListener('DOMContentLoaded', () => {
    renderChatList();
    loadChat(0);
});

// Auto-resize textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

// Send Message Logic
function handleSendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    addMessageToCurrentChat('user', text);
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator & simulate agent response
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        generateAgentResponse(text);
    }, 1200);
}

function sendQuickPrompt(promptText) {
    document.getElementById('userInput').value = promptText;
    handleSendMessage();
}

function addMessageToCurrentChat(sender, text) {
    chatsData[currentChatIndex].messages.push({ sender, text });
    renderMessages();
}

// Render Messages in Chat Container
function renderMessages() {
    const container = document.getElementById('chatMessages');
    const currentMessages = chatsData[currentChatIndex].messages;

    container.innerHTML = currentMessages.map(msg => {
        if (msg.sender === 'user') {
            return `
                <div class="message user-message">
                    <div class="avatar user-avatar"><i class="fas fa-user"></i></div>
                    <div class="message-content">
                        <div class="message-sender">You</div>
                        <div class="bubble">${escapeHtml(msg.text)}</div>
                    </div>
                </div>
            `;
        } else {
            // Render markdown or formatted code blocks
            const formattedText = marked.parse(msg.text);
            return `
                <div class="message ai-message">
                    <div class="avatar ai-avatar"><i class="fas fa-brain"></i></div>
                    <div class="message-content">
                        <div class="message-sender">OmniMind Agent</div>
                        <div class="bubble">${formattedText}</div>
                    </div>
                </div>
            `;
        }
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// Typing Indicator
function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = `
        <div class="avatar ai-avatar"><i class="fas fa-brain"></i></div>
        <div class="message-content">
            <div class="message-sender">OmniMind Agent (Thinking...)</div>
            <div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// Simulate Intelligent AI Agent Responses based on Persona & Query
function generateAgentResponse(query) {
    const persona = document.getElementById('agentPersona').value;
    let response = "";

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('code') || lowerQuery.includes('python') || lowerQuery.includes('script') || persona === 'coder') {
        response = `Here is the engineered solution for your request:\n\n```python\n# OmniMind Agent Auto-Generated Code\ndef process_agent_task(payload):\n    print(f\"Executing payload with {len(payload)} items...\")\n    results = [x ** 2 for x in payload if x % 2 == 0]\n    return results\n\nif __name__ == '__main__':\n    data = [1, 2, 3, 4, 5, 6]\n    print(\"Result:\", process_agent_task(data))\n```\nLet me know if you want me to write automated unit tests for this function!`;
    } else if (lowerQuery.includes('market') || lowerQuery.includes('trend') || lowerQuery.includes('startup') || persona === 'analyst') {
        response = `Based on current macro-economic indicators and simulated web intelligence${webSearchActive ? ' (Web Search Enabled)' : ''}:\n\n- **Growth Rate**: Projected at 18.4% CAGR over the next 4 quarters.\n- **Risk Factor**: Supply chain latency in semiconductor components.\n- **Strategic Recommendation**: Allocate 65% capital into high-liquidity assets while hedging with green-tech derivatives.`;
    } else if (lowerQuery.includes('write') || lowerQuery.includes('story') || lowerQuery.includes('copy') || persona === 'creative') {
        response = `*The digital skyline pulsed with bioluminescent neon as the autonomous agent compiled its final directive. Across the network, millions of minds synchronized into a single, harmonic awakening...*\n\nHow is this narrative direction? I can expand the chapter or refine the tone further.`;
    } else {
        response = `I have analyzed your query regarding "**${query}**". \n\nAs your autonomous AI agent, I've cross-referenced multiple verified knowledge bases. The primary insight is that systematic execution combined with real-time feedback loops yields optimal results. Would you like me to generate a detailed step-by-step blueprint?`;
    }

    addMessageToCurrentChat('ai', response);
}

// Sidebar & Chat Management
function renderChatList() {
    const list = document.getElementById('chatHistoryList');
    list.innerHTML = chatsData.map((chat, idx) => `
        <div class="chat-history-item ${idx === currentChatIndex ? 'active' : ''}" onclick="loadChat(${idx})">
            <i class="far fa-message"></i>
            <span>${chat.title}</span>
        </div>
    `).join('');
}

function loadChat(index) {
    currentChatIndex = index;
    renderChatList();
    renderMessages();
}

function startNewChat() {
    const newChat = {
        title: `New Session #${chatsData.length + 1}`,
        messages: [
            { sender: 'ai', text: "New agent session initialized. What task shall we execute?" }
        ]
    };
    chatsData.unshift(newChat);
    currentChatIndex = 0;
    renderChatList();
    renderMessages();
    showToast('New agent chat created');
}

function clearCurrentChat() {
    chatsData[currentChatIndex].messages = [
        { sender: 'ai', text: "Chat cleared. Ready for new instructions." }
    ];
    renderMessages();
    showToast('Current chat cleared');
}

// Persona & Tools
function changePersona() {
    const persona = document.getElementById('agentPersona').value;
    const titles = {
        general: "Omni General Assistant",
        coder: "Senior Software Architect Agent",
        analyst: "Data & Financial Analyst Agent",
        creative: "Creative Writer & Copywriter Agent"
    };
    document.getElementById('currentAgentTitle').textContent = titles[persona];
    showToast(`Switched agent persona to ${titles[persona]}`);
}

function toggleWebSearch() {
    webSearchActive = !webSearchActive;
    const btn = document.getElementById('webSearchToggle');
    btn.classList.toggle('active', webSearchActive);
    showToast(webSearchActive ? 'Web Search Grounding Enabled' : 'Web Search Disabled');
}

function triggerFileUpload() {
    showToast('File upload simulator: Select documents to feed into agent context.');
}

// Theme & Settings
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.removeAttribute('data-theme');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        showToast('Light mode activated');
    } else {
        html.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        showToast('Dark mode activated');
    }
}

function saveSettings() {
    closeModal('settingsModal');
    showToast('Agent configuration saved successfully!');
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(>"/g, "&gt;");
}
