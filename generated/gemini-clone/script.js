// Gemini Frontend Interactive Logic

// State variables
let currentModel = "Gemini 1.5 Pro";
let isWebSearchActive = false;
let currentAttachment = null;
let chatHistory = [
    { id: 1, title: "Tokyo 3-Day Itinerary Plan", active: false },
    { id: 2, title: "Python Quicksort Implementation", active: false },
    { id: 3, title: "Quantum Computing Explained", active: false }
];
let activeChatId = null;

// Simulated intelligent responses based on keywords
const knowledgeBase = [
    {
        keywords: ["tokyo", "itinerary", "travel", "trip"],
        response: `Here is a fantastic 3-day itinerary for Tokyo combining futuristic tech and rich culture:

**Day 1: Electric Akihabara & Historic Asakusa**
- **Morning:** Visit **Senso-ji Temple** in Asakusa, Tokyo's oldest and most vibrant Buddhist temple. Walk down Nakamise-dori for traditional snacks.
- **Afternoon:** Head to **Akihabara**, the anime and electronics capital. Explore multi-level arcades like SEGA and retro game stores like Super Potato.
- **Evening:** Enjoy a steaming bowl of Ichiran Ramen with automated ordering.

**Day 2: Modern Art & Shibuya Crossing**
- **Morning:** Experience **teamLab Planets TOYOSU**, an immersive digital art museum where you walk through water and crystal universes.
- **Afternoon:** Visit **Shibuya Crossing**, the world's busiest pedestrian intersection. Drop by Shibuya Sky for a panoramic 360° view of Tokyo from 229 meters high.
- **Evening:** Dine in the cozy alleys of **Omoide Yokocho** near Shinjuku station for yakitori.

**Day 3: Nature & Harajuku Culture**
- **Morning:** Stroll through the serene forested grounds of **Meiji Jingu Shrine**.
- **Afternoon:** Shop along **Takeshita Street** in Harajuku for quirky fashion and crepes, then walk down upscale Omotesando avenue.
- **Evening:** Dinner at a conveyor-belt sushi spot in Ginza.`
    },
    {
        keywords: ["python", "quicksort", "code", "sort", "function"],
        response: `Here is an efficient and clean implementation of the **Quicksort algorithm** in Python, complete with type hints and comments:

\`\`\`python
def quicksort(arr: list[int]) -> list[int]:
    """
    Sorts a list of integers in ascending order using the Quicksort algorithm.
    Time Complexity: O(n log n) average, O(n^2) worst case.
    Space Complexity: O(n log n) for recursion stack.
    """
    if len(arr) <= 1:
        return arr
    
    # Choose the middle element as the pivot
    pivot = arr[len(arr) // 2]
    
    # Partition elements into three groups
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    # Recursively sort sub-arrays and combine
    return quicksort(left) + middle + quicksort(right)

# Example usage:
if __name__ == "__main__":
    numbers = [36, 12, 85, 42, 9, 53, 27]
    sorted_numbers = quicksort(numbers)
    print("Original:", numbers)
    print("Sorted:", sorted_numbers)
\`\`\`

### How it works:
1. **Pivot Selection:** We pick a pivot element (here, the middle element).
2. **Partitioning:** Items smaller than the pivot go to \`left\`, equal items to \`middle\`, and larger items to \`right\`.
3. **Recursion:** We apply the same logic to the left and right partitions until base cases of length 0 or 1 are reached.`
    },
    {
        keywords: ["quantum", "computing", "qubit", "computer"],
        response: `### Understanding Quantum Computing

Imagine a normal computer bit as a coin sitting on a table: it can either be **Heads (1)** or **Tails (0)**. 

A **quantum bit (qubit)**, however, is like a coin *spinning* in the air. While it's spinning, it has a probability of being both Heads and Tails at the same time. This fundamental quantum property is called **superposition**.

#### Key Concepts:
1. **Superposition:** Allows qubits to represent numerous combinations simultaneously, enabling massive parallel processing power.
2. **Entanglement:** Qubits can become interconnected such that the state of one instantly influences another, regardless of distance. Albert Einstein famously called this "spooky action at a distance."
3. **Interference:** Used to cancel out wrong answers and amplify correct pathways during quantum calculations.

#### Real-World Applications:
- **Drug Discovery:** Simulating molecular interactions at an atomic level in minutes instead of decades.
- **Cryptography:** Developing ultra-secure encryption algorithms and breaking legacy RSA encryption.
- **Optimization:** Solving complex logistics, supply chain, and financial modeling problems instantly.`
    },
    {
        keywords: ["recipe", "dinner", "chicken", "garlic", "spinach", "food", "cook"],
        response: `Here are **5 creative dinner recipe ideas** using chicken, garlic, and spinach:

1. **Creamy Tuscan Garlic Chicken Skillet**
   - *Description:* Seared chicken breasts in a rich sauce of heavy cream, sundried tomatoes, minced garlic, and fresh baby spinach. Serve with crusty bread or pasta.

2. **Garlic-Herb Stuffed Chicken Breast**
   - *Description:* Butterfly chicken breasts and stuff them with a mixture of sautéed garlic, wilted spinach, cream cheese, and parmesan. Bake until golden and juicy.

3. **One-Pot Chicken & Spinach Orzo**
   - *Description:* Sauté chicken chunks with lots of minced garlic, toast orzo pasta in chicken broth, and stir in fresh spinach at the end until wilted. Top with lemon zest and parmesan.

4. **Asian Garlic-Ginger Chicken & Spinach Stir-Fry**
   - *Description:* Tender strips of chicken stir-fried with scallions, heavy garlic, fresh ginger, soy sauce, and sesame oil, tossed with baby spinach until just tender. Serve over jasmine rice.

5. **Cheesy Chicken, Garlic & Spinach Meatballs**
   - *Description:* Ground chicken mixed with finely chopped spinach, minced garlic, breadcrumbs, and herbs, baked and served over zucchini noodles or marinara pasta.`
    }
];

// DOM Element References
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const modelSelectorBtn = document.getElementById('model-selector-btn');
const modelDropdown = document.getElementById('model-dropdown');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const chatStream = document.getElementById('chat-stream');
const typingIndicator = document.getElementById('typing-indicator');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistoryList = document.getElementById('chat-history-list');
const searchToggle = document.getElementById('search-toggle');
const searchBadge = document.getElementById('search-badge');
const attachmentPreview = document.getElementById('attachment-preview');
const attachmentName = document.getElementById('attachment-name');
const attachmentIcon = document.getElementById('attachment-icon');

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    renderChatHistory();
    setupEventListeners();
});

function setupEventListeners() {
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight > 160 ? 160 : this.scrollHeight) + 'px';
        
        if (this.value.trim().length > 0 || currentAttachment) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('bg-gemini-surfaceHover', 'text-gemini-muted', 'cursor-not-allowed');
            sendBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-500', 'shadow-md');
        } else {
            sendBtn.disabled = true;
            sendBtn.classList.add('bg-gemini-surfaceHover', 'text-gemini-muted', 'cursor-not-allowed');
            sendBtn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-500', 'shadow-md');
        }
    });

    // Enter key to send prompt
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) {
                sendMessage();
            }
        }
    });

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('w-72');
        sidebar.classList.toggle('w-16');
        sidebar.querySelectorAll('.sidebar-label').forEach(el => {
            el.classList.toggle('hidden');
        });
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        document.documentElement.classList.toggle('light');
        if (document.documentElement.classList.contains('dark')) {
            themeIcon.textContent = 'light_mode';
        } else {
            themeIcon.textContent = 'dark_mode';
        }
    });

    // Model Dropdown Toggle
    modelSelectorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modelDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        modelDropdown.classList.add('hidden');
    });

    // New Chat Button
    newChatBtn.addEventListener('click', startNewChat);
}

// Switch AI Model
function switchModel(modelName) {
    currentModel = modelName;
    modelSelectorBtn.querySelector('span:first-child').textContent = modelName;
    document.querySelectorAll('.model-check').forEach(el => el.classList.add('hidden'));
    event.currentTarget.querySelector('.model-check').classList.remove('hidden');
    modelDropdown.classList.add('hidden');
}

// Trigger prompt from suggestion cards
function triggerPrompt(promptText) {
    userInput.value = promptText;
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
    sendBtn.disabled = false;
    sendBtn.classList.remove('bg-gemini-surfaceHover', 'text-gemini-muted', 'cursor-not-allowed');
    sendBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-500', 'shadow-md');
    sendMessage();
}

// Web Search Toggle
function toggleWebSearch() {
    isWebSearchActive = !isWebSearchActive;
    if (isWebSearchActive) {
        searchToggle.classList.add('text-blue-400', 'bg-blue-500/10');
        searchBadge.classList.remove('hidden');
    } else {
        searchToggle.classList.remove('text-blue-400', 'bg-blue-500/10');
        searchBadge.classList.add('hidden');
    }
}

// File Attachment handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        currentAttachment = file;
        attachmentName.textContent = file.name;
        attachmentPreview.classList.remove('hidden');
        
        if (file.type.startsWith('image/')) {
            attachmentIcon.textContent = 'image';
        } else {
            attachmentIcon.textContent = 'description';
        }

        sendBtn.disabled = false;
        sendBtn.classList.remove('bg-gemini-surfaceHover', 'text-gemini-muted', 'cursor-not-allowed');
        sendBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-500', 'shadow-md');
    }
}

function removeAttachment() {
    currentAttachment = null;
    attachmentPreview.classList.add('hidden');
    document.getElementById('file-upload').value = '';
    
    if (userInput.value.trim().length === 0) {
        sendBtn.disabled = true;
        sendBtn.classList.add('bg-gemini-surfaceHover', 'text-gemini-muted', 'cursor-not-allowed');
        sendBtn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-500', 'shadow-md');
    }
}

// Voice input simulation
function toggleVoiceInput() {
    const micBtn = document.getElementById('mic-btn');
    micBtn.classList.toggle('text-red-500');
    micBtn.classList.toggle('animate-pulse');
    
    if (micBtn.classList.contains('text-red-500')) {
        userInput.placeholder = "Listening... Speak now...";
        setTimeout(() => {
            userInput.value = "What are the latest breakthroughs in renewable energy?";
            userInput.dispatchEvent(new Event('input'));
            micBtn.classList.remove('text-red-500', 'animate-pulse');
            userInput.placeholder = "Enter a prompt here...";
        }, 4000);
    } else {
        userInput.placeholder = "Enter a prompt here...";
    }
}

// Render Chat History in Sidebar
function renderChatHistory() {
    chatHistoryList.innerHTML = '';
    chatHistory.forEach(chat => {
        const item = document.createElement('div');
        item.className = `group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition ${chat.id === activeChatId ? 'bg-gemini-surfaceHover text-white font-medium' : 'text-gemini-muted hover:bg-gemini-surfaceHover hover:text-white'}`;
        item.innerHTML = `
            <div class="flex items-center space-x-3 truncate">
                <span class="material-symbols-outlined text-base">chat_bubble_outline</span>
                <span class="truncate sidebar-label">${chat.title}</span>
            </div>
            <button onclick="deleteChat(event, ${chat.id})" class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition">
                <span class="material-symbols-outlined text-sm">delete</span>
            </button>
        `;
        item.onclick = () => loadChat(chat.id);
        chatHistoryList.appendChild(item);
    });
}

function startNewChat() {
    activeChatId = null;
    welcomeScreen.classList.remove('hidden');
    chatStream.classList.add('hidden');
    chatStream.innerHTML = '';
    renderChatHistory();
}

function loadChat(chatId) {
    activeChatId = chatId;
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    welcomeScreen.classList.add('hidden');
    chatStream.classList.remove('hidden');
    chatStream.innerHTML = '';

    // Populate simulated conversation based on chat title
    appendMessage(chat.title, 'user');
    
    let matchedResponse = "I'm here to assist you with any questions or creative tasks you have in mind!";
    for (let kb of knowledgeBase) {
        if (chat.title.toLowerCase().includes(kb.keywords[0])) {
            matchedResponse = kb.response;
            break;
        }
    }
    appendMessage(matchedResponse, 'ai');
    renderChatHistory();
}

function deleteChat(event, chatId) {
    event.stopPropagation();
    chatHistory = chatHistory.filter(c => c.id !== chatId);
    if (activeChatId === chatId) {
        startNewChat();
    } else {
        renderChatHistory();
    }
}

// Send Message & AI Response Generation
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text && !currentAttachment) return;

    // Transition from welcome screen to chat stream if first message
    if (welcomeScreen.classList.contains('hidden') === false) {
        welcomeScreen.classList.add('hidden');
        chatStream.classList.remove('hidden');
    }

    // Add to chat history if new chat
    if (!activeChatId) {
        const newId = Date.now();
        const shortTitle = text.length > 28 ? text.substring(0, 28) + '...' : text;
        chatHistory.unshift({ id: newId, title: shortTitle });
        activeChatId = newId;
        renderChatHistory();
    }

    // Clear input box and reset state
    userInput.value = '';
    userInput.style.height = 'auto';
    const attachmentObj = currentAttachment;
    removeAttachment();

    sendBtn.disabled = true;
    sendBtn.classList.add('bg-gemini-surfaceHover', 'text-gemini-muted', 'cursor-not-allowed');
    sendBtn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-500', 'shadow-md');

    // Append User Message
    appendUserMessage(text, attachmentObj);

    // Show Typing Indicator
    typingIndicator.classList.remove('hidden');
    chatStream.appendChild(typingIndicator);
    chatStream.scrollTop = chatStream.scrollHeight;

    // Simulate AI thinking delay
    setTimeout(() => {
        typingIndicator.classList.add('hidden');
        
        // Find matching response or generate intelligent fallback
        let aiResponse = generateAIResponse(text);
        appendMessage(aiResponse, 'ai');
        
    }, 1200 + Math.random() * 800);
}

function appendUserMessage(text, attachment) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start justify-end space-x-3 animate-fade-in max-w-4xl mx-auto w-full px-4';
    
    let attachmentHtml = '';
    if (attachment) {
        attachmentHtml = `<div class="mb-2 bg-gemini-surface p-2 rounded-xl border border-gemini-border text-xs flex items-center space-x-2">
            <span class="material-symbols-outlined text-blue-400">image</span>
            <span class="text-white font-medium">${attachment.name}</span>
        </div>`;
    }

    msgDiv.innerHTML = `
        <div class="flex flex-col items-end space-y-1 max-w-[80%] sm:max-w-[70%]">
            ${attachmentHtml}
            <div class="bg-gemini-surface px-5 py-3.5 rounded-3xl rounded-tr-sm text-sm sm:text-base text-gemini-text leading-relaxed shadow-sm border border-gemini-border/40">
                ${escapeHtml(text)}
            </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-medium text-white text-xs flex-shrink-0 shadow-md">
            U
        </div>
    `;
    chatStream.appendChild(msgDiv);
    chatStream.scrollTop = chatStream.scrollHeight;
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start space-x-4 animate-fade-in max-w-4xl mx-auto w-full px-4 py-2';
    
    if (sender === 'ai') {
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <span class="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <div class="flex-1 space-y-3 overflow-hidden">
                <div class="text-sm sm:text-base text-gemini-text leading-relaxed prose prose-invert">
                    ${formatMarkdown(text)}
                </div>
                <!-- Action toolbar under AI message -->
                <div class="flex items-center space-x-2 text-gemini-muted pt-1">
                    <button title="Copy response" onclick="copyToClipboard(this, \`${escapeSpecialChars(text)}\`)" class="p-1.5 hover:bg-gemini-surfaceHover rounded-full hover:text-white transition">
                        <span class="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button title="Good response" onclick="feedbackReaction(this, 'good')" class="p-1.5 hover:bg-gemini-surfaceHover rounded-full hover:text-white transition">
                        <span class="material-symbols-outlined text-lg">thumb_up</span>
                    </button>
                    <button title="Bad response" onclick="feedbackReaction(this, 'bad')" class="p-1.5 hover:bg-gemini-surfaceHover rounded-full hover:text-white transition">
                        <span class="material-symbols-outlined text-lg">thumb_down</span>
                    </button>
                    <button title="Share or export" class="p-1.5 hover:bg-gemini-surfaceHover rounded-full hover:text-white transition">
                        <span class="material-symbols-outlined text-lg">share</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    chatStream.appendChild(msgDiv);
    chatStream.scrollTop = chatStream.scrollHeight;
}

// Generate intelligent response based on prompt text
function generateAIResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    for (let item of knowledgeBase) {
        for (let kw of item.keywords) {
            if (lowerPrompt.includes(kw)) {
                return item.response;
            }
        }
    }

    // Default intelligent fallback response
    return `That's a fascinating question regarding **"${prompt}"**. 

Using ${currentModel}, I've analyzed your query from multiple perspectives:

1. **Overview & Context:** ${prompt.charAt(0).toUpperCase() + prompt.slice(1)} involves several core principles and modern applications across various industries.
2. **Key Considerations:** When exploring this topic, experts recommend examining both theoretical frameworks and practical implementations to achieve optimal results.
3. **Next Steps:** If you'd like to dive deeper, we can break this down into specific code snippets, step-by-step guides, or creative outlines tailored to your exact workflow.

Let me know how you'd like to proceed!`;
}

// Basic Markdown & Code Block formatter
function formatMarkdown(text) {
    // Format code blocks
    text = text.replace(/```python([\s\S]*?)```/g, '<pre><code class="language-python">$1</code></pre>');
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Format bold headers
    text = text.replace(/### (.*?)\n/g, '<h3 class="font-[\'Google_Sans\'] font-bold text-lg text-white mt-4 mb-2">$1</h3>');
    text = text.replace(/#### (.*?)\n/g, '<h4 class="font-[\'Google_Sans\'] font-semibold text-base text-white mt-3 mb-1.5">$1</h4>');
    
    // Format bold text
    text = text.replace(/\*\(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    
    // Format bullet points
    text = text.replace(/- \*\*(.*?)\*\*:/g, '• <strong class="text-white">$1</strong>:');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function escapeSpecialChars(text) {
    return text.replace(/`/g, '\\`').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function copyToClipboard(btn, text) {
    // Unescape text
    const cleanText = text.replace(/\\`/g, '`').replace(/\\"/g, '"').replace(/\\n/g, '\n');
    navigator.clipboard.writeText(cleanText).then(() => {
        const icon = btn.querySelector('span');
        icon.textContent = 'check';
        setTimeout(() => {
            icon.textContent = 'content_copy';
        }, 2000);
    });
}

function feedbackReaction(btn, type) {
    const icon = btn.querySelector('span');
    btn.classList.add('text-blue-400');
    icon.textContent = type === 'good' ? 'thumb_up' : 'thumb_down';
    setTimeout(() => {
        btn.classList.remove('text-blue-400');
    }, 1500);
}
