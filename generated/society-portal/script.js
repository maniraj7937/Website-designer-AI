// ================= SOCIETY MANAGEMENT APP STATE & LOGIC ================= //

// Mock Database
let state = {
    residents: [
        { id: 1, wing: 'Wing A', flat: '101', name: 'Alice Smith', phone: '+91 98765 11223', type: 'Owner', vehicles: 'MH-12-CC-4521', status: 'Paid' },
        { id: 2, wing: 'Wing B', flat: '203', name: 'Rajesh Kumar', phone: '+91 98765 22334', type: 'Owner', vehicles: 'MH-14-EF-8899', status: 'Paid' },
        { id: 3, wing: 'Wing C', flat: '302', name: 'David Miller', phone: '+91 98765 33445', type: 'Tenant', vehicles: 'MH-12-XY-1002', status: 'Pending' },
        { id: 4, wing: 'Wing D', flat: '102', name: 'Priya Sharma', phone: '+91 98765 44556', type: 'Owner', vehicles: 'MH-12-AB-9988', status: 'Paid' },
        { id: 5, wing: 'Wing B', flat: '404', name: 'Robert Fox', phone: '+91 98765 55667', type: 'Owner', vehicles: 'MH-12-ZZ-3344', status: 'Defaulter' },
        { id: 6, wing: 'Wing A', flat: '202', name: 'Anita Desai', phone: '+91 98765 66778', type: 'Tenant', vehicles: 'None', status: 'Paid' }
    ],
    bills: [
        { id: 'BILL-901', flat: 'Wing A-101', name: 'Alice Smith', month: 'November 2024', amount: 4500, status: 'Paid' },
        { id: 'BILL-902', flat: 'Wing B-203', name: 'Rajesh Kumar', month: 'November 2024', amount: 4500, status: 'Paid' },
        { id: 'BILL-903', flat: 'Wing C-302', name: 'David Miller', month: 'November 2024', amount: 4500, status: 'Pending' },
        { id: 'BILL-904', flat: 'Wing B-404', name: 'Robert Fox', month: 'October & November', amount: 9000, status: 'Overdue' }
    ],
    complaints: [
        { id: 'CMP-101', flat: 'Wing A-304', title: 'Water Leakage in Terrace duct', category: 'Plumbing', status: 'Pending', date: 'Yesterday, 2:30 PM', desc: 'Water is dripping from the common terrace pipe near flat 304 lobby.' },
        { id: 'CMP-102', flat: 'Wing B-102', title: 'Parking light not working', category: 'Electrical', status: 'Pending', date: 'Today, 9:15 AM', desc: 'Basement B-2 pillar 4 light tube needs replacement.' },
        { id: 'CMP-103', flat: 'Wing C-201', title: 'Elevator intermittent noise', category: 'Lift AMC', status: 'In Progress', date: '2 days ago', desc: 'Lift #1 makes squeaking sound on floor 2.' },
        { id: 'CMP-104', flat: 'Wing D-402', title: 'Intercom connection error', category: 'Security', status: 'Resolved', date: '3 days ago', desc: 'Gate security desk cannot connect to flat intercom.' }
    ],
    notices: [
        { id: 1, title: 'Annual General Body Meeting (AGM) 2024', category: 'Meeting & AGM', date: '28th Oct 2024', author: 'Secretary Eleanor', body: 'Notice is hereby given that the 12th AGM will be held in the clubhouse at 10:00 AM. Attendance is mandatory for all primary members.' },
        { id: 2, title: 'Scheduled Water Supply Interruption', category: 'Maintenance & Repair', date: '15th Oct 2024', author: 'Secretary Eleanor', body: 'Municipal corporation has announced pipeline maintenance. Water supply will be off between 10 AM to 4 PM on coming Thursday.' },
        { id: 3, title: 'Diwali Celebration & Society Dinner', category: 'General Announcement', date: '01st Nov 2024', author: 'Cultural Committee', body: 'Join us for community rangoli competition followed by gala dinner in the central lawn starting 7 PM.' }
    ],
    bookings: [
        { id: 'BK-401', amenity: 'Clubhouse AC Hall', flat: 'Wing A-101', name: 'Alice Smith', date: '25th Nov 2024', status: 'Approved' },
        { id: 'BK-402', amenity: 'Party Lawn & Gazebo', flat: 'Wing C-302', name: 'David Miller', date: '02nd Dec 2024', status: 'Pending' },
        { id: 'BK-403', amenity: 'Indoor Badminton Court', flat: 'Wing B-203', name: 'Rajesh Kumar', date: '20th Nov 2024', status: 'Approved' }
    ],
    visitors: [
        { id: 'VIS-701', name: 'Suresh Kumar', purpose: 'Amazon Delivery', flat: 'Wing A-101', inTime: '10:15 AM', status: 'Inside' },
        { id: 'VIS-702', name: 'Manoj Tiwari', purpose: 'Electrician (AC Repair)', flat: 'Wing B-203', inTime: '11:00 AM', status: 'Inside' },
        { id: 'VIS-703', name: 'Anita Rao', purpose: 'Guest / Personal', flat: 'Wing C-302', inTime: 'Yesterday, 6:30 PM', status: 'Exited' }
    ],
    expenses: [
        { id: 'EXP-501', category: 'Security & Staff Salary', desc: 'October Security Guard & Supervisor Salaries', date: '01 Nov 2024', amount: 125000, approvedBy: 'Secretary Eleanor' },
        { id: 'EXP-502', category: 'Electricity & Common Utilities', desc: 'Common Area & Pump Electricity Bill (MSEB)', date: '05 Nov 2024', amount: 34200, approvedBy: 'Treasurer' },
        { id: 'EXP-503', category: 'Lift Maintenance & AMC', desc: 'Schindler Elevator Monthly AMC Service', date: '10 Nov 2024', amount: 26300, approvedBy: 'Secretary Eleanor' }
    ]
};

// Initialize App on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    renderResidents();
    renderBills();
    renderComplaints();
    renderNotices();
    renderBookings();
    renderVisitors();
    renderExpenses();
    setupMobileSidebar();
});

// Sidebar Mobile Toggle
function setupMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebar = document.getElementById('closeSidebar');

    menuBtn.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
    });
}

// Tab Switching Logic
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // Show target tab
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.remove('hidden');

    // Update Nav links active state
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active-tab');
        el.classList.add('hover:bg-slate-800', 'hover:text-white');
    });

    event.currentTarget.classList.add('active-tab');
    event.currentTarget.classList.remove('hover:bg-slate-800', 'hover:text-white');

    // Update Header Page Title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'residents': 'Residents & Flats Directory',
        'maintenance': 'Maintenance Bills & Collections',
        'complaints': 'Helpdesk & Grievance Tickets',
        'notices': 'Society Circulars & Notices',
        'amenities': 'Clubhouse & Amenity Bookings',
        'visitors': 'Gate Security & Visitor Logs',
        'finances': 'Society Funds & Expense Ledger'
    };
    document.getElementById('pageTitle').innerText = titles[tabName] || 'Portal';

    // Close mobile sidebar if open
    document.getElementById('sidebar').classList.add('-translate-x-full');
}

// Header Dropdowns Toggle
function toggleQuickActions() {
    const dd = document.getElementById('quickActionDropdown');
    dd.classList.toggle('hidden');
    document.getElementById('notificationDropdown').classList.add('hidden');
}

function toggleNotifications() {
    const dd = document.getElementById('notificationDropdown');
    dd.classList.toggle('hidden');
    document.getElementById('quickActionDropdown').classList.add('hidden');
}

// Close dropdowns when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('#quickActionDropdown') && !e.target.closest('button[onclick="toggleQuickActions()"]')) {
        document.getElementById('quickActionDropdown')?.classList.add('hidden');
    }
    if (!e.target.closest('#notificationDropdown') && !e.target.closest('button[onclick="toggleNotifications()"]')) {
        document.getElementById('notificationDropdown')?.classList.add('hidden');
    }
});

// Modal Controls
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById('quickActionDropdown')?.classList.add('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function openSettingsModal() {
    openModal('settingsModal');
}

// Toast Notification
function showToast(title, msg, isSuccess = true) {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMsg').innerText = msg;
    const icon = document.getElementById('toastIcon');
    icon.innerHTML = isSuccess ? '<fa-solid class="fa-circle-check text-emerald-400 text-lg"></fa-solid>' : '<fa-solid class="fa-triangle-exclamation text-amber-400 text-lg"></fa-solid>';
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
}

// ================= RENDER FUNCTIONS ================= //

// Chart.js Initialization
function initCharts() {
    const ctx = document.getElementById('collectionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [
                {
                    label: 'Billed (₹ Lakhs)',
                    data: [5.7, 5.7, 5.8, 5.8, 5.8, 5.9],
                    backgroundColor: '#cbd5e1',
                    borderRadius: 6
                },
                {
                    label: 'Collected (₹ Lakhs)',
                    data: [5.2, 5.4, 5.6, 5.3, 5.5, 5.4],
                    backgroundColor: '#059669',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 11 } } }
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
}

// 1. Render Residents Table
function renderResidents() {
    const tbody = document.getElementById('residentsTableBody');
    tbody.innerHTML = '';

    state.residents.forEach(res => {
        let badgeClass = 'bg-emerald-100 text-emerald-800';
        if (res.status === 'Pending') badgeClass = 'bg-amber-100 text-amber-800';
        if (res.status === 'Defaulter') badgeClass = 'bg-rose-100 text-rose-800';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-bold text-slate-900">${res.wing} - ${res.flat}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${res.name}</td>
                <td class="py-3 px-4 text-slate-500">${res.phone}</td>
                <td class="py-3 px-4"><span class="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">${res.type}</span></td>
                <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">${res.vehicles}</td>
                <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeClass}">${res.status}</span></td>
                <td class="py-3 px-4 text-center">
                    <button onclick="editResident(${res.id})" class="text-slate-400 hover:text-emerald-600 mr-2"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteResident(${res.id})" class="text-slate-400 hover:text-rose-600"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterResidents() {
    const search = document.getElementById('residentSearch').value.toLowerCase();
    const wing = document.getElementById('wingFilter').value;
    const tbody = document.getElementById('residentsTableBody');
    tbody.innerHTML = '';

    const filtered = state.residents.filter(res => {
        const matchesSearch = res.name.toLowerCase().includes(search) || res.flat.toLowerCase().includes(search) || res.phone.includes(search);
        const matchesWing = wing === '' || res.wing === wing;
        return matchesSearch && matchesWing;
    });

    filtered.forEach(res => {
        let badgeClass = res.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-bold text-slate-900">${res.wing} - ${res.flat}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${res.name}</td>
                <td class="py-3 px-4 text-slate-500">${res.phone}</td>
                <td class="py-3 px-4"><span class="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">${res.type}</span></td>
                <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">${res.vehicles}</td>
                <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeClass}">${res.status}</span></td>
                <td class="py-3 px-4 text-center">
                    <button onclick="editResident(${res.id})" class="text-slate-400 hover:text-emerald-600 mr-2"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteResident(${res.id})" class="text-slate-400 hover:text-rose-600"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// 2. Render Maintenance Bills
function renderBills() {
    const tbody = document.getElementById('billsTableBody');
    tbody.innerHTML = '';

    state.bills.forEach(bill => {
        let statusBadge = 'bg-emerald-100 text-emerald-800';
        if (bill.status === 'Pending') statusBadge = 'bg-amber-100 text-amber-800';
        if (bill.status === 'Overdue') statusBadge = 'bg-rose-100 text-rose-800';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-bold text-slate-800">${bill.id}</td>
                <td class="py-3 px-4 font-bold text-slate-900">${bill.flat}</td>
                <td class="py-3 px-4 font-semibold text-slate-700">${bill.name}</td>
                <td class="py-3 px-4 text-slate-500">${bill.month}</td>
                <td class="py-3 px-4 font-extrabold text-slate-900">₹${bill.amount.toLocaleString()}</td>
                <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge}">${bill.status}</span></td>
                <td class="py-3 px-4 text-center">
                    ${bill.status !== 'Paid' ? `<button onclick="markBillPaid('${bill.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition">Mark Paid</button>` : `<span class="text-emerald-600 font-semibold"><i class="fa-solid fa-check"></i> Verified</span>`}
                </td>
            </tr>
        `;
    });
}

function markBillPaid(id) {
    const bill = state.bills.find(b => b.id === id);
    if (bill) {
        bill.status = 'Paid';
        renderBills();
        showToast('Payment Recorded', `Bill ${id} marked as Paid successfully.`);
    }
}

// 3. Render Complaints
function renderComplaints(filter = 'All') {
    const container = document.getElementById('complaintsContainer');
    container.innerHTML = '';

    const filtered = filter === 'All' ? state.complaints : state.complaints.filter(c => c.status === filter);

    filtered.forEach(cmp => {
        let statusColor = 'bg-amber-100 text-amber-800';
        if (cmp.status === 'Resolved') statusColor = 'bg-emerald-100 text-emerald-800';
        if (cmp.status === 'In Progress') statusColor = 'bg-blue-100 text-blue-800';

        container.innerHTML += `
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">${cmp.category}</span>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColor}">${cmp.status}</span>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm mb-1">${cmp.title}</h4>
                    <p class="text-xs font-semibold text-emerald-600 mb-2"><i class="fa-solid fa-door-open mr-1"></i> ${cmp.flat}</p>
                    <p class="text-xs text-slate-500 leading-relaxed mb-4">${cmp.desc}</p>
                </div>
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-[10px] text-slate-400">${cmp.date}</span>
                    ${cmp.status !== 'Resolved' ? `<button onclick="resolveComplaint('${cmp.id}')" class="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition">Mark Resolved</button>` : `<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check"></i> Closed</span>`}
                </div>
            </div>
        `;
    });
}

function filterComplaints(status) {
    renderComplaints(status);
}

function resolveComplaint(id) {
    const cmp = state.complaints.find(c => c.id === id);
    if (cmp) {
        cmp.status = 'Resolved';
        renderComplaints();
        showToast('Ticket Updated', `Complaint ${id} marked as Resolved.`);
    }
}

// 4. Render Notices
function renderNotices() {
    const container = document.getElementById('noticesContainer');
    container.innerHTML = '';

    state.notices.forEach(n => {
        container.innerHTML += `
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div class="flex items-center justify-between mb-2">
                    <span class="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-lg text-xs">${n.category}</span>
                    <span class="text-xs text-slate-400">${n.date}</span>
                </div>
                <h3 class="font-bold text-slate-900 text-base mb-2">${n.title}</h3>
                <p class="text-xs text-slate-600 leading-relaxed mb-4">${n.body}</p>
                <div class="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <span class="text-slate-500 font-semibold">Published by: <span class="text-slate-800">${n.author}</span></span>
                    <span class="text-emerald-600 font-bold"><i class="fa-solid fa-check-double mr-1"></i> Broadcast to 128 Residents</span>
                </div>
            </div>
        `;
    });
}

// 5. Render Bookings
function renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    state.bookings.forEach(b => {
        let badge = b.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-bold text-slate-800">${b.id}</td>
                <td class="py-3 px-4 font-bold text-slate-900">${b.amenity}</td>
                <td class="py-3 px-4 font-semibold text-slate-700">${b.flat} (${b.name})</td>
                <td class="py-3 px-4 text-slate-500">${b.date}</td>
                <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${badge}">${b.status}</span></td>
                <td class="py-3 px-4 text-center">
                    ${b.status === 'Pending' ? `<button onclick="approveBooking('${b.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition">Approve</button>` : `<span class="text-emerald-600 font-semibold">Approved</span>`}
                </td>
            </tr>
        `;
    });
}

function approveBooking(id) {
    const bk = state.bookings.find(b => b.id === id);
    if (bk) {
        bk.status = 'Approved';
        renderBookings();
        showToast('Booking Approved', `Amenity booking ${id} confirmed.`);
    }
}

// 6. Render Visitors
function renderVisitors() {
    const tbody = document.getElementById('visitorsTableBody');
    tbody.innerHTML = '';

    state.visitors.forEach(v => {
        let badge = v.status === 'Inside' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600';
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-bold text-slate-800">${v.id}</td>
                <td class="py-3 px-4 font-bold text-slate-900">${v.name}</td>
                <td class="py-3 px-4 text-slate-600">${v.purpose}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${v.flat}</td>
                <td class="py-3 px-4 text-slate-500">${v.inTime}</td>
                <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${badge}">${v.status}</span></td>
                <td class="py-3 px-4 text-center">
                    ${v.status === 'Inside' ? `<button onclick="checkoutVisitor('${v.id}')" class="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition">Check-out</button>` : `<span class="text-slate-400">Completed</span>`}
                </td>
            </tr>
        `;
    });
}

function checkoutVisitor(id) {
    const vis = state.visitors.find(v => v.id === id);
    if (vis) {
        vis.status = 'Exited';
        renderVisitors();
        showToast('Visitor Checked Out', `Visitor pass ${id} closed.`);
    }
}

// 7. Render Expenses
function renderExpenses() {
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = '';

    state.expenses.forEach(e => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-mono font-bold text-slate-800">${e.id}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">${e.category}</td>
                <td class="py-3 px-4 text-slate-600">${e.desc}</td>
                <td class="py-3 px-4 text-slate-500">${e.date}</td>
                <td class="py-3 px-4 font-extrabold text-rose-600">-₹${e.amount.toLocaleString()}</td>
                <td class="py-3 px-4 text-slate-600 font-semibold">${e.approvedBy}</td>
            </tr>
        `;
    });
}

// ================= FORM SUBMISSION HANDLERS ================= //

function handleResidentSubmit(e) {
    e.preventDefault();
    const wing = document.getElementById('resWing').value;
    const flat = document.getElementById('resFlat').value;
    const name = document.getElementById('resName').value;
    const phone = document.getElementById('resPhone').value;
    const type = document.getElementById('resType').value;
    const vehicles = document.getElementById('resVehicles').value || 'None';

    const newRes = {
        id: state.residents.length + 1,
        wing, flat, name, phone, type, vehicles, status: 'Paid'
    };

    state.residents.unshift(newRes);
    renderResidents();
    closeModal('addResidentModal');
    document.getElementById('residentForm').reset();
    showToast('Resident Added', `${name} (${wing}-${flat}) registered successfully.`);
}

function handleNoticeSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('noticeTitle').value;
    const category = document.getElementById('noticeCategory').value;
    const body = document.getElementById('noticeBody').value;

    const newNotice = {
        id: state.notices.length + 1,
        title, category, date: 'Today', author: 'Secretary Eleanor', body
    };

    state.notices.unshift(newNotice);
    renderNotices();
    closeModal('broadcastModal');
    document.getElementById('noticeForm').reset();
    showToast('Notice Broadcasted', `"${title}" sent to all residents.`);
}

function handleBillSubmit(e) {
    e.preventDefault();
    const flatStr = document.getElementById('billFlat').value;
    const month = document.getElementById('billMonth').value;
    const amount = parseInt(document.getElementById('billAmount').value);

    const parts = flatStr.split(' ');
    const flatName = parts[1] || '101';
    const name = flatStr.includes('(') ? flatStr.split('(')[1].replace(')', '') : 'Resident';

    const newBill = {
        id: `BILL-${Math.floor(100 + Math.random() * 900)}`,
        flat: flatStr.split(' ')[0] + ' ' + flatName,
        name, month, amount, status: 'Pending'
    };

    state.bills.unshift(newBill);
    renderBills();
    closeModal('addBillModal');
    showToast('Bill Generated', `Maintenance bill of ₹${amount} generated for ${flatName}.`);
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('expCategory').value;
    const desc = document.getElementById('expDesc').value;
    const amount = parseInt(document.getElementById('expAmount').value);

    const newExp = {
        id: `EXP-${Math.floor(500 + Math.random() * 400)}`,
        category, desc, date: 'Today', amount, approvedBy: 'Secretary Eleanor'
    };

    state.expenses.unshift(newExp);
    renderExpenses();
    closeModal('addExpenseModal');
    showToast('Expense Recorded', `₹${amount.toLocaleString()} logged under ${category}.`, false);
}

function handleVisitorSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('visName').value;
    const purpose = document.getElementById('visPurpose').value;
    const flat = document.getElementById('visFlat').value;

    const newVis = {
        id: `VIS-${Math.floor(700 + Math.random() * 200)}`,
        name, purpose, flat, inTime: 'Just now', status: 'Inside'
    };

    state.visitors.unshift(newVis);
    renderVisitors();
    closeModal('addVisitorModal');
    showToast('Gate Pass Issued', `Visitor pass generated for ${name}.`);
}

function sendReminder(flatCode) {
    showToast('Reminder Sent', `SMS & WhatsApp payment reminder sent to flat ${flatCode}.`);
}

function deleteResident(id) {
    state.residents = state.residents.filter(r => r.id !== id);
    renderResidents();
    showToast('Resident Removed', 'Resident record deleted from directory.', false);
}

function editResident(id) {
    const res = state.residents.find(r => r.id === id);
    if (res) {
        alert(`Editing resident: ${res.name} (${res.wing} - ${res.flat})`);
    }
}
