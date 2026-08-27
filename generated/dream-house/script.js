// Initialize AOS animations
AOS.init({
    once: true,
    offset: 100,
    duration: 800,
    easing: 'ease-out-cubic'
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('bg-luxury-dark/95', 'backdrop-blur-md', 'shadow-xl', 'py-4', 'border-b', 'border-luxury-gold/20');
        navbar.classList.remove('bg-transparent', 'py-5');
    } else {
        navbar.classList.remove('bg-luxury-dark/95', 'backdrop-blur-md', 'shadow-xl', 'py-4', 'border-b', 'border-luxury-gold/20');
        navbar.classList.add('bg-transparent', 'py-5');
    }
});

// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = menuBtn.querySelector('i');
    if (mobileMenu.classList.contains('hidden')) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    } else {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.querySelector('i').classList.remove('fa-xmark');
        menuBtn.querySelector('i').classList.add('fa-bars');
    });
});

// Video Modal functions
function openVideoModal() {
    const modal = document.getElementById('video-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// Close modal on background click
document.getElementById('video-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('video-modal')) {
        closeVideoModal();
    }
});

// Inquiry Form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    const successBox = document.getElementById('form-success');
    successBox.classList.remove('hidden');
    successBox.classList.add('flex');
}

function resetForm() {
    document.getElementById('inquiry-form').reset();
    const successBox = document.getElementById('form-success');
    successBox.classList.add('hidden');
    successBox.classList.remove('flex');
}
