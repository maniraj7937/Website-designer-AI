// Initialize AOS animations
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Sticky Navbar shadow on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Language Selector feedback
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            if (lang === 'hi') {
                showToast('हिन्दी भाषा समर्थन जल्द ही आ रहा है (Hindi support coming soon)');
            } else {
                showToast('Switched to English');
            }
        });
    }
});

// Modal Management Functions
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

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Form Submissions with Toast Feedback
function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('senderName').value;
    showToast(`Thank you ${name}! Your message has been sent successfully.`);
    document.getElementById('contactForm').reset();
}

function handleAdmissionSubmit(e) {
    e.preventDefault();
    closeModal('admissionModal');
    showToast('Application submitted successfully! Our admission cell will contact you soon.');
    e.target.reset();
}

function handlePortalLogin(e, portalType) {
    e.preventDefault();
    const modalId = portalType === 'Student' ? 'studentModal' : 'teacherModal';
    closeModal(modalId);
    showToast(`${portalType} Portal login successful! Redirecting to dashboard...`);
    e.target.reset();
}

function handleNewsletter(e) {
    e.preventDefault();
    showToast('Thank you for subscribing to DAV Newsletter!');
    e.target.reset();
}

// Toast Notification Helper
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
