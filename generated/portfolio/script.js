/* ==========================================================================
   ALEX RIVERA PORTFOLIO - MASTER INTERACTIVE JAVASCRIPT
   Canvas Particle Engine, Web Audio API Sound System, Dynamic Projects,
   Command Palette, Theme Engine & Code Sandbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize All Subsystems
    initThemeEngine();
    initAudioSystem();
    initBackgroundCanvas();
    initTypingEffect();
    initLiveClock();
    initStatsCounter();
    initNavigation();
    initAboutTabs();
    initSkillsSystem();
    initCodePlayground();
    initProjectsSystem();
    initExperienceTabs();
    initTestimonialsSystem();
    initContactForm();
    initCommandPalette();
    initCVModal();
    init3DTilt();
});

/* --------------------------------------------------------------------------
   1. Theme Management System
   -------------------------------------------------------------------------- */
function initThemeEngine() {
    const themeBtn = document.getElementById('theme-menu-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOpts = document.querySelectorAll('.theme-opt');

    // Load saved theme
    const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';
    setTheme(savedTheme);

    if (themeBtn && themeMenu) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('show');
            playUiSound('click');
        });

        document.addEventListener('click', (e) => {
            if (!themeMenu.contains(e.target) && !themeBtn.contains(e.target)) {
                themeMenu.classList.remove('show');
            }
        });
    }

    themeOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            const theme = opt.getAttribute('data-set-theme');
            setTheme(theme);
            themeMenu.classList.remove('show');
            playUiSound('switch');
            showToast(`Theme changed to ${opt.textContent.trim()}`, 'info');
        });
    });
}

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('portfolio_theme', themeName);

    document.querySelectorAll('.theme-opt').forEach(opt => {
        if (opt.getAttribute('data-set-theme') === themeName) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

/* --------------------------------------------------------------------------
   2. Web Audio API Sound System (No external audio files required!)
   -------------------------------------------------------------------------- */
let audioCtx = null;
let soundMuted = true; // Default muted for clean UX, toggleable

function initAudioSystem() {
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');

    if (soundToggleBtn && soundIcon) {
        soundToggleBtn.addEventListener('click', () => {
            soundMuted = !soundMuted;
            if (!soundMuted && !audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) audioCtx = new AudioContext();
            }

            if (soundMuted) {
                soundIcon.className = 'fa-solid fa-volume-xmark';
                soundToggleBtn.classList.remove('active');
                showToast('Audio feedback disabled', 'info');
            } else {
                soundIcon.className = 'fa-solid fa-volume-high text-primary';
                soundToggleBtn.classList.add('active');
                playUiSound('click');
                showToast('Audio feedback enabled', 'info');
            }
        });
    }

    // Attach sound triggers to interactive elements
    document.querySelectorAll('button, a, .skill-card, .project-card').forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            if (!soundMuted) playUiSound('hover');
        });
    });
}

function playUiSound(type) {
    if (soundMuted) return;
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
            gain.gain.setValueAtTime(0.015, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'switch') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    } catch (e) {
        // Silently catch audio restrictions
    }
}

/* --------------------------------------------------------------------------
   3. Background Particle & Interactive Canvas
   -------------------------------------------------------------------------- */
function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 25), 55);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw grid lines subtly
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        const gridSize = 60;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Particle updates
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
                    ctx.stroke();
                }
            }

            // Mouse proximity repulsion
            if (mouse.x && mouse.y) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.25 * (1 - dist / mouse.radius)})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* --------------------------------------------------------------------------
   4. Hero Typing Animation
   -------------------------------------------------------------------------- */
function initTypingEffect() {
    const typingElem = document.getElementById('typing-text');
    if (!typingElem) return;

    const roles = [
        "Senior Full Stack Engineer",
        "Cloud Microservices Architect",
        "React & TypeScript Specialist",
        "Creative Developer & Tech Lead",
        "Open Source Contributor"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElem.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingElem.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 90;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 2200; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 400;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* --------------------------------------------------------------------------
   5. Live Timezone Clock
   -------------------------------------------------------------------------- */
function initLiveClock() {
    const liveTimeElem = document.getElementById('live-time');
    if (!liveTimeElem) return;

    function updateClock() {
        const now = new Date();
        const options = {
            timeZone: 'America/Los_Angeles',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
        liveTimeElem.textContent = `${timeStr} PST`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* --------------------------------------------------------------------------
   6. Animated Counter Stats
   -------------------------------------------------------------------------- */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNumbers.forEach(numElem => {
                    const target = parseFloat(numElem.getAttribute('data-target'));
                    const decimals = parseInt(numElem.getAttribute('data-decimals') || '0', 10);
                    const duration = 2000; // ms
                    const startTime = performance.now();

                    function countStep(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease out cubic
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const currentVal = target * easeProgress;

                        numElem.textContent = currentVal.toFixed(decimals);

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
   7. Navigation Header & Active Scroll Observer
   -------------------------------------------------------------------------- */
function initNavigation() {
    const header = document.getElementById('header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // Header scroll background shrink
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('show');
            playUiSound('click');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('show');
            });
        });
    }

    // Scroll active link highlight
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) correspondingLink.classList.add('active');
            }
        });
    });

    // Back to top action
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            playUiSound('click');
        });
    }
}

/* --------------------------------------------------------------------------
   8. About Section Tabs
   -------------------------------------------------------------------------- */
function initAboutTabs() {
    const tabBtns = document.querySelectorAll('.about-tab-btn');
    const tabContents = document.querySelectorAll('.about-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetElem = document.getElementById(`tab-${targetTab}`);
            if (targetElem) targetElem.classList.add('active');

            playUiSound('click');
        });
    });
}

/* --------------------------------------------------------------------------
   9. Skills System & Filtering
   -------------------------------------------------------------------------- */
const skillsData = [
    { name: 'React / Next.js', category: 'frontend', icon: 'fa-brands fa-react', level: 95, exp: '7 Yrs' },
    { name: 'TypeScript', category: 'frontend', icon: 'fa-solid fa-code', level: 92, exp: '6 Yrs' },
    { name: 'Vue.js / Nuxt', category: 'frontend', icon: 'fa-brands fa-vuejs', level: 85, exp: '4 Yrs' },
    { name: 'Tailwind / CSS3', category: 'frontend', icon: 'fa-brands fa-css3-alt', level: 96, exp: '8 Yrs' },
    { name: 'Node.js & Express', category: 'backend', icon: 'fa-brands fa-node-js', level: 92, exp: '7 Yrs' },
    { name: 'Python / FastAPI', category: 'backend', icon: 'fa-brands fa-python', level: 88, exp: '5 Yrs' },
    { name: 'PostgreSQL & SQL', category: 'backend', icon: 'fa-solid fa-database', level: 90, exp: '6 Yrs' },
    { name: 'GraphQL & REST', category: 'backend', icon: 'fa-solid fa-network-wired', level: 89, exp: '5 Yrs' },
    { name: 'Docker & Containers', category: 'devops', icon: 'fa-brands fa-docker', level: 86, exp: '5 Yrs' },
    { name: 'AWS & Cloud Infrastructure', category: 'devops', icon: 'fa-brands fa-aws', level: 84, exp: '4 Yrs' },
    { name: 'CI/CD & GitHub Actions', category: 'devops', icon: 'fa-brands fa-git-alt', level: 88, exp: '6 Yrs' },
    { name: 'Figma & UI/UX Systems', category: 'design', icon: 'fa-brands fa-figma', level: 85, exp: '6 Yrs' }
];

function initSkillsSystem() {
    const container = document.getElementById('skills-container');
    const filterBtns = document.querySelectorAll('.skill-tab');
    if (!container) return;

    renderSkills('all');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            renderSkills(filter);
            playUiSound('click');
        });
    });
}

function renderSkills(filterCategory) {
    const container = document.getElementById('skills-container');
    container.innerHTML = '';

    const filtered = filterCategory === 'all' 
        ? skillsData 
        : skillsData.filter(s => s.category === filterCategory);

    filtered.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
            <div class="skill-header">
                <div class="skill-icon-wrap"><i class="${skill.icon}"></i></div>
                <div>
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-level-text">${skill.level}% Proficiency</div>
                </div>
            </div>
            <div class="skill-progress-bg">
                <div class="skill-progress-bar" style="width: 0%" data-width="${skill.level}%"></div>
            </div>
            <div class="skill-footer-info">
                <span>Experience: ${skill.exp}</span>
                <span>Production Ready</span>
            </div>
        `;
        container.appendChild(card);
    });

    // Animate skill bars into place
    setTimeout(() => {
        document.querySelectorAll('.skill-progress-bar').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
        });
    }, 100);
}

/* --------------------------------------------------------------------------
   10. Interactive Code Sandbox
   -------------------------------------------------------------------------- */
function initCodePlayground() {
    const runBtn = document.getElementById('run-code-btn');
    const resetBtn = document.getElementById('reset-code-btn');
    const textarea = document.getElementById('code-input');
    const outputScreen = document.getElementById('code-output');

    if (!runBtn || !textarea || !outputScreen) return;

    const initialCode = textarea.value;

    runBtn.addEventListener('click', () => {
        playUiSound('click');
        const code = textarea.value;
        outputScreen.textContent = '> Running script...\n';

        setTimeout(() => {
            let logs = [];
            const customConsole = {
                log: (...args) => {
                    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' '));
                },
                error: (...args) => {
                    logs.push(`[ERROR] ${args.join(' ')}`);
                }
            };

            try {
                // Execute in safe function scope passing mocked console
                const runScript = new Function('console', code);
                runScript(customConsole);

                if (logs.length > 0) {
                    outputScreen.textContent = logs.join('\n');
                } else {
                    outputScreen.textContent = '> Script executed successfully with no output.';
                }
                playUiSound('success');
            } catch (err) {
                outputScreen.textContent = `> Execution Error:\n${err.message}`;
            }
        }, 150);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            textarea.value = initialCode;
            outputScreen.textContent = '> Console cleared. Click "Run Script" to execute.';
            playUiSound('click');
        });
    }
}

/* --------------------------------------------------------------------------
   11. Projects Grid, Filtering & Modal System
   -------------------------------------------------------------------------- */
const projectsData = [
    {
        id: 'nexus-cloud',
        title: 'Nexus Cloud AI Platform',
        category: 'webapp',
        desc: 'AI-driven infrastructure analytics dashboard with real-time log ingestion, anomaly prediction, and automated cluster scaling.',
        tags: ['React', 'Next.js', 'Node.js', 'Python AI', 'PostgreSQL', 'Tailwind'],
        stars: '240',
        liveUrl: 'https://example.com/nexus',
        githubUrl: 'https://github.com/example/nexus-cloud',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        highlights: [
            'Injected 50,000+ metrics/sec using WebSockets & Web Workers',
            'Implemented LLM-backed incident detection reducing downtime by 30%',
            'Custom canvas chart visualizer for high-frequency time-series data'
        ]
    },
    {
        id: 'aura-ui',
        title: 'Aura Design System & Component Kit',
        category: 'uiux',
        desc: 'Accessible, unstyled, headless UI system built for modern web applications with 40+ accessible React components.',
        tags: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook', 'Figma'],
        stars: '1.2k',
        liveUrl: 'https://example.com/aura',
        githubUrl: 'https://github.com/example/aura-ui',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
        highlights: [
            'Full WCAG AAA accessibility compliance with automated unit test suites',
            'Over 300,000 monthly downloads across npm ecosystem',
            'Lightweight bundle footprint under 8kB gzipped'
        ]
    },
    {
        id: 'omnitask-pro',
        title: 'OmniTask Pro Collaboration Suite',
        category: 'webapp',
        desc: 'Real-time kanban & gantt project manager with dynamic multi-user cursors, video rooms, and automated Jira integrations.',
        tags: ['Vue.js', 'TypeScript', 'GraphQL', 'WebSockets', 'Redis', 'Docker'],
        stars: '480',
        liveUrl: 'https://example.com/omnitask',
        githubUrl: 'https://github.com/example/omnitask',
        gradient: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7e22ce 100%)',
        highlights: [
            'Operational Transformation algorithm supporting 100+ concurrent editors',
            'Sub-50ms sync latency powered by Redis Pub/Sub channels',
            'Integrated Markdown editor with drag-and-drop file storage'
        ]
    },
    {
        id: 'pulse-pay',
        title: 'Pulse Pay Fintech Dashboard',
        category: 'fintech',
        desc: 'Next-generation cross-border payment gateway with multi-currency wallet tracking and instant settlement analytics.',
        tags: ['Next.js', 'React', 'FastAPI', 'PostgreSQL', 'Stripe API', 'Chart.js'],
        stars: '310',
        liveUrl: 'https://example.com/pulse',
        githubUrl: 'https://github.com/example/pulse-pay',
        gradient: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
        highlights: [
            'PCI-DSS compliant architecture with AES-256 end-to-end encryption',
            'Processed over $15M in cross-border settlements during beta launch',
            'Exportable PDF ledger and tax transaction summaries'
        ]
    },
    {
        id: 'devsphere-cli',
        title: 'DevSphere Terminal Productivity CLI',
        category: 'opensource',
        desc: 'Developer tool for rapid boilerplate generation, cloud environment provisioning, and automated Docker container orchestration.',
        tags: ['Node.js', 'TypeScript', 'CLI', 'Docker API', 'GitHub Actions'],
        stars: '850',
        liveUrl: 'https://example.com/devsphere',
        githubUrl: 'https://github.com/example/devsphere-cli',
        gradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)',
        highlights: [
            'Spawns full stack dev environment in less than 3 seconds',
            'Used by over 4,000 developers worldwide in daily workflows',
            'Plugin ecosystem supporting custom deployment pipelines'
        ]
    },
    {
        id: 'vivid-canvas',
        title: 'Vivid WebGL Generative Studio',
        category: 'uiux',
        desc: 'Creative coding laboratory utilizing WebGL fragment shaders to generate real-time ambient interactive art for web applications.',
        tags: ['Three.js', 'WebGL', 'GLSL Shaders', 'JavaScript', 'CSS3'],
        stars: '620',
        liveUrl: 'https://example.com/vivid',
        githubUrl: 'https://github.com/example/vivid-canvas',
        gradient: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #be123c 100%)',
        highlights: [
            '60 FPS render performance across mobile and desktop GPUs',
            'Custom audio visualizer reacting to microphone input frequencies',
            'Export high-resolution 4K canvas renders instantly'
        ]
    }
];

function initProjectsSystem() {
    const grid = document.getElementById('projects-grid');
    const filterBtns = document.querySelectorAll('.proj-filter-btn');
    const searchInput = document.getElementById('project-search');
    const clearSearchBtn = document.getElementById('clear-search');

    if (!grid) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function filterAndRender() {
        const filtered = projectsData.filter(proj => {
            const matchesFilter = activeFilter === 'all' || proj.category === activeFilter;
            const matchesSearch = searchQuery === '' || 
                proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proj.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesFilter && matchesSearch;
        });

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 12px; color: var(--accent-primary);"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your search criteria or filter tab.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-preview" style="background: ${proj.gradient}">
                    <svg class="project-graphic-svg" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="150" cy="90" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
                        <circle cx="150" cy="90" r="40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-dasharray="6 4" stroke-width="2"/>
                        <path d="M 120 90 L 180 90 M 150 60 L 150 120" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                        <text x="150" y="150" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="12" opacity="0.8">${proj.title.toUpperCase()}</text>
                    </svg>
                    <span class="project-category-badge">${proj.category.toUpperCase()}</span>
                    <span class="project-stars-badge"><i class="fa-solid fa-star"></i> ${proj.stars}</span>
                </div>
                <div class="project-body">
                    <h3 class="project-title">${proj.title}</h3>
                    <p class="project-desc">${proj.desc}</p>
                    <div class="project-tech-tags">
                        ${proj.tags.map(t => `<span class="project-tech-tag">${t}</span>`).join('')}
                    </div>
                    <div class="project-footer-actions">
                        <button class="btn btn-xs btn-primary open-proj-detail" data-proj-id="${proj.id}">
                            <i class="fa-solid fa-circle-info"></i> View Details
                        </button>
                        <div class="project-links-group">
                            <a href="${proj.githubUrl}" target="_blank" rel="noopener" class="project-link-btn" title="GitHub Repo">
                                <i class="fa-brands fa-github"></i>
                            </a>
                            <a href="${proj.liveUrl}" target="_blank" rel="noopener" class="project-link-btn" title="Live Demo">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Attach modal trigger click listeners
        document.querySelectorAll('.open-proj-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-proj-id');
                openProjectModal(id);
                playUiSound('click');
            });
        });
    }

    filterAndRender();

    // Filter Button Clicks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-proj-filter');
            filterAndRender();
            playUiSound('click');
        });
    });

    // Search Input Typing
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }
            filterAndRender();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            filterAndRender();
            playUiSound('click');
        });
    }
}

function openProjectModal(projectId) {
    const proj = projectsData.find(p => p.id === projectId);
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('project-modal-body');
    const closeBtn = document.getElementById('close-project-modal');

    if (!proj || !modal || !modalBody) return;

    modalBody.innerHTML = `
        <div style="background: ${proj.gradient}; padding: 30px; border-radius: var(--radius-md); margin-bottom: 24px; color: #ffffff; text-align: center;">
            <span style="font-family: var(--font-mono); font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 10px;">${proj.category.toUpperCase()}</span>
            <h2 style="font-size: 2rem; margin-bottom: 8px;">${proj.title}</h2>
            <p style="opacity: 0.9; max-width: 600px; margin: 0 auto; font-size: 0.95rem;">${proj.desc}</p>
        </div>

        <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--accent-primary);">Key Architectural Highlights</h4>
            <ul style="list-style-type: square; padding-left: 20px; color: var(--text-muted); font-size: 0.92rem; display: flex; flex-direction: column; gap: 8px;">
                ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </div>

        <div style="margin-bottom: 24px;">
            <h4 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--accent-primary);">Technology Stack</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${proj.tags.map(t => `<span style="font-family: var(--font-mono); font-size: 0.8rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); padding: 5px 12px; border-radius: 6px; color: var(--text-main);">${t}</span>`).join('')}
            </div>
        </div>

        <div style="display: flex; gap: 14px; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 20px;">
            <a href="${proj.githubUrl}" target="_blank" rel="noopener" class="btn btn-outline">
                <i class="fa-brands fa-github"></i> Repository
            </a>
            <a href="${proj.liveUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo Preview
            </a>
        </div>
    `;

    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

/* --------------------------------------------------------------------------
   12. Experience Tabs
   -------------------------------------------------------------------------- */
function initExperienceTabs() {
    const tabBtns = document.querySelectorAll('.exp-tab-btn');
    const tabPanels = document.querySelectorAll('.exp-tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-exp-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(`exp-${target}`);
            if (targetPanel) targetPanel.classList.add('active');

            playUiSound('click');
        });
    });
}

/* --------------------------------------------------------------------------
   13. Testimonials & Dynamic Review Submission
   -------------------------------------------------------------------------- */
const initialTestimonials = [
    {
        name: 'Sarah Jenkins',
        role: 'VP of Product @ TechScale',
        text: 'Alex delivered our Next.js cloud platform 2 weeks ahead of schedule. His attention to architecture, speed, and user experience is second to none.',
        rating: 5,
        avatar: 'SJ'
    },
    {
        name: 'Marcus Vance',
        role: 'CTO @ FinPulse',
        text: 'Working with Alex was a game-changer for our fintech dashboard. He rebuilt our entire real-time visualization layer with precision and speed.',
        rating: 5,
        avatar: 'MV'
    },
    {
        name: 'Elena Rostova',
        role: 'Design Director @ Studio A',
        text: 'Rarely do you find a Full Stack Developer who deeply respects UI design details like Alex. The design system he created exceeded all expectations.',
        rating: 5,
        avatar: 'ER'
    }
];

function initTestimonialsSystem() {
    const grid = document.getElementById('testimonials-grid');
    const openModalBtn = document.getElementById('open-testimonial-modal');
    const modal = document.getElementById('testimonial-modal');
    const closeModalBtn = document.getElementById('close-testimonial-modal');
    const form = document.getElementById('testimonial-form');

    if (!grid) return;

    function renderTestimonials() {
        grid.innerHTML = '';
        initialTestimonials.forEach(t => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="quote-icon"><i class="fa-solid fa-quote-left"></i></div>
                <div class="rating-stars">
                    ${'<i class="fa-solid fa-star"></i>'.repeat(t.rating)}
                </div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">${t.avatar}</div>
                    <div class="author-info">
                        <h4>${t.name}</h4>
                        <p>${t.role}</p>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderTestimonials();

    // Modal controls
    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.add('active');
            playUiSound('click');
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // Interactive Star Rating selection in form
    const starOpts = document.querySelectorAll('.rating-stars-input .star-opt');
    let selectedRating = 5;

    starOpts.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-rating'), 10);
            starOpts.forEach(s => {
                const r = parseInt(s.getAttribute('data-rating'), 10);
                if (r <= selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            playUiSound('click');
        });
    });

    // Form Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('review-name').value.trim();
            const role = document.getElementById('review-role').value.trim();
            const text = document.getElementById('review-text').value.trim();

            if (!name || !role || !text) return;

            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

            initialTestimonials.unshift({
                name,
                role,
                text,
                rating: selectedRating,
                avatar: initials || 'U'
            });

            renderTestimonials();
            modal.classList.remove('active');
            form.reset();
            playUiSound('success');
            showToast('Thank you! Your endorsement has been added live.', 'success');
        });
    }
}

/* --------------------------------------------------------------------------
   14. Contact Form System
   -------------------------------------------------------------------------- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const copyEmailBtn = document.getElementById('copy-email-btn');

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = copyEmailBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                showToast('Email address copied to clipboard!', 'success');
                playUiSound('click');
            });
        });
    }

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const msgInput = document.getElementById('contact-message');
        const submitBtn = document.getElementById('submit-form-btn');

        let isValid = true;

        // Reset errors
        [nameInput, emailInput, msgInput].forEach(i => {
            if (i) i.parentElement.classList.remove('has-error');
        });

        if (!nameInput.value.trim()) {
            nameInput.parentElement.classList.add('has-error');
            isValid = false;
        }

        if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
            emailInput.parentElement.classList.add('has-error');
            isValid = false;
        }

        if (!msgInput.value.trim()) {
            msgInput.parentElement.classList.add('has-error');
            isValid = false;
        }

        if (!isValid) {
            playUiSound('click');
            return;
        }

        // Simulate submission
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...`;

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Message Sent Successfully!</span> <i class="fa-solid fa-check"></i>`;
            submitBtn.classList.remove('btn-primary');
            submitBtn.style.background = 'var(--accent-emerald)';

            playUiSound('success');
            showToast('Message sent! Alex will get back to you within 24 hours.', 'success');

            form.reset();

            setTimeout(() => {
                submitBtn.innerHTML = `<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>`;
                submitBtn.classList.add('btn-primary');
                submitBtn.style.background = '';
            }, 4000);
        }, 1200);
    });
}

/* --------------------------------------------------------------------------
   15. Command Palette (Ctrl+K / Cmd+K)
   -------------------------------------------------------------------------- */
function initCommandPalette() {
    const cmdTrigger = document.getElementById('cmd-trigger');
    const modal = document.getElementById('cmd-modal');
    const input = document.getElementById('cmd-input');
    const resultsContainer = document.getElementById('cmd-results');

    if (!modal || !input || !resultsContainer) return;

    const commands = [
        { label: 'Jump to Home Section', icon: 'fa-solid fa-house', action: () => scrollToSection('#home') },
        { label: 'Jump to About Section', icon: 'fa-solid fa-user', action: () => scrollToSection('#about') },
        { label: 'Jump to Skills & Arsenal', icon: 'fa-solid fa-code', action: () => scrollToSection('#skills') },
        { label: 'Jump to Projects Showcase', icon: 'fa-solid fa-layer-group', action: () => scrollToSection('#projects') },
        { label: 'Jump to Work Experience', icon: 'fa-solid fa-briefcase', action: () => scrollToSection('#experience') },
        { label: 'Jump to Contact & Hire Me', icon: 'fa-solid fa-paper-plane', action: () => scrollToSection('#contact') },
        { label: 'Open Interactive Curriculum Vitae', icon: 'fa-solid fa-file-pdf', action: () => document.getElementById('open-cv-modal').click() },
        { label: 'Switch to Dark Cyberpunk Theme', icon: 'fa-solid fa-palette', action: () => setTheme('dark') },
        { label: 'Switch to Midnight Glass Theme', icon: 'fa-solid fa-palette', action: () => setTheme('midnight') },
        { label: 'Switch to Obsidian Gold Theme', icon: 'fa-solid fa-palette', action: () => setTheme('gold') },
        { label: 'Switch to Neon Sunset Theme', icon: 'fa-solid fa-palette', action: () => setTheme('sunset') },
        { label: 'Switch to Clean Light Theme', icon: 'fa-solid fa-palette', action: () => setTheme('light') },
        { label: 'Toggle UI Sound Effects', icon: 'fa-solid fa-volume-high', action: () => document.getElementById('sound-toggle-btn').click() }
    ];

    function renderCmds(query = '') {
        resultsContainer.innerHTML = '';
        const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

        if (filtered.length === 0) {
            resultsContainer.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.88rem;">No matching commands found.</div>`;
            return;
        }

        filtered.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = `cmd-item ${idx === 0 ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="cmd-item-left">
                    <i class="${cmd.icon}"></i>
                    <span>${cmd.label}</span>
                </div>
                <span class="cmd-shortcut">Enter ↵</span>
            `;

            item.addEventListener('click', () => {
                cmd.action();
                closePalette();
                playUiSound('click');
            });

            resultsContainer.appendChild(item);
        });
    }

    function openPalette() {
        modal.classList.add('active');
        input.value = '';
        renderCmds();
        setTimeout(() => input.focus(), 100);
        playUiSound('click');
    }

    function closePalette() {
        modal.classList.remove('active');
    }

    function scrollToSection(selector) {
        const target = document.querySelector(selector);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    }

    if (cmdTrigger) cmdTrigger.addEventListener('click', openPalette);

    // Global Shortcut Listener (Ctrl+K or Cmd+K)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (modal.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        } else if (e.key === 'Escape' && modal.classList.contains('active')) {
            closePalette();
        }
    });

    input.addEventListener('input', (e) => {
        renderCmds(e.target.value);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePalette();
    });
}

/* --------------------------------------------------------------------------
   16. CV Modal & Printable Action
   -------------------------------------------------------------------------- */
function initCVModal() {
    const openBtns = [document.getElementById('open-cv-modal'), document.getElementById('sidebar-cv-btn')];
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('close-cv-modal');
    const printBtn = document.getElementById('print-cv-btn');

    if (!modal) return;

    openBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                playUiSound('click');
            });
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

/* --------------------------------------------------------------------------
   17. 3D Tilt Hover Effect for Hero Avatar
   -------------------------------------------------------------------------- */
function init3DTilt() {
    const card = document.getElementById('avatar-card');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (centerY - y) / 12;
        const rotateY = (x - centerX) / 12;

        const inner = card.querySelector('.avatar-card-inner');
        if (inner) {
            inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.avatar-card-inner');
        if (inner) {
            inner.style.transform = `rotateX(0deg) rotateY(0deg)`;
        }
    });
}

/* --------------------------------------------------------------------------
   18. Toast Notification Helper
   -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    const iconMap = {
        info: 'fa-solid fa-circle-info text-primary',
        success: 'fa-solid fa-circle-check text-success',
        warning: 'fa-solid fa-triangle-exclamation text-warning'
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
