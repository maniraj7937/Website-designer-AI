/* ==========================================================================
   PULSE FIT GYM - MASTER INTERACTIVE SCRIPT
   Calculators, Dynamic Timetable, Modals, Theme System & Pass Generator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initMobileNav();
    initStatsCounter();
    initClassesSystem();
    initScheduleSystem();
    initTrainersSystem();
    initCalculators();
    initPricingSystem();
    initPassGenerator();
    initModals();
});

/* --------------------------------------------------------------------------
   1. Theme Color Switcher (Neon, Crimson, Cyan)
   -------------------------------------------------------------------------- */
function initThemeSwitcher() {
    const themeBtn = document.getElementById('theme-toggle');
    const themes = ['neon', 'crimson', 'cyan'];
    let currentIdx = 0;

    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        currentIdx = (currentIdx + 1) % themes.length;
        const newTheme = themes[currentIdx];
        document.documentElement.setAttribute('data-theme', newTheme);
        showToast(`Theme changed to ${newTheme.toUpperCase()} style!`, 'info');
    });
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Toggle
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
   3. Animated Stats Counter
   -------------------------------------------------------------------------- */
function initStatsCounter() {
    const statNums = document.querySelectorAll('.stat-num');
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
   4. Dynamic Group Classes System
   -------------------------------------------------------------------------- */
const classesData = [
    {
        id: 'heavy-iron',
        title: 'Heavy Iron Powerlifting',
        category: 'strength',
        icon: 'fa-solid fa-dumbbell',
        desc: 'Master the barbell squat, bench press, and deadlift. Focused on progressive overload and heavy singles/triples.',
        intensity: '🔥 High Intensity',
        duration: '60 Mins',
        calories: '550 kcal'
    },
    {
        id: 'metabolic-shred',
        title: 'Metabolic Shred HIIT',
        category: 'cardio',
        icon: 'fa-solid fa-fire',
        desc: 'Explosive interval training combining kettlebells, ski-ergs, box jumps, and bodyweight conditioning.',
        intensity: '⚡ Extreme',
        duration: '45 Mins',
        calories: '650 kcal'
    },
    {
        id: 'combat-boxing',
        title: 'Combat Boxing & Striking',
        category: 'combat',
        icon: 'fa-solid fa-hand-back-fist',
        desc: 'Heavy bag drills, pad work, and footwork technique led by former professional golden gloves fighters.',
        intensity: '🔥 High Intensity',
        duration: '50 Mins',
        calories: '600 kcal'
    },
    {
        id: 'vinyasa-flow',
        title: 'Vinyasa Power Yoga',
        category: 'mind',
        icon: 'fa-solid fa-spa',
        desc: 'Dynamic movement linked with breath to build core stability, hip mobility, and athletic recovery.',
        intensity: '🌱 Moderate',
        duration: '60 Mins',
        calories: '300 kcal'
    },
    {
        id: 'olympic-lifting',
        title: 'Olympic Weightlifting',
        category: 'strength',
        icon: 'fa-solid fa-bolt-lightning',
        desc: 'Snatch and Clean & Jerk technique breakdown with video analysis and bar speed tracking.',
        intensity: '🔥 High Intensity',
        duration: '75 Mins',
        calories: '500 kcal'
    },
    {
        id: 'spin-endurance',
        title: 'Pulse Cycle & Rhythm',
        category: 'cardio',
        icon: 'fa-solid fa-person-biking',
        desc: 'High-energy indoor cycling set to immersive bass beats with live wattage and RPM leaderboard tracking.',
        intensity: '⚡ Extreme',
        duration: '45 Mins',
        calories: '580 kcal'
    }
];

function initClassesSystem() {
    const grid = document.getElementById('classes-grid');
    const filterBtns = document.querySelectorAll('#class-category-filters .pill-btn');

    if (!grid) return;

    function renderClasses(filter = 'all') {
        grid.innerHTML = '';

        const filtered = filter === 'all' 
            ? classesData 
            : classesData.filter(c => c.category === filter);

        filtered.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card';
            card.innerHTML = `
                <div class="class-header-art">
                    <i class="${cls.icon}"></i>
                    <span class="class-category-tag">${cls.category.toUpperCase()}</span>
                </div>
                <div class="class-card-body">
                    <h3 class="class-title">${cls.title}</h3>
                    <p class="class-desc">${cls.desc}</p>

                    <div class="class-meta-grid">
                        <div class="class-meta-item"><i class="fa-solid fa-bolt"></i> ${cls.intensity}</div>
                        <div class="class-meta-item"><i class="fa-regular fa-clock"></i> ${cls.duration}</div>
                        <div class="class-meta-item"><i class="fa-solid fa-fire-flame-curved"></i> ${cls.calories}</div>
                        <div class="class-meta-item"><i class="fa-solid fa-users"></i> Max 18 Spots</div>
                    </div>

                    <button class="btn btn-secondary btn-block book-class-btn" data-class-name="${cls.title}">
                        <i class="fa-solid fa-calendar-check"></i> Book Spot Now
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Booking modal triggers
        document.querySelectorAll('.book-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-class-name');
                openClassBookingModal(name);
            });
        });
    }

    renderClasses();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderClasses(btn.getAttribute('data-class-filter'));
        });
    });
}

/* --------------------------------------------------------------------------
   5. Weekly Schedule System
   -------------------------------------------------------------------------- */
const scheduleData = {
    Monday: [
        { time: '06:00 AM - 07:00 AM', title: 'Metabolic Shred HIIT', trainer: 'Coach Marcus Vance', spots: '4 Spots Left' },
        { time: '09:00 AM - 10:00 AM', title: 'Heavy Iron Powerlifting', trainer: 'Coach Sarah Jenkins', spots: '2 Spots Left' },
        { time: '05:30 PM - 06:30 PM', title: 'Combat Boxing & Striking', trainer: 'Coach Tyson Fury', spots: 'Full (Waitlist)' },
        { time: '07:00 PM - 08:00 PM', title: 'Vinyasa Power Yoga', trainer: 'Coach Elena Rostova', spots: '6 Spots Left' }
    ],
    Tuesday: [
        { time: '07:00 AM - 08:00 AM', title: 'Olympic Weightlifting', trainer: 'Coach Sarah Jenkins', spots: '5 Spots Left' },
        { time: '12:00 PM - 01:00 PM', title: 'Pulse Cycle & Rhythm', trainer: 'Coach Alex Rivera', spots: '3 Spots Left' },
        { time: '06:00 PM - 07:00 PM', title: 'Metabolic Shred HIIT', trainer: 'Coach Marcus Vance', spots: '1 Spot Left' }
    ],
    Wednesday: [
        { time: '06:00 AM - 07:00 AM', title: 'Heavy Iron Powerlifting', trainer: 'Coach Sarah Jenkins', spots: '3 Spots Left' },
        { time: '05:30 PM - 06:30 PM', title: 'Combat Boxing & Striking', trainer: 'Coach Tyson Fury', spots: '2 Spots Left' },
        { time: '07:00 PM - 08:00 PM', title: 'Pulse Cycle & Rhythm', trainer: 'Coach Alex Rivera', spots: '5 Spots Left' }
    ],
    Thursday: [
        { time: '07:00 AM - 08:00 AM', title: 'Metabolic Shred HIIT', trainer: 'Coach Marcus Vance', spots: '6 Spots Left' },
        { time: '06:00 PM - 07:00 PM', title: 'Olympic Weightlifting', trainer: 'Coach Sarah Jenkins', spots: '4 Spots Left' }
    ],
    Friday: [
        { time: '06:00 AM - 07:00 AM', title: 'Combat Boxing & Striking', trainer: 'Coach Tyson Fury', spots: '2 Spots Left' },
        { time: '05:00 PM - 06:00 PM', title: 'Heavy Iron Powerlifting', trainer: 'Coach Sarah Jenkins', spots: '1 Spot Left' },
        { time: '06:30 PM - 07:30 PM', title: 'Vinyasa Power Yoga', trainer: 'Coach Elena Rostova', spots: '8 Spots Left' }
    ],
    Saturday: [
        { time: '08:30 AM - 09:30 AM', title: 'Pulse Cycle & Rhythm', trainer: 'Coach Alex Rivera', spots: '4 Spots Left' },
        { time: '10:00 AM - 11:30 AM', title: 'WOD Community Championship', trainer: 'All Head Coaches', spots: 'Open Access' }
    ],
    Sunday: [
        { time: '09:00 AM - 10:15 AM', title: 'Sunday Recovery & Mobility Yoga', trainer: 'Coach Elena Rostova', spots: '7 Spots Left' }
    ]
};

function initScheduleSystem() {
    const list = document.getElementById('schedule-list');
    const dayBtns = document.querySelectorAll('#schedule-days .day-btn');

    if (!list) return;

    function renderSchedule(day = 'Monday') {
        list.innerHTML = '';
        const items = scheduleData[day] || [];

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'schedule-row';
            row.innerHTML = `
                <div class="sched-time"><i class="fa-regular fa-clock"></i> ${item.time}</div>
                <div class="sched-class-title">${item.title}</div>
                <div class="sched-trainer"><i class="fa-solid fa-user-check"></i> ${item.trainer}</div>
                <button class="btn btn-xs btn-primary book-class-btn" data-class-name="${item.title}">
                    Book (${item.spots})
                </button>
            `;
            list.appendChild(row);
        });

        document.querySelectorAll('.schedule-row .book-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                openClassBookingModal(btn.getAttribute('data-class-name'));
            });
        });
    }

    renderSchedule('Monday');

    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dayBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSchedule(btn.getAttribute('data-day'));
        });
    });
}

/* --------------------------------------------------------------------------
   6. Trainers Section
   -------------------------------------------------------------------------- */
const trainersData = [
    { name: 'Sarah Jenkins', role: 'Head Powerlifting Coach', certs: 'CSCS • USA Powerlifting L2', icon: 'fa-solid fa-dumbbell' },
    { name: 'Marcus Vance', role: 'Director of HIIT & Conditioning', certs: 'NSCA-CPT • CrossFit L3', icon: 'fa-solid fa-fire' },
    { name: 'Elena Rostova', role: 'Mobility & Yoga Specialist', certs: '500-HR RYT • FRC Certified', icon: 'fa-solid fa-spa' },
    { name: 'Tyson Fury', role: 'Combat & Boxing Coach', certs: 'USA Boxing Certified Coach', icon: 'fa-solid fa-hand-back-fist' }
];

function initTrainersSystem() {
    const grid = document.getElementById('trainers-grid');
    if (!grid) return;

    trainersData.forEach(tr => {
        const card = document.createElement('div');
        card.className = 'trainer-card';
        card.innerHTML = `
            <div class="trainer-avatar-holder">
                <i class="${tr.icon}"></i>
                <span class="trainer-role-badge">${tr.role.toUpperCase()}</span>
            </div>
            <div class="trainer-card-body">
                <h3 class="trainer-name">${tr.name}</h3>
                <div class="trainer-certs">${tr.certs}</div>
                <button class="btn btn-outline btn-block book-trainer-btn" data-trainer="${tr.name}">
                    Book 1-on-1 Session
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.book-trainer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast(`1-on-1 Session request with ${btn.getAttribute('data-trainer')} submitted! We will contact you.`, 'success');
        });
    });
}

/* --------------------------------------------------------------------------
   7. Fitness Calculators (BMI, BMR, 1-Rep Max)
   -------------------------------------------------------------------------- */
function initCalculators() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.calc-tab-btn');
    const panels = document.querySelectorAll('.calc-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-calc');
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(`calc-panel-${target}`);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // 1. BMI Calculation
    const bmiBtn = document.getElementById('calc-bmi-btn');
    if (bmiBtn) {
        bmiBtn.addEventListener('click', () => {
            const weight = parseFloat(document.getElementById('bmi-weight').value);
            const height = parseFloat(document.getElementById('bmi-height').value) / 100; // to meters

            if (!weight || !height || height <= 0) return;

            const bmi = weight / (height * height);
            const bmiScore = document.getElementById('bmi-score');
            const bmiBadge = document.getElementById('bmi-badge');
            const bmiPin = document.getElementById('bmi-pin');
            const bmiExp = document.getElementById('bmi-explanation');

            bmiScore.textContent = bmi.toFixed(1);

            let pct = 0;
            if (bmi < 18.5) {
                bmiBadge.textContent = 'Underweight';
                bmiBadge.className = 'result-badge badge-under';
                bmiExp.textContent = 'You are below average weight. Consider a structured surplus strength routine.';
                pct = Math.min((bmi / 18.5) * 25, 25);
            } else if (bmi < 25) {
                bmiBadge.textContent = 'Normal Weight';
                bmiBadge.className = 'result-badge badge-normal';
                bmiExp.textContent = 'Great job! Your BMI is in the ideal healthy range. Maintain your active lifestyle!';
                pct = 25 + ((bmi - 18.5) / 6.5) * 25;
            } else if (bmi < 30) {
                bmiBadge.textContent = 'Overweight';
                bmiBadge.className = 'result-badge badge-over';
                bmiExp.textContent = 'Slightly above recommended range. Combine HIIT conditioning with high protein.';
                pct = 50 + ((bmi - 25) / 5) * 25;
            } else {
                bmiBadge.textContent = 'Obese Range';
                bmiBadge.className = 'result-badge badge-obese';
                bmiExp.textContent = 'Consider consulting our nutrition staff for a personalized metabolic plan.';
                pct = Math.min(75 + ((bmi - 30) / 10) * 25, 100);
            }

            bmiPin.style.left = `${pct}%`;
            showToast('BMI Calculation Updated!', 'info');
        });
    }

    // 2. BMR & TDEE Calculation
    const bmrBtn = document.getElementById('calc-bmr-btn');
    if (bmrBtn) {
        bmrBtn.addEventListener('click', () => {
            const age = parseFloat(document.getElementById('bmr-age').value);
            const gender = document.getElementById('bmr-gender').value;
            const weight = parseFloat(document.getElementById('bmr-weight').value);
            const height = parseFloat(document.getElementById('bmr-height').value);
            const activity = parseFloat(document.getElementById('bmr-activity').value);

            if (!age || !weight || !height) return;

            // Mifflin-St Jeor Formula
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            if (gender === 'male') {
                bmr += 5;
            } else {
                bmr -= 161;
            }

            const tdee = bmr * activity;

            document.getElementById('res-bmr').textContent = `${Math.round(bmr).toLocaleString()} kcal`;
            document.getElementById('res-tdee').textContent = `${Math.round(tdee).toLocaleString()} kcal`;
            document.getElementById('res-cut').textContent = `${Math.round(tdee - 500).toLocaleString()} kcal`;
            document.getElementById('res-bulk').textContent = `${Math.round(tdee + 400).toLocaleString()} kcal`;

            showToast('Daily Calorie & TDEE Metrics Calculated!', 'info');
        });
    }

    // 3. 1-Rep Max Calculation
    const rmBtn = document.getElementById('calc-rm-btn');
    if (rmBtn) {
        const calculate1RM = () => {
            const weight = parseFloat(document.getElementById('rm-weight').value);
            const reps = parseFloat(document.getElementById('rm-reps').value);

            if (!weight || !reps) return;

            // Brzycki Formula
            const oneRm = weight / (1.0278 - (0.0278 * reps));

            document.getElementById('rm-total').textContent = `${oneRm.toFixed(1)} kg`;

            const grid = document.getElementById('rm-table-grid');
            grid.innerHTML = '';

            const percentages = [95, 90, 85, 80, 75, 70];
            percentages.forEach(p => {
                const pWeight = (oneRm * (p / 100)).toFixed(1);
                const cell = document.createElement('div');
                cell.className = 'rm-cell';
                cell.innerHTML = `
                    <span class="rm-pct">${p}% 1RM</span>
                    <span class="rm-weight-val">${pWeight} kg</span>
                `;
                grid.appendChild(cell);
            });
        };

        rmBtn.addEventListener('click', calculate1RM);
        calculate1RM(); // initial render
    }
}

/* --------------------------------------------------------------------------
   8. Pricing & Plan Switcher
   -------------------------------------------------------------------------- */
function initPricingSystem() {
    const toggle = document.getElementById('billing-toggle');
    const proPrice = document.getElementById('price-pro');
    const vipPrice = document.getElementById('price-vip');

    if (toggle) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                // Annual (20% off)
                if (proPrice) proPrice.textContent = '47';
                if (vipPrice) vipPrice.textContent = '79';
                showToast('20% Annual Discount Applied!', 'success');
            } else {
                if (proPrice) proPrice.textContent = '59';
                if (vipPrice) vipPrice.textContent = '99';
            }
        });
    }

    document.querySelectorAll('.select-plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.getAttribute('data-plan');
            const price = btn.getAttribute('data-price');
            openClassBookingModal(`Membership Plan: ${plan} ($${price})`);
        });
    });
}

/* --------------------------------------------------------------------------
   9. Free VIP Pass Generator
   -------------------------------------------------------------------------- */
function initPassGenerator() {
    const passForm = document.getElementById('pass-form');
    const topPassBtn = document.getElementById('top-pass-trigger');
    const navTrialBtn = document.getElementById('nav-trial-btn');
    const heroPassBtn = document.getElementById('hero-pass-btn');

    const scrollToForm = () => {
        const sec = document.getElementById('contact');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    };

    if (topPassBtn) topPassBtn.addEventListener('click', scrollToForm);
    if (navTrialBtn) navTrialBtn.addEventListener('click', scrollToForm);
    if (heroPassBtn) heroPassBtn.addEventListener('click', scrollToForm);

    if (passForm) {
        passForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('pass-name').value.trim();
            const location = document.getElementById('pass-location').value;

            if (!name) return;

            const passCode = `PULSE-VIP-${Math.floor(1000 + Math.random() * 9000)}`;

            document.getElementById('qr-user-name').textContent = `Pass Holder: ${name}`;
            document.getElementById('qr-user-loc').textContent = `Location: ${location}`;
            document.getElementById('qr-pass-code').textContent = passCode;

            const qrModal = document.getElementById('qr-modal');
            if (qrModal) qrModal.classList.add('active');

            passForm.reset();
        });
    }

    const printPassBtn = document.getElementById('print-pass-btn');
    if (printPassBtn) {
        printPassBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

/* --------------------------------------------------------------------------
   10. Modal Helper System
   -------------------------------------------------------------------------- */
function initModals() {
    const classModal = document.getElementById('class-modal');
    const qrModal = document.getElementById('qr-modal');
    const closeClassBtn = document.getElementById('close-class-modal');
    const closeQrBtn = document.getElementById('close-qr-modal');

    if (closeClassBtn && classModal) {
        closeClassBtn.addEventListener('click', () => classModal.classList.remove('active'));
        classModal.addEventListener('click', (e) => {
            if (e.target === classModal) classModal.classList.remove('active');
        });
    }

    if (closeQrBtn && qrModal) {
        closeQrBtn.addEventListener('click', () => qrModal.classList.remove('active'));
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) qrModal.classList.remove('active');
        });
    }
}

function openClassBookingModal(itemTitle) {
    const modal = document.getElementById('class-modal');
    const titleElem = document.getElementById('modal-class-title');
    const bodyElem = document.getElementById('modal-class-body');

    if (!modal) return;

    titleElem.innerHTML = `<i class="fa-solid fa-calendar-check text-neon"></i> Reserve: ${itemTitle}`;
    bodyElem.innerHTML = `
        <form id="instant-reserve-form">
            <div class="form-group">
                <label>Your Full Name</label>
                <input type="text" class="form-input" placeholder="e.g. Alex Johnson" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" class="form-input" placeholder="alex@example.com" required>
            </div>
            <div class="form-group">
                <label>Preferred Time Slot</label>
                <select class="form-input">
                    <option>Morning Slot (06:00 AM - 08:00 AM)</option>
                    <option>Midday Slot (12:00 PM - 01:30 PM)</option>
                    <option selected>Evening Prime Slot (06:00 PM - 08:00 PM)</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Confirm Reservation</button>
        </form>
    `;

    modal.classList.add('active');

    const form = document.getElementById('instant-reserve-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            modal.classList.remove('active');
            showToast(`Spot reserved for ${itemTitle}! Confirmation sent to your email.`, 'success');
        });
    }
}

/* --------------------------------------------------------------------------
   11. Toast System
   -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    const iconMap = {
        info: 'fa-solid fa-circle-info text-neon',
        success: 'fa-solid fa-circle-check text-neon'
    };

    toast.innerHTML = `
        <i class="${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
