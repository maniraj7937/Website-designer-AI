// Initialize AOS & Current Date
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 800, once: true });

    // Set Live Date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        dateElement.innerHTML = `<i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString('en-US', options)}`;
    }

    // Theme Switcher (Dark / Light Mode)
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                htmlElement.setAttribute('data-theme', 'light');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                showToast('Switched to Light Mode');
            } else {
                htmlElement.setAttribute('data-theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                showToast('Switched to Dark Mode');
            }
        });
    }

    // Mobile Hamburger
    const hamburger = document.getElementById('hamburger');
    const catNav = document.getElementById('catNav');
    if (hamburger && catNav) {
        hamburger.addEventListener('click', () => {
            catNav.classList.toggle('active');
        });
    }
});

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Open Full Article Reader Modal
function openArticleModal(titleText) {
    document.getElementById('modalTitle').textContent = titleText;
    openModal('articleModal');
}

// Live Search Feature
function liveSearch(e) {
    const query = e.target.value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query) {
        resultsContainer.innerHTML = '<p class="search-hint">Type keywords to search articles instantly...</p>';
        return;
    }

    const mockArticles = [
        { title: "The Future of Quantum Computing in Global Cryptography", category: "Technology" },
        { title: "Central Banks Accelerate Sovereign Digital Currencies", category: "Markets" },
        { title: "Next-Gen Renewable Energy Grid Powered by AI", category: "Tech & AI" },
        { title: "UN Security Council Adopts Autonomous Defense Resolution", category: "Politics" },
        { title: "James Webb Telescope Detects Exoplanet Biomarkers", category: "Science" }
    ];

    const filtered = mockArticles.filter(art => art.title.toLowerCase().includes(query));

    if (filtered.length > 0) {
        resultsContainer.innerHTML = filtered.map(art => `
            <div class="search-result-item" onclick="closeModal('searchModal'); openArticleModal('${art.title}')">
                <span class="category-badge" style="font-size:0.65rem; margin-bottom:4px;">${art.category}</span>
                <strong>${art.title}</strong>
            </div>
        `).join('');
    } else {
        resultsContainer.innerHTML = '<p class="search-hint">No matching articles found.</p>';
    }
}

// Feed Filter Tabs
function filterFeed(category) {
    // Update active tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const cards = document.querySelectorAll('.article-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.style.display = 'grid';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load More Simulation
function loadMoreArticles() {
    showToast('All latest breaking news stories are currently loaded.');
}

// Comments & Newsletter Submissions
function addComment() {
    const input = document.getElementById('commentInput');
    const commentText = input.value.trim();
    if (!commentText) return;

    const list = document.getElementById('commentsList');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `<strong>You (Just now)</strong><p>${commentText}</p>`;
    list.prepend(newComment);
    input.value = '';
    showToast('Comment posted successfully!');
}

function handleNewsletter(e) {
    e.preventDefault();
    showToast('Subscribed successfully to Daily Pulse Newsletter!');
    e.target.reset();
}

function handleModalSubscribe(e) {
    e.preventDefault();
    closeModal('subscribeModal');
    showToast('Successfully subscribed! Check your inbox for the morning briefing.');
}

function handleLoginSubmit(e) {
    e.preventDefault();
    closeModal('loginModal');
    showToast('Sign in successful! Welcome back.');
}

function toggleBookmark(icon) {
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    if (icon.classList.contains('fas')) {
        showToast('Article saved to your bookmarks!');
    } else {
        showToast('Article removed from bookmarks.');
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}
