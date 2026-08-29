/* ==========================================
   APEX GLOBAL UNIVERSITY - JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- STICKY HEADER & NAV SCROLL --- */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* --- MOBILE HAMBURGER MENU --- */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('open');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('open');
        });
    });

    /* --- NEWS TICKER AUTO ROTATE --- */
    const tickerItems = document.querySelectorAll('.ticker-item');
    let currentTicker = 0;

    if (tickerItems.length > 0) {
        setInterval(() => {
            tickerItems[currentTicker].classList.remove('active');
            currentTicker = (currentTicker + 1) % tickerItems.length;
            tickerItems[currentTicker].classList.add('active');
        }, 4000);
    }

    /* --- STATS COUNTER ANIMATION --- */
    const statNums = document.querySelectorAll('.stat-num');
    let animated = false;

    function runCounter() {
        statNums.forEach(num => {
            const target = +num.getAttribute('data-val');
            let count = 0;
            const speed = target / 50;

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    num.innerText = Math.ceil(count) + (num.innerText.includes('+') ? '+' : (num.innerText.includes('M') ? 'M' : '%'));
                    setTimeout(updateCount, 30);
                } else {
                    num.innerText = target + (target === 25000 ? '+' : (target === 98 ? '%' : (target === 450 ? 'M' : '+')));
                }
            };
            updateCount();
        });
    }

    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.hero-stats-bar');
        if (statsSection) {
            const rect = statsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && !animated) {
                runCounter();
                animated = true;
            }
        }
    });

    /* --- PROGRAM FILTERING --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const programCards = document.querySelectorAll('.program-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            programCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* --- TUITION CALCULATOR --- */
    const calcProgram = document.getElementById('calcProgram');
    const calcHousing = document.getElementById('calcHousing');
    const calcScholarship = document.getElementById('calcScholarship');
    const estimatedTotal = document.getElementById('estimatedTotal');

    function calculateTuition() {
        if (!calcProgram || !calcHousing || !calcScholarship) return;
        const progVal = parseInt(calcProgram.value) || 0;
        const houseVal = parseInt(calcHousing.value) || 0;
        const scholVal = parseInt(calcScholarship.value) || 0;

        let total = progVal + houseVal - scholVal;
        if (total < 0) total = 0;

        estimatedTotal.innerText = `$${total.toLocaleString()} / year`;
    }

    if (calcProgram && calcHousing && calcScholarship) {
        calcProgram.addEventListener('change', calculateTuition);
        calcHousing.addEventListener('change', calculateTuition);
        calcScholarship.addEventListener('change', calculateTuition);
        calculateTuition();
    }

    /* --- MODAL CONTROLLER --- */
    const programModal = document.getElementById('programModal');
    const portalModal = document.getElementById('portalModal');
    const tourModal = document.getElementById('tourModal');
    const applyModal = document.getElementById('applyModal');

    // Program Details Modal Triggers
    const viewProgBtns = document.querySelectorAll('.view-prog-details');
    const modalProgramTitle = document.getElementById('modalProgramTitle');
    const modalProgramDesc = document.getElementById('modalProgramDesc');
    const modalProgramDuration = document.getElementById('modalProgramDuration');
    const modalProgramCredits = document.getElementById('modalProgramCredits');
    const modalProgramFee = document.getElementById('modalProgramFee');

    viewProgBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalProgramTitle.innerText = btn.getAttribute('data-title');
            modalProgramDesc.innerText = btn.getAttribute('data-desc');
            modalProgramDuration.innerText = btn.getAttribute('data-duration');
            modalProgramCredits.innerText = btn.getAttribute('data-credits');
            modalProgramFee.innerText = btn.getAttribute('data-fee');
            programModal.classList.add('active');
        });
    });

    // Close Modals
    document.querySelectorAll('.close-modal, #closeProgramModalBtn').forEach(el => {
        el.addEventListener('click', () => {
            programModal.classList.remove('active');
            portalModal.classList.remove('active');
            tourModal.classList.remove('active');
            applyModal.classList.remove('active');
        });
    });

    // Window click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    /* --- PORTAL MODAL (Student / Staff) --- */
    const openStudentPortal = document.getElementById('openStudentPortal');
    const openStaffPortal = document.getElementById('openStaffPortal');
    const portalTitle = document.getElementById('portalTitle');
    const portalSub = document.getElementById('portalSub');
    const portalTabs = document.querySelectorAll('.portal-tab');

    openStudentPortal.addEventListener('click', (e) => {
        e.preventDefault();
        setPortalMode('student');
        portalModal.classList.add('active');
    });

    openStaffPortal.addEventListener('click', (e) => {
        e.preventDefault();
        setPortalMode('staff');
        portalModal.classList.add('active');
    });

    portalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            portalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.getAttribute('data-tab');
            setPortalMode(mode);
        });
    });

    function setPortalMode(mode) {
        if (mode === 'student') {
            portalTitle.innerText = 'Student Sign In';
            portalSub.innerText = 'Access your grades, schedule, and course materials.';
            portalTabs[0].classList.add('active');
            portalTabs[1].classList.remove('active');
        } else {
            portalTitle.innerText = 'Faculty & Staff Sign In';
            portalSub.innerText = 'Access faculty portal, research grants, and payroll.';
            portalTabs[1].classList.add('active');
            portalTabs[0].classList.remove('active');
        }
    }

    /* --- VIRTUAL TOUR MODAL --- */
    const virtualTourBtn = document.getElementById('virtualTourBtn');
    const launchTourModal = document.getElementById('launchTourModal');
    const tourViewer = document.getElementById('tourViewer');
    const tourCurrentLocation = document.getElementById('tourCurrentLocation');
    const tourHotspots = document.querySelectorAll('.tour-hotspot');

    const tourImages = [
        { name: 'Main Library & Archives', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Advanced Robotics Center', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop' },
        { name: 'Student Union & Food Court', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop' }
    ];
    let currentTourIdx = 0;

    function openTour() {
        tourModal.classList.add('active');
        updateTourView(0);
    }

    if (virtualTourBtn) virtualTourBtn.addEventListener('click', openTour);
    if (launchTourModal) launchTourModal.addEventListener('click', openTour);

    tourHotspots.forEach(hs => {
        hs.addEventListener('click', () => {
            const locName = hs.getAttribute('data-location');
            showToast(`Navigating to ${locName}...`);
            tourCurrentLocation.innerText = `Viewing: ${locName}`;
        });
    });

    document.getElementById('nextLoc').addEventListener('click', () => {
        currentTourIdx = (currentTourIdx + 1) % tourImages.length;
        updateTourView(currentTourIdx);
    });

    document.getElementById('prevLoc').addEventListener('click', () => {
        currentTourIdx = (currentTourIdx - 1 + tourImages.length) % tourImages.length;
        updateTourView(currentTourIdx);
    });

    function updateTourView(idx) {
        tourViewer.style.backgroundImage = `url('${tourImages[idx].url}')`;
        tourCurrentLocation.innerText = `Viewing: ${tourImages[idx].name}`;
    }

    /* --- APPLY NOW MODALS --- */
    const applyNowBtn = document.getElementById('applyNowBtn');
    const applyWithEstimateBtn = document.getElementById('applyWithEstimateBtn');
    const modalApplyBtn = document.getElementById('modalApplyBtn');

    if (applyNowBtn) {
        applyNowBtn.addEventListener('click', () => {
            applyModal.classList.add('active');
        });
    }

    if (applyWithEstimateBtn) {
        applyWithEstimateBtn.addEventListener('click', () => {
            applyModal.classList.add('active');
        });
    }

    if (modalApplyBtn) {
        modalApplyBtn.addEventListener('click', () => {
            programModal.classList.remove('active');
            applyModal.classList.add('active');
        });
    }

    /* --- FORM SUBMISSIONS & TOAST NOTIFICATIONS --- */
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(msg) {
        toastMessage.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Portal Login Form
    const portalLoginForm = document.getElementById('portalLoginForm');
    if (portalLoginForm) {
        portalLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            portalModal.classList.remove('active');
            showToast('Successfully signed in to portal!');
            portalLoginForm.reset();
        });
    }

    // Main Apply Form
    const mainApplyForm = document.getElementById('mainApplyForm');
    if (mainApplyForm) {
        mainApplyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyModal.classList.remove('active');
            showToast('Application submitted successfully! Check your email for confirmation.');
            mainApplyForm.reset();
        });
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Message sent successfully! Our team will get back to you shortly.');
            contactForm.reset();
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you for subscribing to Apex News!');
            newsletterForm.reset();
        });
    }

});
