/**
 * Luxurious Home Interactive Script
 * Fully functional estate filtering, mortgage calculator, saved bookmarks, modals & notifications.
 */

const ESTATES = [
    {
        id: 1,
        title: "The Bel-Air Zenith Sanctuary",
        location: "Beverly Hills",
        price: 38500000,
        formattedPrice: "$38,500,000",
        beds: 7,
        baths: 10,
        sqft: "14,200 sqft",
        type: "Mansion",
        badge: "Exclusive",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        description: "An architectural masterpiece perched atop Bel-Air offering panoramic views from downtown LA to the Pacific Ocean. Features 7 ensuite bedrooms, 75ft infinity edge pool, state-of-the-art screening room, and subterranean 10-car garage."
    },
    {
        id: 2,
        title: "Park Avenue Glass Penthouse",
        location: "New York",
        price: 29900000,
        formattedPrice: "$29,900,000",
        beds: 5,
        baths: 6,
        sqft: "8,800 sqft",
        type: "Penthouse",
        badge: "New",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
        description: "Occupying the top three floors of a premier limestone tower on Manhattan's prestigious Park Avenue. Includes private elevator foyer, 360-degree city views, custom temperature-controlled wine cellar, and wrap-around limestone terrace."
    },
    {
        id: 3,
        title: "Star Island Waterfront Estate",
        location: "Miami",
        price: 45000000,
        formattedPrice: "$45,000,000",
        beds: 8,
        baths: 11,
        sqft: "16,500 sqft",
        type: "Waterfront",
        badge: "Hot",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        description: "Ultra-luxury modern tropical estate on guard-gated Star Island with 200 feet of prime deep-water frontage. Features private dock accommodating mega-yachts, resort-style lagoon pool, rooftop lounge, and detached guest villa."
    },
    {
        id: 4,
        title: "Aspen Alpine Glass Chalet",
        location: "Aspen",
        price: 24750000,
        formattedPrice: "$24,750,000",
        beds: 6,
        baths: 8,
        sqft: "10,100 sqft",
        type: "Chalet",
        badge: "Featured",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        description: "Ski-in, ski-out luxury sanctuary in exclusive Red Mountain, Aspen. Built with reclaimed timber, Colorado stone, heated driveway, outdoor plunge spa, and massive glass walls framing snow-capped peaks."
    },
    {
        id: 5,
        title: "Malibu Bird Streets Modern",
        location: "Beverly Hills",
        price: 32000000,
        formattedPrice: "$32,000,000",
        beds: 6,
        baths: 7,
        sqft: "11,400 sqft",
        type: "Mansion",
        badge: "Exclusive",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        description: "Sleek cantilevered design with disappearing pocket glass doors opening to dramatic coastline views. Features zero-edge pool, Calacatta marble kitchen, and master wing with dual spa baths."
    },
    {
        id: 6,
        title: "Biscayne Bay Architectural Villa",
        location: "Miami",
        price: 19800000,
        formattedPrice: "$19,800,000",
        beds: 5,
        baths: 6,
        sqft: "9,200 sqft",
        type: "Waterfront",
        badge: "Sale",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
        description: "Minimalist waterfront masterpiece featuring Italian porcelain flooring, smart home automation, custom millwork, and private sunset boat slip."
    }
];

class LuxuriousHomeApp {
    constructor() {
        this.savedProperties = JSON.parse(localStorage.getItem('luxurious_home_saved')) || [];
        this.currentView = 'home';
        this.activeLocation = 'all';
        this.searchQuery = '';

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearchAndFilters();
        this.setupMortgageCalculator();
        this.setupModals();
        this.setupContactForm();
        this.setupNewsletter();
        this.renderAll();
    }

    // ================= NAVIGATION =================
    setupNavigation() {
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = btn.getAttribute('data-nav');
                if (view) {
                    this.switchView(view);
                    this.closeMobileDrawer();
                }
            });
        });

        document.getElementById('logo-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('home');
        });

        document.getElementById('hero-explore-btn').addEventListener('click', () => {
            this.switchView('properties');
        });

        document.getElementById('hero-consult-btn').addEventListener('click', () => {
            this.switchView('contact');
        });

        document.getElementById('header-inquire-btn').addEventListener('click', () => {
            this.switchView('contact');
        });

        document.getElementById('top-schedule-btn').addEventListener('click', () => {
            this.switchView('contact');
        });

        // Mobile menu drawer
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileDrawer = document.getElementById('mobile-drawer');
        const mobileBackdrop = document.getElementById('mobile-backdrop');
        const mobileDrawerClose = document.getElementById('mobile-drawer-close');

        const toggleMobileMenu = (open) => {
            if (open) {
                mobileDrawer.classList.remove('-translate-x-full');
                mobileBackdrop.classList.remove('hidden');
            } else {
                mobileDrawer.classList.add('-translate-x-full');
                mobileBackdrop.classList.add('hidden');
            }
        };

        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(true));
        mobileDrawerClose.addEventListener('click', () => toggleMobileMenu(false));
        mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));
    }

    closeMobileDrawer() {
        document.getElementById('mobile-drawer').classList.add('-translate-x-full');
        document.getElementById('mobile-backdrop').classList.add('hidden');
    }

    switchView(viewName) {
        this.currentView = viewName;
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-nav') === viewName) {
                link.classList.add('text-gold-400', 'font-semibold');
            } else {
                link.classList.remove('text-gold-400', 'font-semibold');
            }
        });
    }

    // ================= SEARCH & FILTERS =================
    setupSearchAndFilters() {
        const searchInput = document.getElementById('property-search');
        const locationSelect = document.getElementById('location-filter');
        const sortSelect = document.getElementById('sort-property');

        const handleFilterChange = () => {
            this.searchQuery = searchInput.value.toLowerCase().trim();
            this.activeLocation = locationSelect.value;
            this.renderProperties();
        };

        searchInput.addEventListener('input', handleFilterChange);
        locationSelect.addEventListener('change', handleFilterChange);
        sortSelect.addEventListener('change', () => this.renderProperties());
    }

    // ================= MORTGAGE CALCULATOR =================
    setupMortgageCalculator() {
        const priceRange = document.getElementById('calc-price');
        const downRange = document.getElementById('calc-down');
        const termSelect = document.getElementById('calc-term');
        const rateRange = document.getElementById('calc-rate');

        const updateCalc = () => {
            const price = parseFloat(priceRange.value);
            const down = parseFloat(downRange.value);
            const years = parseInt(termSelect.value);
            const annualRate = parseFloat(rateRange.value);

            document.getElementById('calc-price-val').textContent = this.formatCurrency(price);
            document.getElementById('calc-down-val').textContent = this.formatCurrency(down);
            document.getElementById('calc-term-val').textContent = `${years} Years`;
            document.getElementById('calc-rate-val').textContent = `${annualRate}%`;

            const loanAmount = price - down;
            document.getElementById('calc-loan-amount').textContent = this.formatCurrency(loanAmount);

            const monthlyRate = (annualRate / 100) / 12;
            const numberOfPayments = years * 12;
            
            let monthlyPrincipalAndInterest = 0;
            if (monthlyRate > 0) {
                monthlyPrincipalAndInterest = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            } else {
                monthlyPrincipalAndInterest = loanAmount / numberOfPayments;
            }

            const estTax = (price * 0.012) / 12;
            const estInsurance = (price * 0.003) / 12;
            const totalMonthly = monthlyPrincipalAndInterest + estTax + estInsurance;

            document.getElementById('calc-monthly-payment').textContent = this.formatCurrency(Math.round(totalMonthly));
        };

        priceRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            downRange.value = val * 0.20; // default 20% down
            updateCalc();
        });

        downRange.addEventListener('input', updateCalc);
        termSelect.addEventListener('change', updateCalc);
        rateRange.addEventListener('input', updateCalc);

        document.getElementById('calc-apply-btn').addEventListener('click', () => {
            this.showToast('Pre-qualification inquiry submitted to Private Bank!', 'success');
        });

        updateCalc();
    }

    // ================= MODALS SETUP =================
    setupModals() {
        // Saved properties modal
        const savedBtn = document.getElementById('saved-properties-btn');
        const savedModal = document.getElementById('saved-modal');
        const savedCloseBtn = document.getElementById('saved-close-btn');

        const toggleSaved = (open) => {
            if (open) {
                savedModal.classList.remove('hidden');
                this.renderSavedItems();
            } else {
                savedModal.classList.add('hidden');
            }
        };

        savedBtn.addEventListener('click', () => toggleSaved(true));
        savedCloseBtn.addEventListener('click', () => toggleSaved(false));
        savedModal.addEventListener('click', (e) => {
            if (e.target === savedModal) toggleSaved(false);
        });

        document.getElementById('saved-clear-btn').addEventListener('click', () => {
            this.savedProperties = [];
            this.saveBookmarks();
            this.renderSavedItems();
            this.renderAll();
            this.showToast('All bookmarked estates cleared.', 'info');
        });

        document.getElementById('saved-inquire-all-btn').addEventListener('click', () => {
            if (this.savedProperties.length === 0) return;
            savedModal.classList.add('hidden');
            this.switchView('contact');
            document.getElementById('contact-subject').value = `Inquiry for ${this.savedProperties.length} Saved Estates`;
            this.showToast('Loaded saved estates into inquiry form.', 'success');
        });

        // Property detail modal close
        const propertyModal = document.getElementById('property-modal');
        document.getElementById('property-modal-close').addEventListener('click', () => {
            propertyModal.classList.add('hidden');
        });
        propertyModal.addEventListener('click', (e) => {
            if (e.target === propertyModal) propertyModal.classList.add('hidden');
        });

        document.getElementById('footer-brochure-btn').addEventListener('click', () => {
            this.showToast('2025 Luxury Brochure PDF downloaded successfully.', 'success');
        });

        ['privacy', 'terms'].forEach(id => {
            const el = document.getElementById(`footer-${id}`);
            if (el) {
                el.addEventListener('click', () => {
                    this.showToast(`Loading ${el.textContent}... All documents are verified secure.`, 'info');
                });
            }
        });
    }

    // ================= RENDERING =================
    renderAll() {
        this.renderHomeFeatured();
        this.renderProperties();
        this.renderGallery();
        this.updateBadges();
    }

    renderHomeFeatured() {
        const grid = document.getElementById('home-featured-grid');
        const featured = ESTATES.slice(0, 3);
        grid.innerHTML = featured.map(e => this.createEstateCard(e)).join('');
    }

    renderProperties() {
        const grid = document.getElementById('properties-grid');
        const sortVal = document.getElementById('sort-property').value;

        let filtered = ESTATES.filter(e => {
            const matchesLoc = this.activeLocation === 'all' || e.location.toLowerCase() === this.activeLocation.toLowerCase();
            const matchesSearch = e.title.toLowerCase().includes(this.searchQuery) || e.location.toLowerCase().includes(this.searchQuery) || e.description.toLowerCase().includes(this.searchQuery);
            return matchesLoc && matchesSearch;
        });

        if (sortVal === 'price-high') filtered.sort((a, b) => b.price - a.price);
        else if (sortVal === 'price-low') filtered.sort((a, b) => a.price - b.price);
        else if (sortVal === 'sqft') filtered.sort((a, b) => parseInt(b.sqft) - parseInt(a.sqft));

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-3 text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800">
                    <h3 class="text-lg font-serif font-bold text-white">No estates match your criteria</h3>
                    <p class="text-zinc-400 text-xs mt-1">Try resetting your search location.</p>
                </div>
            `;
        } else {
            grid.innerHTML = filtered.map(e => this.createEstateCard(e)).join('');
        }
    }

    renderGallery() {
        const grid = document.getElementById('gallery-grid');
        const images = [
            { title: "Master Panoramic Living Room", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" },
            { title: "Calacatta Marble Kitchen", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
            { title: "Infinity Pool at Sunset", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80" },
            { title: "Alpine Glass Chalet", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
            { title: "Park Avenue Penthouse", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" },
            { title: "Private Master Spa Bath", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" }
        ];

        grid.innerHTML = images.map(item => `
            <div class="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-zinc-800 shadow-lg">
                <img src="${item.img}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
                    <h3 class="text-white font-serif font-bold text-lg">${item.title}</h3>
                    <p class="text-xs text-gold-400 mt-0.5">Luxurious Home Architecture</p>
                </div>
            </div>
        `).join('');
    }

    createEstateCard(e) {
        const isSaved = this.savedProperties.some(item => item.id === e.id);
        return `
            <div class="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:border-gold-500/50 transition group flex flex-col relative">
                ${e.badge ? `<span class="absolute top-4 left-4 z-10 bg-gold-500 text-zinc-950 font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow">${e.badge}</span>` : ''}
                
                <button onclick="app.toggleBookmark(${e.id})" class="absolute top-4 right-4 z-10 w-10 h-10 bg-zinc-950/80 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-300 hover:text-gold-400 shadow-md transition">
                    <i class="${isSaved ? 'fa-solid text-gold-400' : 'fa-regular'} fa-bookmark"></i>
                </button>

                <div onclick="app.openPropertyModal(${e.id})" class="aspect-[16/10] bg-zinc-950 overflow-hidden relative cursor-pointer">
                    <img src="${e.image}" alt="${e.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>

                <div class="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div class="space-y-1.5 cursor-pointer" onclick="app.openPropertyModal(${e.id})">
                        <div class="flex items-center justify-between text-xs text-zinc-400">
                            <span><i class="fa-solid fa-location-dot text-gold-500 mr-1"></i> ${e.location}</span>
                            <span class="bg-zinc-950 px-2.5 py-1 rounded-md text-zinc-300 font-medium">${e.type}</span>
                        </div>
                        <h3 class="font-serif font-bold text-white text-xl group-hover:text-gold-400 transition line-clamp-1">${e.title}</h3>
                        <div class="text-2xl font-serif font-bold text-gold-400 pt-1">${e.formattedPrice}</div>
                    </div>

                    <div class="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400 font-medium">
                        <div><i class="fa-solid fa-bed text-gold-500 mr-1"></i> ${e.beds} Beds</div>
                        <div><i class="fa-solid fa-bath text-gold-500 mr-1"></i> ${e.baths} Baths</div>
                        <div><i class="fa-solid fa-ruler-combined text-gold-500 mr-1"></i> ${e.sqft}</div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 pt-2">
                        <button onclick="app.openPropertyModal(${e.id})" class="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold py-3 rounded-xl transition">
                            Details
                        </button>
                        <button onclick="app.bookTour(${e.id})" class="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-zinc-950 text-xs font-bold py-3 rounded-xl shadow transition">
                            Schedule Tour
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================= PROPERTY MODAL =================
    openPropertyModal(id) {
        const e = ESTATES.find(item => item.id === id);
        if (!e) return;

        const modal = document.getElementById('property-modal');
        document.getElementById('modal-img').src = e.image;
        document.getElementById('modal-location').textContent = e.location;
        document.getElementById('modal-type').textContent = e.type;
        document.getElementById('modal-title').textContent = e.title;
        document.getElementById('modal-price').textContent = e.formattedPrice;
        document.getElementById('modal-desc').textContent = e.description;
        document.getElementById('modal-beds').textContent = `${e.beds} Beds`;
        document.getElementById('modal-baths').textContent = `${e.baths} Baths`;
        document.getElementById('modal-sqft').textContent = e.sqft;

        const isSaved = this.savedProperties.some(item => item.id === e.id);
        document.getElementById('modal-save-text').textContent = isSaved ? 'Remove from Bookmarks' : 'Save to Bookmarked Estates';

        const tourBtn = document.getElementById('modal-tour-btn');
        const newTourBtn = tourBtn.cloneNode(true);
        tourBtn.parentNode.replaceChild(newTourBtn, tourBtn);

        document.getElementById('modal-tour-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
            this.switchView('contact');
            document.getElementById('contact-subject').value = `Private Tour Booking: ${e.title}`;
            this.showToast(`Loading tour request for ${e.title}`, 'success');
        });

        const saveBtn = document.getElementById('modal-save-btn');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        document.getElementById('modal-save-btn').addEventListener('click', () => {
            this.toggleBookmark(e.id);
            const updatedSaved = this.savedProperties.some(item => item.id === e.id);
            document.getElementById('modal-save-text').textContent = updatedSaved ? 'Remove from Bookmarks' : 'Save to Bookmarked Estates';
        });

        modal.classList.remove('hidden');
    }

    bookTour(id) {
        const e = ESTATES.find(item => item.id === id);
        if (!e) return;
        this.switchView('contact');
        document.getElementById('contact-subject').value = `Private Tour Booking: ${e.title}`;
        this.showToast(`Tour request initiated for ${e.title}`, 'success');
    }

    toggleBookmark(id) {
        const estate = ESTATES.find(item => item.id === id);
        if (!estate) return;

        const index = this.savedProperties.findIndex(item => item.id === id);
        if (index > -1) {
            this.savedProperties.splice(index, 1);
            this.showToast(`Removed "${estate.title}" from bookmarks.`, 'info');
        } else {
            this.savedProperties.push(estate);
            this.showToast(`Bookmarked "${estate.title}" successfully!`, 'success');
        }

        this.saveBookmarks();
        this.renderAll();
        if (!document.getElementById('saved-modal').classList.contains('hidden')) {
            this.renderSavedItems();
        }
    }

    removeBookmark(id) {
        this.savedProperties = this.savedProperties.filter(item => item.id !== id);
        this.saveBookmarks();
        this.renderSavedItems();
        this.renderAll();
        this.showToast('Bookmark removed.', 'info');
    }

    saveBookmarks() {
        localStorage.setItem('luxurious_home_saved', JSON.stringify(this.savedProperties));
        this.updateBadges();
    }

    renderSavedItems() {
        const container = document.getElementById('saved-items-container');
        const countHeader = document.getElementById('saved-count-header');
        countHeader.textContent = this.savedProperties.length;

        if (this.savedProperties.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 space-y-3">
                    <div class="w-16 h-16 bg-zinc-950 text-zinc-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                        <i class="fa-regular fa-bookmark"></i>
                    </div>
                    <h4 class="font-serif font-bold text-white text-base">No bookmarked estates</h4>
                    <p class="text-zinc-400 text-xs">Click the bookmark icon on any estate to save it here.</p>
                </div>
            `;
        } else {
            container.innerHTML = this.savedProperties.map(item => `
                <div class="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-xl shrink-0">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-serif font-bold text-white text-sm truncate">${item.title}</h4>
                        <p class="text-gold-400 font-bold text-xs mt-0.5">${item.formattedPrice}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="app.openPropertyModal(${item.id}); document.getElementById('saved-modal').classList.add('hidden');" class="bg-gold-500 hover:bg-gold-400 text-zinc-950 p-2.5 rounded-xl text-xs font-bold shadow transition" title="View Details">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button onclick="app.removeBookmark(${item.id})" class="bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 p-2.5 rounded-xl text-xs transition" title="Remove">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    updateBadges() {
        const badge = document.getElementById('saved-badge');
        if (this.savedProperties.length > 0) {
            badge.textContent = this.savedProperties.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // ================= FORMS & TOASTS =================
    setupContactForm() {
        const form = document.getElementById('contact-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showToast('Private inquiry submitted successfully. A senior partner will contact you within 2 hours.', 'success');
            form.reset();
        });
    }

    setupNewsletter() {
        const form = document.getElementById('newsletter-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showToast('Subscribed to confidential off-market briefings.', 'success');
            form.reset();
        });
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        let bgClass = 'bg-zinc-900 text-white border border-gold-500/30';
        let icon = 'fa-circle-check text-gold-400';
        if (type === 'error') {
            bgClass = 'bg-zinc-900 text-white border border-rose-500/30';
            icon = 'fa-circle-exclamation text-rose-400';
        } else if (type === 'info') {
            bgClass = 'bg-zinc-900 text-white border border-sky-500/30';
            icon = 'fa-circle-info text-sky-400';
        }

        toast.className = `${bgClass} px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-slide-up pointer-events-auto backdrop-blur-md`;
        toast.innerHTML = `<i class="fa-solid ${icon} text-base"></i><span>${message}</span>`;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(1rem)';
            toast.style.transition = 'all 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LuxuriousHomeApp();
});
