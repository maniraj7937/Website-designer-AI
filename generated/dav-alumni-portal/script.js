// Initialize AOS
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Mobile Hamburger Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
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

function openMessageModal(alumniName) {
    const targetName = document.getElementById('modalTargetName');
    if (targetName) {
        targetName.textContent = `Message ${alumniName}`;
    }
    openModal('messageModal');
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Form Submission with Toast
function handleFormSubmit(e, modalId, successMessage) {
    e.preventDefault();
    closeModal(modalId);
    showToast(successMessage);
    e.target.reset();
}

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

// Live Alumni Directory Filter
function filterAlumni() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const batchSelect = document.getElementById('batchSelect').value;
    const domainSelect = document.getElementById('domainSelect').value;
    
    const cards = document.querySelectorAll('.alumni-card');

    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const batch = card.getAttribute('data-batch');
        const domain = card.getAttribute('data-domain');

        const matchesSearch = name.includes(searchInput) || card.textContent.toLowerCase().includes(searchInput);
        const matchesBatch = batchSelect === "" || batch === batchSelect;
        const matchesDomain = domainSelect === "" || domain === domainSelect;

        if (matchesSearch && matchesBatch && matchesDomain) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}
