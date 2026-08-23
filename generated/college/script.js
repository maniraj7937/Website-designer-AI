/* ==========================================================================
   VERITAS UNIVERSITY - MASTER INTERACTIVE JAVASCRIPT
   Program Search, Aid Estimator, Modals, Tour Hotspots & Admission Portal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initStatsCounter();
    initProgramsSystem();
    initAidCalculator();
    initFacilityTabs();
    initModalsAndForms();
    initVirtualTour();
});

/* --------------------------------------------------------------------------
   1. Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
        });
    });
}

/* --------------------------------------------------------------------------
   2. Animated Stats Counter
   -------------------------------------------------------------------------- */
function initStatsCounter() {
    const statNums = document.querySelectorAll('.stat-number');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNums.forEach(numElem => {
                    const target = parseFloat(numElem.getAttribute('data-target'));
                    const decimals = parseInt(numElem.getAttribute('data-decimals') || '0', 10);
                    const duration = 2000;
                    const startTime = performance.now();

                    function countStep(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const val = target * easeProgress;

                        numElem.textContent = val.toFixed(decimals);

                        if (progress < 1) {
                            requestAnimationFrame(countStep);
                        } else {
                            numElem.textContent = target.toFixed(decimals);
                        }
                    }

                    requestAnimationFrame(countStep);
                });
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   3. Degree Programs System & Search Filter
   -------------------------------------------------------------------------- */
const programsData = [
    {
        id: 'cs-ai',
        title: 'B.S. Computer Science & Artificial Intelligence',
        category: 'stem',
        degree: 'undergraduate',
        badge: 'SCHOOL OF ENGINEERING',
        desc: 'Focus on machine learning models, distributed systems algorithms, software architecture, and quantum computing fundamentals.',
        careerRate: '99.2% Placement',
        avgSalary: '$112,000 Avg Starting',
        courses: ['Deep Learning & Neural Networks', 'Distributed Systems', 'Algorithms & Complexity', 'Software Engineering Studio']
    },
    {
        id: 'bio-eng',
        title: 'B.S. Biomedical Engineering & Nanotechnology',
        category: 'stem',
        degree: 'undergraduate',
        badge: 'COLLEGE OF HEALTH SCIENCES',
        desc: 'Bridge medicine and engineering through artificial organ design, tissue regeneration, and bio-sensors.',
        careerRate: '97.8% Placement',
        avgSalary: '$88,000 Avg Starting',
        courses: ['Biomaterials & Tissue Systems', 'Biomechanics', 'Medical Device Prototyping', 'Cellular Engineering']
    },
    {
        id: 'int-finance',
        title: 'B.A. International Business & Financial Tech',
        category: 'business',
        degree: 'undergraduate',
        badge: 'VERITAS BUSINESS SCHOOL',
        desc: 'Global market strategy, corporate valuation, algorithmic trading systems, and sustainable venture capital.',
        careerRate: '98.5% Placement',
        avgSalary: '$94,000 Avg Starting',
        courses: ['Corporate Financial Strategy', 'Fintech & Blockchain Analytics', 'Global Trade Policy', 'Venture Capital Lab']
    },
    {
        id: 'data-analytics',
        title: 'M.S. Data Science & Predictive Analytics',
        category: 'stem',
        degree: 'graduate',
        badge: 'GRADUATE INSTITUTE',
        desc: 'Advanced statistical modeling, big data pipeline engineering, and cloud AI deployment for enterprise decisions.',
        careerRate: '99.5% Placement',
        avgSalary: '$124,000 Avg Starting',
        courses: ['Big Data Architecture', 'Bayesian Machine Learning', 'Natural Language Processing', 'Data Visualization']
    },
    {
        id: 'law-jd',
        title: 'Juris Doctor (J.D.) Law & Public Policy',
        category: 'law',
        degree: 'graduate',
        badge: 'VERITAS LAW SCHOOL',
        desc: 'Constitutional law, intellectual property, international human rights, and technology policy governance.',
        careerRate: '98.0% Placement',
        avgSalary: '$145,000 Avg Starting',
        courses: ['Constitutional Law', 'IP & Technology Law', 'M&A Transactions', 'Appellate Moot Court']
    },
    {
        id: 'pre-med',
        title: 'Doctor of Medicine (M.D.) / Pre-Med Honors',
        category: 'health',
        degree: 'graduate',
        badge: 'SCHOOL OF MEDICINE',
        desc: 'Comprehensive clinical rotations, surgical simulation labs, and precision genomic medicine research.',
        careerRate: '100% Residency Match',
        avgSalary: '$220,000+ Post-Residency',
        courses: ['Human Anatomy & Histology', 'Pathology & Pharmacology', 'Clinical Diagnostics', 'Genomic Medicine']
    }
];

function initProgramsSystem() {
    const grid = document.getElementById('programs-grid');
    const filterPills = document.querySelectorAll('#program-filters .filter-pill');
    const heroSearchInput = document.getElementById('hero-program-search');
    const heroLevelSelect = document.getElementById('hero-degree-level');
    const heroSearchBtn = document.getElementById('hero-search-btn');

    if (!grid) return;

    function renderPrograms(categoryFilter = 'all', searchQuery = '', levelFilter = 'all') {
        grid.innerHTML = '';

        const filtered = programsData.filter(prog => {
            const matchesCat = categoryFilter === 'all' || prog.category === categoryFilter;
            const matchesLevel = levelFilter === 'all' || prog.degree === levelFilter;
            const matchesSearch = searchQuery === '' || 
                prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prog.desc.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCat && matchesLevel && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-graduation-cap" style="font-size: 3rem; margin-bottom: 12px; color: var(--color-crimson);"></i>
                    <h3>No academic programs match your query</h3>
                    <p>Try searching for a different keyword or resetting filters.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(prog => {
            const card = document.createElement('div');
            card.className = 'program-card';
            card.innerHTML = `
                <span class="prog-badge">${prog.badge}</span>
                <h3 class="prog-title">${prog.title}</h3>
                <p class="prog-desc">${prog.desc}</p>
                <div class="prog-stats">
                    <span><i class="fa-solid fa-user-check font-crimson"></i> ${prog.careerRate}</span>
                    <span><i class="fa-solid fa-briefcase font-crimson"></i> ${prog.avgSalary}</span>
                </div>
                <button class="btn btn-outline-gold btn-block view-prog-detail" data-prog-id="${prog.id}">
                    <i class="fa-solid fa-circle-info"></i> View Curriculum Details
                </button>
            `;
            grid.appendChild(card);
        });

        document.querySelectorAll('.view-prog-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-prog-id');
                openProgramDetailModal(id);
            });
        });
    }

    renderPrograms();

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderPrograms(pill.getAttribute('data-filter'));
        });
    });

    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            const query = heroSearchInput ? heroSearchInput.value.trim() : '';
            const level = heroLevelSelect ? heroLevelSelect.value : 'all';
            renderPrograms('all', query, level);
            const target = document.getElementById('programs');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function openProgramDetailModal(progId) {
    const prog = programsData.find(p => p.id === progId);
    const modal = document.getElementById('program-modal');
    const modalContent = document.getElementById('prog-modal-content');

    if (!prog || !modal || !modalContent) return;

    modalContent.innerHTML = `
        <div style="border-bottom: 2px solid var(--color-crimson); padding-bottom: 16px; margin-bottom: 20px;">
            <span style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--color-gold); background: var(--color-navy); padding: 4px 10px; border-radius: 4px;">${prog.badge}</span>
            <h2 style="font-size: 1.8rem; margin-top: 10px;">${prog.title}</h2>
        </div>

        <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 20px;">${prog.desc}</p>

        <h4 style="font-size: 1.1rem; color: var(--color-crimson); margin-bottom: 12px;"><i class="fa-solid fa-book"></i> Sample Core Curriculum Courses</h4>
        <ul style="list-style-type: square; padding-left: 20px; color: var(--text-primary); margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${prog.courses.map(c => `<li>${c}</li>`).join('')}
        </ul>

        <div style="background: var(--bg-cream); padding: 20px; border-radius: var(--radius-md); display: flex; justify-content: space-around; margin-bottom: 24px; text-align: center;">
            <div>
                <strong style="display: block; font-size: 1.2rem; color: var(--color-navy);">${prog.careerRate}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Career Outcomes Rate</span>
            </div>
            <div>
                <strong style="display: block; font-size: 1.2rem; color: var(--color-navy);">${prog.avgSalary}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Average Starting Salary</span>
            </div>
        </div>

        <div style="display: flex; gap: 12px;">
            <button class="btn btn-crimson btn-block" onclick="document.getElementById('close-prog-modal').click(); document.getElementById('apply-now-btn').click();">
                <i class="fa-solid fa-paper-plane"></i> Apply for This Program
            </button>
        </div>
    `;

    modal.classList.add('active');
}

/* --------------------------------------------------------------------------
   4. Tuition & Financial Aid Net Cost Estimator
   -------------------------------------------------------------------------- */
function initAidCalculator() {
    const calcBtn = document.getElementById('calculate-aid-btn');
    if (!calcBtn) return;

    calcBtn.addEventListener('click', () => {
        const residency = document.getElementById('residency-type').value;
        const level = document.getElementById('degree-level').value;
        const housing = document.getElementById('housing-type').value;
        const gpa = document.getElementById('gpa-tier').value;

        // Base Tuition calculation
        let tuition = 38500;
        if (residency === 'in-state') tuition = 14200;
        if (residency === 'international') tuition = 42000;

        if (level === 'grad') tuition *= 1.2;
        if (level === 'phd') tuition = 0; // Fully funded research fellowship

        // Housing calculation
        let housingCost = 12800;
        if (housing === 'off-campus') housingCost = 9500;
        if (housing === 'commuter') housingCost = 1200;

        // Merit Aid
        let meritAid = 7500;
        if (gpa === 'presidential') meritAid = 12000;
        if (gpa === 'dean') meritAid = 4000;
        if (gpa === 'standard') meritAid = 0;

        let generalGrant = level === 'phd' ? 0 : 12500;

        const totalNetCost = Math.max(0, (tuition + housingCost) - (meritAid + generalGrant));

        // Update DOM
        document.getElementById('net-cost-display').textContent = `$${Math.round(totalNetCost).toLocaleString()}`;
        document.getElementById('cost-tuition').textContent = `$${Math.round(tuition).toLocaleString()}`;
        document.getElementById('cost-housing').textContent = `$${Math.round(housingCost).toLocaleString()}`;
        document.getElementById('cost-aid').textContent = `-$${Math.round(meritAid).toLocaleString()}`;
        document.getElementById('cost-grant').textContent = `-$${Math.round(generalGrant).toLocaleString()}`;

        showToast('Financial Aid Estimate Updated!', 'success');
    });
}

/* --------------------------------------------------------------------------
   5. Campus Facilities Tabs
   -------------------------------------------------------------------------- */
const facilitiesData = {
    library: {
        title: 'Founders Central Library & Rare Manuscript Archive',
        desc: 'Home to over 3.5 million physical volumes, 24/7 quiet study suites, high-performance workstation pods, and historic rare book collections.',
        bullets: ['24/7 Keycard Access for Students', '120 Collaborative Study Rooms', 'Digital Humanities Lab']
    },
    labs: {
        title: 'Thorne Supercomputing & AI Robotics Lab',
        desc: 'Equipped with NVIDIA A100 GPU clusters, autonomous robotics testing arenas, and additive 3D manufacturing clean rooms.',
        bullets: ['Supercomputing Cluster Access', 'Drone & Quadcopter Arena', 'Industry Incubator Partnerships']
    },
    athletics: {
        title: 'Oaks Olympic Athletics & Aquatic Center',
        desc: 'Features a 50-meter Olympic pool, 10,000-seat stadium, indoor rock climbing wall, and sports biomechanics recovery clinic.',
        bullets: ['22 NCAA Division I Athletic Teams', 'Free Student Fitness Classes', 'Hydrotherapy & Recovery Saunas']
    },
    housing: {
        title: 'Veritas Quadrangle Residence Suites',
        desc: 'Modern eco-friendly dormitory options featuring private room configurations, high-speed fiber internet, and communal kitchen lounges.',
        bullets: ['Living-Learning Communities', '24/7 Security & Keycard Entry', 'On-Site Dining Options']
    },
    dining: {
        title: 'University Commons & Culinary Center',
        desc: 'Offering organic farm-to-table dining, global culinary stations, coffee roasteries, and dietary-specific meal plans.',
        bullets: ['Vegan, Halal & Kosher Options', 'Late-Night Study Cafe', 'Mobile Meal Pre-Ordering']
    }
};

function initFacilityTabs() {
    const tabs = document.querySelectorAll('#facility-tabs .fac-tab');
    const displayCard = document.getElementById('facility-display');

    if (!displayCard) return;

    function renderFacility(key = 'library') {
        const fac = facilitiesData[key];
        if (!fac) return;

        displayCard.innerHTML = `
            <div class="fac-preview-grid">
                <div class="fac-info">
                    <h3>${fac.title}</h3>
                    <p>${fac.desc}</p>
                    <ul class="fac-bullets">
                        ${fac.bullets.map(b => `<li><i class="fa-solid fa-check"></i> ${b}</li>`).join('')}
                    </ul>
                </div>
                <div style="background: var(--color-navy); border-radius: var(--radius-md); height: 240px; display: flex; align-items: center; justify-content: center; color: var(--color-gold); font-size: 4rem;">
                    <i class="fa-solid fa-building-columns"></i>
                </div>
            </div>
        `;
    }

    renderFacility('library');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFacility(tab.getAttribute('data-fac'));
        });
    });
}

/* --------------------------------------------------------------------------
   6. Modals & Admissions Portal Form
   -------------------------------------------------------------------------- */
function initModalsAndForms() {
    const applyModal = document.getElementById('apply-modal');
    const applyBtns = [document.getElementById('apply-now-btn'), document.getElementById('request-info-btn')];
    const closeApply = document.getElementById('close-apply-modal');
    const closeProg = document.getElementById('close-prog-modal');
    const progModal = document.getElementById('program-modal');
    const form = document.getElementById('apply-form');

    applyBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (applyModal) applyModal.classList.add('active');
            });
        }
    });

    if (closeApply && applyModal) {
        closeApply.addEventListener('click', () => applyModal.classList.remove('active'));
        applyModal.addEventListener('click', (e) => { if (e.target === applyModal) applyModal.classList.remove('active'); });
    }

    if (closeProg && progModal) {
        closeProg.addEventListener('click', () => progModal.classList.remove('active'));
        progModal.addEventListener('click', (e) => { if (e.target === progModal) progModal.classList.remove('active'); });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('app-name').value;
            const major = document.getElementById('app-major').value;
            const portalId = `VERITAS-2025-${Math.floor(10000 + Math.random() * 90000)}`;

            if (applyModal) applyModal.classList.remove('active');
            showToast(`Thank you ${name}! Application Portal ID generated: ${portalId} for ${major}. Check email for next steps.`, 'success');
            form.reset();
        });
    }
}

/* --------------------------------------------------------------------------
   7. Virtual Campus Map Tour Modal
   -------------------------------------------------------------------------- */
function initVirtualTour() {
    const tourBtn = document.getElementById('virtual-tour-btn');
    const tourModal = document.getElementById('tour-modal');
    const closeTour = document.getElementById('close-tour-modal');
    const infoBox = document.getElementById('hotspot-info');

    if (!tourModal) return;

    if (tourBtn) {
        tourBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tourModal.classList.add('active');
        });
    }

    if (closeTour) {
        closeTour.addEventListener('click', () => tourModal.classList.remove('active'));
    }

    document.querySelectorAll('.map-hotspot').forEach(spot => {
        spot.addEventListener('click', () => {
            const name = spot.getAttribute('data-spot');
            if (infoBox) {
                infoBox.innerHTML = `
                    <h4 style="color: var(--color-crimson); margin-bottom: 4px;"><i class="fa-solid fa-location-dot"></i> Selected Facility: ${name}</h4>
                    <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">High-definition 360° virtual tour rendering initialized. Explore research spaces and study suites.</p>
                `;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   8. Toast Notification Helper
   -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check font-gold"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
