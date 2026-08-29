/* ==========================================
   NEXUSTASK PRO - PRODUCTION JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- APPLICATION STATE ---
    let state = {
        tasks: JSON.parse(localStorage.getItem('nexus_tasks')) || [
            {
                id: '1',
                title: 'Redesign Landing Page UI & UX',
                category: 'Work',
                priority: 'high',
                dueDate: '2025-10-28',
                dueTime: '17:00',
                tags: ['design', 'frontend', 'urgent'],
                description: 'Collaborate with the design team to revamp the homepage hero section and CTA buttons.',
                subtasks: [
                    { id: 'st1', text: 'Wireframe hero section', completed: true },
                    { id: 'st2', text: 'Select color palette and typography', completed: true },
                    { id: 'st3', text: 'Export SVG assets', completed: false }
                ],
                completed: false,
                starred: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Weekly Grocery Shopping',
                category: 'Personal',
                priority: 'medium',
                dueDate: '2025-10-25',
                dueTime: '12:00',
                tags: ['shopping', 'home'],
                description: 'Buy organic vegetables, almond milk, coffee beans, and whole wheat bread.',
                subtasks: [
                    { id: 'st4', text: 'Organic vegetables', completed: false },
                    { id: 'st5', text: 'Coffee beans (Dark Roast)', completed: false }
                ],
                completed: false,
                starred: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Read 2 chapters of "Atomic Habits"',
                category: 'Learning',
                priority: 'low',
                dueDate: '2025-10-30',
                dueTime: '21:00',
                tags: ['reading', 'growth'],
                description: 'Focus on the laws of behavioral change and habit stacking.',
                subtasks: [],
                completed: true,
                starred: false,
                createdAt: new Date().toISOString()
            }
        ],
        categories: JSON.parse(localStorage.getItem('nexus_categories')) || [
            { name: 'Work', color: '#6366f1' },
            { name: 'Personal', color: '#ec4899' },
            { name: 'Learning', color: '#3b82f6' }
        ],
        currentFilter: 'all', // 'all', 'today', 'upcoming', 'important', 'completed', or category name
        currentTag: 'all',
        searchQuery: '',
        sortBy: 'dueDate',
        theme: localStorage.getItem('nexus_theme') || 'dark'
    };

    // --- DOM ELEMENTS ---
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const tasksContainer = document.getElementById('tasks-container');
    const currentViewTitle = document.getElementById('current-view-title');
    const currentDateDisplay = document.getElementById('current-date-display');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const tagFiltersContainer = document.getElementById('tag-filters-container');
    const customCategoriesList = document.getElementById('custom-categories-list');
    
    // Counters
    const countAll = document.getElementById('count-all');
    const countToday = document.getElementById('count-today');
    const countUpcoming = document.getElementById('count-upcoming');
    const countImportant = document.getElementById('count-important');
    const countCompleted = document.getElementById('count-completed');
    const productivityScore = document.getElementById('productivity-score');
    const productivityProgress = document.getElementById('productivity-progress');

    // Modals
    const taskModal = document.getElementById('task-modal');
    const openTaskModalBtn = document.getElementById('open-task-modal');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskForm = document.getElementById('task-form');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskCategorySelect = document.getElementById('task-category-select');
    const taskPrioritySelect = document.getElementById('task-priority-select');
    const taskDateInput = document.getElementById('task-date-input');
    const taskTimeInput = document.getElementById('task-time-input');
    const taskTagsInput = document.getElementById('task-tags-input');
    const taskDescInput = document.getElementById('task-desc-input');
    
    // Subtask elements in Modal
    const subtaskInput = document.getElementById('subtask-input');
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    const subtaskListPreview = document.getElementById('subtask-list-preview');
    let tempSubtasks = [];

    // Category Modal
    const categoryModal = document.getElementById('category-modal');
    const openCategoryModalBtn = document.getElementById('open-category-modal');
    const closeCategoryModalBtn = document.getElementById('close-category-modal');
    const cancelCategoryBtn = document.getElementById('cancel-category-btn');
    const categoryForm = document.getElementById('category-form');
    const categoryNameInput = document.getElementById('category-name-input');
    const colorPickerOptions = document.getElementById('color-picker-options');
    let selectedCategoryColor = '#6366f1';

    // FAB
    const fabBtn = document.getElementById('fab-btn');

    // Pomodoro Elements
    const pomodoroToggleBtn = document.getElementById('pomodoro-toggle-btn');
    const pomodoroModal = document.getElementById('pomodoro-modal');
    const closePomodoro = document.getElementById('close-pomodoro');
    const pomoStartBtn = document.getElementById('pomo-start-btn');
    const pomoResetBtn = document.getElementById('pomo-reset-btn');
    const pomoTimeDisplay = document.getElementById('pomo-time-display');
    const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');
    const alarmSound = document.getElementById('alarm-sound');
    const progressRingCircle = document.querySelector('.progress-ring__circle');

    // --- INITIALIZATION ---
    function init() {
        applyTheme(state.theme);
        updateHeaderDate();
        renderCategories();
        renderTagFilters();
        renderTasks();
        updateSidebarBadges();
        setupEventListeners();
    }

    // --- THEME MANAGEMENT ---
    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        state.theme = theme;
        localStorage.setItem('nexus_theme', theme);
        const icon = themeToggleBtn.querySelector('i');
        const text = themeToggleBtn.querySelector('span');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fa-solid fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // --- DATE FORMATTING ---
    function updateHeaderDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // --- PERSISTENCE ---
    function saveState() {
        localStorage.setItem('nexus_tasks', JSON.stringify(state.tasks));
        localStorage.setItem('nexus_categories', JSON.stringify(state.categories));
        updateSidebarBadges();
        renderTagFilters();
    }

    // --- RENDER CATEGORIES ---
    function renderCategories() {
        customCategoriesList.innerHTML = '';
        taskCategorySelect.innerHTML = '';

        state.categories.forEach(cat => {
            // Sidebar list
            const li = document.createElement('li');
            li.className = `custom-category-item ${state.currentFilter === cat.name ? 'active' : ''}`;
            li.innerHTML = `
                <div class="custom-cat-left">
                    <span class="cat-dot" style="background: ${cat.color};"></span>
                    <span>${cat.name}</span>
                </div>
                <button class="delete-cat-btn" title="Delete List"><i class="fa-solid fa-trash"></i></button>
            `;
            
            li.querySelector('.custom-cat-left').addEventListener('click', () => {
                state.currentFilter = cat.name;
                highlightActiveNav();
                renderTasks();
                if(window.innerWidth <= 900) sidebar.classList.remove('mobile-open');
            });

            li.querySelector('.delete-cat-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm(`Delete list "${cat.name}" and all its tasks?`)) {
                    state.tasks = state.tasks.filter(t => t.category !== cat.name);
                    state.categories = state.categories.filter(c => c.name !== cat.name);
                    if(state.currentFilter === cat.name) state.currentFilter = 'all';
                    saveState();
                    renderCategories();
                    renderTasks();
                }
            });

            customCategoriesList.appendChild(li);

            // Modal Select option
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            taskCategorySelect.appendChild(option);
        });
    }

    // --- RENDER TAG FILTERS ---
    function renderTagFilters() {
        const allTags = new Set();
        state.tasks.forEach(t => t.tags && t.tags.forEach(tag => allTags.add(tag)));

        tagFiltersContainer.innerHTML = `
            <span class="tag-pill ${state.currentTag === 'all' ? 'active' : ''}" data-tag="all">#All Tags</span>
        `;

        allTags.forEach(tag => {
            const pill = document.createElement('span');
            pill.className = `tag-pill ${state.currentTag === tag ? 'active' : ''}`;
            pill.textContent = `#${tag}`;
            pill.addEventListener('click', () => {
                state.currentTag = tag;
                renderTagFilters();
                renderTasks();
            });
            tagFiltersContainer.appendChild(pill);
        });

        // Re-attach listener for All Tags
        tagFiltersContainer.querySelector('[data-tag="all"]').addEventListener('click', () => {
            state.currentTag = 'all';
            renderTagFilters();
            renderTasks();
        });
    }

    // --- HIGHLIGHT ACTIVE NAV ---
    function highlightActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            if(item.getAttribute('data-filter') === state.currentFilter) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        document.querySelectorAll('.custom-category-item').forEach(item => {
            const name = item.querySelector('.custom-cat-left span:nth-child(2)').textContent;
            if(name === state.currentFilter) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // --- RENDER TASKS ---
    function renderTasks() {
        tasksContainer.innerHTML = '';

        // Filter tasks
        let filtered = state.tasks.filter(task => {
            // View filter
            const todayStr = new Date().toISOString().split('T')[0];
            if (state.currentFilter === 'today' && task.dueDate !== todayStr) return false;
            if (state.currentFilter === 'upcoming') {
                if (!task.dueDate || task.dueDate <= todayStr) return false;
            }
            if (state.currentFilter === 'important' && !task.starred) return false;
            if (state.currentFilter === 'completed' && !task.completed) return false;
            if (state.currentFilter !== 'all' && state.currentFilter !== 'today' && state.currentFilter !== 'upcoming' && state.currentFilter !== 'important' && state.currentFilter !== 'completed') {
                if (task.category !== state.currentFilter) return false;
            }

            // Tag filter
            if (state.currentTag !== 'all' && (!task.tags || !task.tags.includes(state.currentTag))) return false;

            // Search query
            if (state.searchQuery) {
                const q = state.searchQuery.toLowerCase();
                const matchTitle = task.title.toLowerCase().includes(q);
                const matchDesc = task.description && task.description.toLowerCase().includes(q);
                const matchTags = task.tags && task.tags.some(t => t.toLowerCase().includes(q));
                if (!matchTitle && !matchDesc && !matchTags) return false;
            }

            return true;
        });

        // Sort tasks
        filtered.sort((a, b) => {
            if (state.sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (state.sortBy === 'priority') {
                const weights = { high: 3, medium: 2, low: 1 };
                return weights[b.priority] - weights[a.priority];
            } else if (state.sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else if (state.sortBy === 'created') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Update Header Title
        if (['all', 'today', 'upcoming', 'important', 'completed'].includes(state.currentFilter)) {
            currentViewTitle.textContent = state.currentFilter.charAt(0).toUpperCase() + state.currentFilter.slice(1) + ' Tasks';
        } else {
            currentViewTitle.textContent = state.currentFilter;
        }

        // Empty state
        if (filtered.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clipboard-check empty-state-icon"></i>
                    <h3>No tasks found</h3>
                    <p>You're all caught up! Create a new task to boost your productivity.</p>
                    <button class="primary-btn" onclick="document.getElementById('open-task-modal').click()">
                        <i class="fa-solid fa-plus"></i> Create Task
                    </button>
                </div>
            `;
            return;
        }

        // Build Task Cards
        filtered.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card ${task.completed ? 'completed' : ''}`;
            
            // Due date formatting & check overdue
            let dateBadgeHTML = '';
            if (task.dueDate) {
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = task.dueDate < todayStr && !task.completed;
                dateBadgeHTML = `<span class="task-badge due-date ${isOverdue ? 'overdue' : ''}"><i class="fa-regular fa-calendar"></i> ${task.dueDate} ${task.dueTime ? 'at ' + task.dueTime : ''}</span>`;
            }

            // Priority badge
            let priorityHTML = `<span class="task-badge priority-${task.priority}"><i class="fa-solid fa-flag"></i> ${task.priority.toUpperCase()}</span>`;

            // Subtasks HTML preview
            let subtasksHTML = '';
            if (task.subtasks && task.subtasks.length > 0) {
                const subItems = task.subtasks.map(st => `
                    <div class="subtask-item-prev ${st.completed ? 'completed' : ''}" data-subtask-id="${st.id}" data-task-id="${task.id}">
                        <i class="fa-regular ${st.completed ? 'fa-square-check' : 'fa-square'}"></i>
                        <span>${st.text}</span>
                    </div>
                `).join('');
                subtasksHTML = `<div class="task-subtasks-preview">${subItems}</div>`;
            }

            // Tags HTML
            let tagsHTML = '';
            if (task.tags && task.tags.length > 0) {
                tagsHTML = task.tags.map(t => `<span class="task-tag">#${t}</span>`).join(' ');
            }

            card.innerHTML = `
                <div class="task-checkbox-wrapper">
                    <div class="task-checkbox" data-id="${task.id}">
                        <i class="fa-solid fa-check"></i>
                    </div>
                </div>
                <div class="task-content">
                    <div class="task-header-row">
                        <h3 class="task-title">${escapeHTML(task.title)}</h3>
                        <div class="task-actions">
                            <button class="task-action-btn star ${task.starred ? 'starred' : ''}" data-id="${task.id}" title="Star Task">
                                <i class="fa-solid fa-star"></i>
                            </button>
                            <button class="task-action-btn edit" data-id="${task.id}" title="Edit Task">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="task-action-btn delete" data-id="${task.id}" title="Delete Task">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
                    ${subtasksHTML}
                    <div class="task-meta-row">
                        ${priorityHTML}
                        ${dateBadgeHTML}
                        <span class="task-badge"><i class="fa-solid fa-folder"></i> ${task.category}</span>
                        ${tagsHTML}
                    </div>
                </div>
            `;

            // Event Handlers for Task Card
            card.querySelector('.task-checkbox').addEventListener('click', () => toggleTaskComplete(task.id));
            card.querySelector('.task-action-btn.star').addEventListener('click', () => toggleTaskStar(task.id));
            card.querySelector('.task-action-btn.edit').addEventListener('click', () => openEditTaskModal(task.id));
            card.querySelector('.task-action-btn.delete').addEventListener('click', () => deleteTask(task.id));

            // Subtask check listeners
            card.querySelectorAll('.subtask-item-prev').forEach(stEl => {
                stEl.addEventListener('click', () => {
                    const stId = stEl.getAttribute('data-subtask-id');
                    toggleSubtaskComplete(task.id, stId);
                });
            });

            tasksContainer.appendChild(card);
        });
    }

    // --- TASK ACTIONS ---
    function toggleTaskComplete(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveState();
            renderTasks();
        }
    }

    function toggleTaskStar(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.starred = !task.starred;
            saveState();
            renderTasks();
        }
    }

    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            state.tasks = state.tasks.filter(t => t.id !== id);
            saveState();
            renderTasks();
        }
    }

    function toggleSubtaskComplete(taskId, subtaskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const st = task.subtasks.find(s => s.id === subtaskId);
            if (st) {
                st.completed = !st.completed;
                saveState();
                renderTasks();
            }
        }
    }

    // --- BADGES & STATS ---
    function updateSidebarBadges() {
        const todayStr = new Date().toISOString().split('T')[0];
        
        countAll.textContent = state.tasks.length;
        countToday.textContent = state.tasks.filter(t => t.dueDate === todayStr).length;
        countUpcoming.textContent = state.tasks.filter(t => t.dueDate && t.dueDate > todayStr).length;
        countImportant.textContent = state.tasks.filter(t => t.starred).length;
        countCompleted.textContent = state.tasks.filter(t => t.completed).length;

        // Productivity Score calculation
        const total = state.tasks.length;
        const completedCount = state.tasks.filter(t => t.completed).length;
        const score = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        productivityScore.textContent = `${score}%`;
        productivityProgress.style.width = `${score}%`;
    }

    // --- EVENT LISTENERS & NAVIGATION ---
    function setupEventListeners() {
        // Sidebar navigation filters
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                state.currentFilter = item.getAttribute('data-filter');
                highlightActiveNav();
                renderTasks();
                if(window.innerWidth <= 900) sidebar.classList.remove('mobile-open');
            });
        });

        // Mobile menu toggle
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });

        // Search input
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderTasks();
        });

        // Sort select
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderTasks();
        });

        // Task Modal Open / Close
        openTaskModalBtn.addEventListener('click', () => openCreateTaskModal());
        fabBtn.addEventListener('click', () => openCreateTaskModal());
        closeTaskModalBtn.addEventListener('click', closeTaskModal);
        cancelTaskBtn.addEventListener('click', closeTaskModal);

        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) closeTaskModal();
        });

        // Category Modal Open / Close
        openCategoryModalBtn.addEventListener('click', () => categoryModal.classList.add('active'));
        closeCategoryModalBtn.addEventListener('click', () => categoryModal.classList.remove('active'));
        cancelCategoryBtn.addEventListener('click', () => categoryModal.classList.remove('active'));
        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) categoryModal.classList.remove('active');
        });

        // Color dots in category modal
        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                selectedCategoryColor = dot.getAttribute('data-color');
            });
        });

        // Category Form Submit
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = categoryNameInput.value.trim();
            if (name) {
                if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                    alert('List already exists!');
                    return;
                }
                state.categories.push({ name, color: selectedCategoryColor });
                saveState();
                renderCategories();
                categoryModal.classList.remove('active');
                categoryNameInput.value = '';
            }
        });

        // Subtasks management in Task Form
        addSubtaskBtn.addEventListener('click', () => {
            const text = subtaskInput.value.trim();
            if (text) {
                tempSubtasks.push({ id: 'st_' + Date.now(), text, completed: false });
                subtaskInput.value = '';
                renderTempSubtasks();
            }
        });

        // Task Form Submit (Create or Update)
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = taskIdInput.value;
            const title = taskTitleInput.value.trim();
            const category = taskCategorySelect.value;
            const priority = taskPrioritySelect.value;
            const dueDate = taskDateInput.value;
            const dueTime = taskTimeInput.value;
            const tags = taskTagsInput.value ? taskTagsInput.value.split(',').map(t => t.trim().replace('#','')).filter(Boolean) : [];
            const description = taskDescInput.value.trim();

            if (!title) return;

            if (id) {
                // Edit
                const task = state.tasks.find(t => t.id === id);
                if (task) {
                    task.title = title;
                    task.category = category;
                    task.priority = priority;
                    task.dueDate = dueDate;
                    task.dueTime = dueTime;
                    task.tags = tags;
                    task.description = description;
                    task.subtasks = [...tempSubtasks];
                }
            } else {
                // Create
                const newTask = {
                    id: 'task_' + Date.now(),
                    title,
                    category,
                    priority,
                    dueDate,
                    dueTime,
                    tags,
                    description,
                    subtasks: [...tempSubtasks],
                    completed: false,
                    starred: false,
                    createdAt: new Date().toISOString()
                };
                state.tasks.unshift(newTask);
            }

            saveState();
            renderTasks();
            closeTaskModal();
        });

        // Pomodoro Widget controls
        pomodoroToggleBtn.addEventListener('click', () => pomodoroModal.classList.add('active'));
        closePomodoro.addEventListener('click', () => pomodoroModal.classList.remove('active'));
        
        setupPomodoroTimer();
    }

    // --- TASK MODAL HELPERS ---
    function openCreateTaskModal() {
        modalTaskTitle.textContent = 'Create New Task';
        taskIdInput.value = '';
        taskTitleInput.value = '';
        taskCategorySelect.value = state.categories[0] ? state.categories[0].name : 'Work';
        taskPrioritySelect.value = 'medium';
        taskDateInput.value = new Date().toISOString().split('T')[0];
        taskTimeInput.value = '';
        taskTagsInput.value = '';
        taskDescInput.value = '';
        tempSubtasks = [];
        renderTempSubtasks();
        taskModal.classList.add('active');
    }

    function openEditTaskModal(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            modalTaskTitle.textContent = 'Edit Task';
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskCategorySelect.value = task.category;
            taskPrioritySelect.value = task.priority;
            taskDateInput.value = task.dueDate || '';
            taskTimeInput.value = task.dueTime || '';
            taskTagsInput.value = task.tags ? task.tags.join(', ') : '';
            taskDescInput.value = task.description || '';
            tempSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));
            renderTempSubtasks();
            taskModal.classList.add('active');
        }
    }

    function closeTaskModal() {
        taskModal.classList.remove('active');
    }

    function renderTempSubtasks() {
        subtaskListPreview.innerHTML = '';
        tempSubtasks.forEach((st, idx) => {
            const li = document.createElement('li');
            li.className = 'subtask-preview-item';
            li.innerHTML = `
                <span>${escapeHTML(st.text)}</span>
                <button type="button" data-index="${idx}"><i class="fa-solid fa-xmark"></i></button>
            `;
            li.querySelector('button').addEventListener('click', () => {
                tempSubtasks.splice(idx, 1);
                renderTempSubtasks();
            });
            subtaskListPreview.appendChild(li);
        });
    }

    // --- POMODORO TIMER LOGIC ---
    let pomoTimer = null;
    let pomoDuration = 1500; // 25 mins in seconds
    let pomoTimeLeft = 1500;
    let isPomoRunning = false;
    const circleCircumference = 2 * Math.PI * 96; // r=96

    progressRingCircle.style.strokeDasharray = circleCircumference;

    function setPomodoroTime(seconds) {
        pomoDuration = seconds;
        pomoTimeLeft = seconds;
        stopPomodoro();
        updatePomoDisplay();
    }

    function updatePomoDisplay() {
        const minutes = Math.floor(pomoTimeLeft / 60);
        const seconds = pomoTimeLeft % 60;
        pomoTimeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Progress ring offset
        const offset = circleCircumference - (pomoTimeLeft / pomoDuration) * circleCircumference;
        progressRingCircle.style.strokeDashoffset = offset;
    }

    function startPomodoro() {
        if (isPomoRunning) return;
        isPomoRunning = true;
        pomoStartBtn.textContent = 'Pause';
        pomoStartBtn.classList.add('active');

        pomoTimer = setInterval(() => {
            if (pomoTimeLeft > 0) {
                pomoTimeLeft--;
                updatePomoDisplay();
            } else {
                stopPomodoro();
                alarmSound.play().catch(e => console.log('Audio play blocked:', e));
                alert('Focus session completed! Take a break.');
            }
        }, 1000);
    }

    function stopPomodoro() {
        isPomoRunning = false;
        clearInterval(pomoTimer);
        pomoStartBtn.textContent = 'Start';
        pomoStartBtn.classList.remove('active');
    }

    function setupPomodoroTimer() {
        pomoModeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                pomoModeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setPomodoroTime(parseInt(btn.getAttribute('data-time')));
            });
        });

        pomoStartBtn.addEventListener('click', () => {
            if (isPomoRunning) {
                stopPomodoro();
            } else {
                startPomodoro();
            }
        });

        pomoResetBtn.addEventListener('click', () => {
            stopPomodoro();
            pomoTimeLeft = pomoDuration;
            updatePomoDisplay();
        });

        updatePomoDisplay();
    }

    // --- UTILITY ---
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Run app
    init();
});
