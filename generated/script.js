/**
 * LuxeCart E-Commerce Interactive Script
 * Fully functional state management, filters, cart, wishlist, modals, and notifications.
 */

const PRODUCTS = [
    {
        id: 1,
        title: "Pro Wireless ANC Headphones",
        category: "Electronics",
        price: 299.99,
        oldPrice: 349.99,
        rating: 4.9,
        reviews: 240,
        badge: "Best Seller",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        description: "Experience crystal-clear sound and industry-leading active noise cancellation with 40-hour battery life and supreme plush comfort."
    },
    {
        id: 2,
        title: "Minimalist Chronograph Watch",
        category: "Fashion",
        price: 189.50,
        oldPrice: 220.00,
        rating: 4.8,
        reviews: 185,
        badge: "Sale",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        description: "Timeless elegance meets modern minimalist design. Crafted with sapphire crystal glass and genuine Italian leather strap."
    },
    {
        id: 3,
        title: "Ergonomic Smart Fitness Tracker",
        category: "Fitness",
        price: 129.99,
        oldPrice: 159.99,
        rating: 4.7,
        reviews: 310,
        badge: "Hot",
        image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=600&q=80",
        description: "Monitor your heart rate, blood oxygen, sleep quality, and daily workouts with precision GPS and water-resistant casing."
    },
    {
        id: 4,
        title: "Ambient Ceramic Table Lamp",
        category: "Home",
        price: 85.00,
        oldPrice: 100.00,
        rating: 4.6,
        reviews: 95,
        badge: "New",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
        description: "Warm up your living space with adjustable dimming touch controls and handcrafted matte ceramic finish."
    },
    {
        id: 5,
        title: "Ultra HD 4K Action Camera",
        category: "Electronics",
        price: 349.00,
        oldPrice: 399.00,
        rating: 4.9,
        reviews: 420,
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        description: "Capture your adventures in stunning 4K resolution with hyper-smooth stabilization and waterproof housing."
    },
    {
        id: 6,
        title: "Designer Leather Backpack",
        category: "Fashion",
        price: 210.00,
        oldPrice: 250.00,
        rating: 4.8,
        reviews: 142,
        badge: "Sale",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
        description: "Spacious, durable, and stylish. Features dedicated padded laptop compartment and weather-resistant full-grain leather."
    },
    {
        id: 7,
        title: "Smart Wi-Fi Coffee Maker",
        category: "Home",
        price: 149.99,
        oldPrice: 179.99,
        rating: 4.7,
        reviews: 215,
        badge: "Best Seller",
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
        description: "Wake up to freshly brewed coffee every morning. Control brewing strength and schedule timers directly from your smartphone."
    },
    {
        id: 8,
        title: "Pro Adjustable Dumbbell Set",
        category: "Fitness",
        price: 279.00,
        oldPrice: 320.00,
        rating: 4.9,
        reviews: 530,
        badge: "Hot",
        image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
        description: "Save space with quick-adjust weights ranging from 5 to 52 lbs per dumbbell with secure locking mechanism."
    }
];

class ECommerceApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('luxecart_cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('luxecart_wishlist')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('luxecart_user')) || null;
        this.activeCategory = 'all';
        this.searchQuery = '';
        this.appliedCoupon = null;
        this.discountPercent = 0;
        this.currentView = 'home';

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupModals();
        this.setupCart();
        this.setupWishlist();
        this.setupShopFilters();
        this.setupContactForm();
        this.setupNewsletter();
        this.renderAll();
        this.startCountdown();
    }

    // ================= VIEW NAVIGATION =================
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

        document.getElementById('hero-shop-now-btn').addEventListener('click', () => {
            this.switchView('shop');
        });

        document.getElementById('hero-explore-deals-btn').addEventListener('click', () => {
            this.switchView('deals');
        });

        // Mobile menu toggle
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

        // Update active nav styling
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-nav') === viewName) {
                link.classList.add('text-brand-600', 'font-bold');
            } else {
                link.classList.remove('text-brand-600', 'font-bold');
            }
        });
    }

    // ================= SEARCH SETUP =================
    setupSearch() {
        const desktopSearch = document.getElementById('desktop-search-input');
        const mobileSearch = document.getElementById('mobile-search-input');
        const mobileSearchToggle = document.getElementById('mobile-search-toggle');
        const mobileSearchBar = document.getElementById('mobile-search-bar');

        mobileSearchToggle.addEventListener('click', () => {
            mobileSearchBar.classList.toggle('hidden');
            if (!mobileSearchBar.classList.contains('hidden')) {
                mobileSearch.focus();
            }
        });

        const handleSearch = (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            if (this.searchQuery.length > 0 && this.currentView !== 'shop') {
                this.switchView('shop');
            }
            this.renderShopProducts();
        };

        desktopSearch.addEventListener('input', handleSearch);
        mobileSearch.addEventListener('input', handleSearch);
    }

    // ================= MODALS SETUP =================
    setupModals() {
        // Cart Drawer
        const cartBtn = document.getElementById('cart-btn');
        const cartDrawer = document.getElementById('cart-drawer');
        const cartBackdrop = document.getElementById('cart-backdrop');
        const cartCloseBtn = document.getElementById('cart-close-btn');

        const toggleCart = (open) => {
            if (open) {
                cartDrawer.classList.remove('translate-x-full');
                cartBackdrop.classList.remove('hidden');
                this.renderCartItems();
            } else {
                cartDrawer.classList.add('translate-x-full');
                cartBackdrop.classList.add('hidden');
            }
        };

        cartBtn.addEventListener('click', () => toggleCart(true));
        cartCloseBtn.addEventListener('click', () => toggleCart(false));
        cartBackdrop.addEventListener('click', () => toggleCart(false));

        // Wishlist Modal
        const wishlistBtn = document.getElementById('wishlist-btn');
        const footerWishlistBtn = document.getElementById('footer-wishlist-btn');
        const wishlistModal = document.getElementById('wishlist-modal');
        const wishlistCloseBtn = document.getElementById('wishlist-close-btn');

        const toggleWishlist = (open) => {
            if (open) {
                wishlistModal.classList.remove('hidden');
                this.renderWishlistItems();
            } else {
                wishlistModal.classList.add('hidden');
            }
        };

        wishlistBtn.addEventListener('click', () => toggleWishlist(true));
        if (footerWishlistBtn) footerWishlistBtn.addEventListener('click', () => toggleWishlist(true));
        wishlistCloseBtn.addEventListener('click', () => toggleWishlist(false));
        wishlistModal.addEventListener('click', (e) => {
            if (e.target === wishlistModal) toggleWishlist(false);
        });

        // Account / Login Modal
        const accountBtn = document.getElementById('account-btn');
        const footerAccountBtn = document.getElementById('footer-account-btn');
        const accountModal = document.getElementById('account-modal');
        const accountCloseBtn = document.getElementById('account-modal-close');
        const accountCloseBtn2 = document.getElementById('account-modal-close-2');

        const toggleAccount = (open) => {
            if (open) {
                accountModal.classList.remove('hidden');
                this.updateAccountModalView();
            } else {
                accountModal.classList.add('hidden');
            }
        };

        accountBtn.addEventListener('click', () => toggleAccount(true));
        if (footerAccountBtn) footerAccountBtn.addEventListener('click', () => toggleAccount(true));
        accountCloseBtn.addEventListener('click', () => toggleAccount(false));
        accountCloseBtn2.addEventListener('click', () => toggleAccount(false));
        accountModal.addEventListener('click', (e) => {
            if (e.target === accountModal) toggleAccount(false);
        });

        // Login Form submit
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const name = email.split('@')[0];
            this.currentUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
            localStorage.setItem('luxecart_user', JSON.stringify(this.currentUser));
            this.showToast(`Welcome back, ${this.currentUser.name}!`, 'success');
            this.updateAccountModalView();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.currentUser = null;
            localStorage.removeItem('luxecart_user');
            this.showToast('Signed out successfully.', 'info');
            this.updateAccountModalView();
        });

        // Account buttons alerts
        document.getElementById('view-orders-btn').addEventListener('click', () => {
            this.showToast('You have 3 active orders in transit.', 'info');
        });
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showToast('Profile settings updated successfully!', 'success');
        });

        // Product Modal Close
        const productModal = document.getElementById('product-modal');
        document.getElementById('product-modal-close').addEventListener('click', () => {
            productModal.classList.add('hidden');
        });
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) productModal.classList.add('hidden');
        });

        // Checkout success close
        const checkoutModal = document.getElementById('checkout-modal');
        document.getElementById('checkout-success-close').addEventListener('click', () => {
            checkoutModal.classList.add('hidden');
            this.switchView('shop');
        });
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) checkoutModal.classList.add('hidden');
        });

        // Footer policy alerts
        ['shipping-policy', 'returns-policy', 'privacy', 'terms', 'cookies'].forEach(id => {
            const el = document.getElementById(`footer-${id}`);
            if (el) {
                el.addEventListener('click', () => {
                    this.showToast(`Loading ${el.textContent}... Policy document is up to date.`, 'info');
                });
            }
        });
    }

    updateAccountModalView() {
        const outView = document.getElementById('account-logged-out-view');
        const inView = document.getElementById('account-logged-in-view');
        if (this.currentUser) {
            outView.classList.add('hidden');
            inView.classList.remove('hidden');
            document.getElementById('user-display-name').textContent = this.currentUser.name;
            document.getElementById('user-display-email').textContent = this.currentUser.email;
        } else {
            outView.classList.remove('hidden');
            inView.classList.add('hidden');
        }
    }

    // ================= SHOP & FILTERS SETUP =================
    setupShopFilters() {
        const categoriesList = document.getElementById('shop-categories-list');
        const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Fitness'];
        
        categoriesList.innerHTML = categories.map(cat => `
            <button onclick="app.filterByCategory('${cat}')" class="category-filter-btn w-full text-left py-2 px-3 rounded-xl transition ${this.activeCategory.toLowerCase() === cat.toLowerCase() ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}">
                ${cat}
            </button>
        `).join('');

        // Price Range
        const priceInput = document.getElementById('price-range-input');
        const priceOutput = document.getElementById('price-output');
        priceInput.addEventListener('input', (e) => {
            priceOutput.textContent = e.target.value;
            this.renderShopProducts();
        });

        // Rating Filter
        document.querySelectorAll('input[name="rating-filter"]').forEach(radio => {
            radio.addEventListener('change', () => this.renderShopProducts());
        });

        // Sort Select
        document.getElementById('sort-select').addEventListener('change', () => this.renderShopProducts());

        // Clear Filters
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            this.resetFilters();
        });
        document.getElementById('reset-search-filters-btn').addEventListener('click', () => {
            this.resetFilters();
        });
    }

    resetFilters() {
        this.activeCategory = 'all';
        this.searchQuery = '';
        document.getElementById('price-range-input').value = 500;
        document.getElementById('price-output').textContent = '500';
        document.querySelector('input[name="rating-filter"][value="0"]').checked = true;
        document.getElementById('sort-select').value = 'featured';
        document.getElementById('desktop-search-input').value = '';
        document.getElementById('mobile-search-input').value = '';
        this.setupShopFilters();
        this.renderShopProducts();
        this.showToast('Filters reset successfully.', 'info');
    }

    filterByCategory(category) {
        this.activeCategory = category;
        this.setupShopFilters();
        this.switchView('shop');
        this.renderShopProducts();
    }

    // ================= RENDERING PRODUCTS =================
    renderAll() {
        this.renderFeaturedProducts();
        this.renderShopProducts();
        this.renderCategoriesFull();
        this.renderDealsProducts();
        this.updateBadges();
    }

    renderFeaturedProducts() {
        const grid = document.getElementById('featured-products-grid');
        const featured = PRODUCTS.slice(0, 4);
        grid.innerHTML = featured.map(p => this.createProductCard(p)).join('');
    }

    renderShopProducts() {
        const grid = document.getElementById('shop-products-grid');
        const emptyState = document.getElementById('shop-empty-state');
        const countSpan = document.getElementById('product-count');

        const maxPrice = parseFloat(document.getElementById('price-range-input').value) || 500;
        const selectedRating = parseFloat(document.querySelector('input[name="rating-filter"]:checked').value) || 0;
        const sortBy = document.getElementById('sort-select').value;

        let filtered = PRODUCTS.filter(p => {
            const matchesCat = this.activeCategory === 'all' || p.category.toLowerCase() === this.activeCategory.toLowerCase();
            const matchesSearch = p.title.toLowerCase().includes(this.searchQuery) || p.description.toLowerCase().includes(this.searchQuery) || p.category.toLowerCase().includes(this.searchQuery);
            const matchesPrice = p.price <= maxPrice;
            const matchesRating = p.rating >= selectedRating;
            return matchesCat && matchesSearch && matchesPrice && matchesRating;
        });

        // Sorting
        if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

        countSpan.textContent = filtered.length;

        if (filtered.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            grid.classList.remove('hidden');
            emptyState.classList.add('hidden');
            grid.innerHTML = filtered.map(p => this.createProductCard(p)).join('');
        }
    }

    renderCategoriesFull() {
        const grid = document.getElementById('categories-full-grid');
        const cats = [
            { name: 'Electronics', count: '12 Items', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80', desc: 'Audio, cameras & smart gadgets' },
            { name: 'Fashion', count: '18 Items', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80', desc: 'Apparel, watches & luxury bags' },
            { name: 'Home', count: '15 Items', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', desc: 'Decor, lamps & smart kitchen' },
            { name: 'Fitness', count: '10 Items', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', desc: 'Activewear, dumbbells & trackers' }
        ];

        grid.innerHTML = cats.map(c => `
            <div onclick="app.filterByCategory('${c.name}')" class="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col">
                <div class="aspect-[16/10] overflow-hidden relative">
                    <img src="${c.img}" alt="${c.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">${c.count}</span>
                </div>
                <div class="p-6 flex flex-col flex-1 justify-between">
                    <div>
                        <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-brand-600 transition">${c.name}</h3>
                        <p class="text-slate-500 text-sm mt-1">${c.desc}</p>
                    </div>
                    <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between font-bold text-sm text-brand-600">
                        <span>Explore Store</span>
                        <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderDealsProducts() {
        const grid = document.getElementById('deals-products-grid');
        const deals = PRODUCTS.slice(2, 6);
        grid.innerHTML = deals.map(p => this.createProductCard(p)).join('');
    }

    createProductCard(p) {
        const isWishlisted = this.wishlist.some(item => item.id === p.id);
        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition group flex flex-col overflow-hidden relative">
                <!-- Badge -->
                ${p.badge ? `<span class="absolute top-3 left-3 z-10 bg-brand-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">${p.badge}</span>` : ''}
                
                <!-- Wishlist Button -->
                <button onclick="app.toggleWishlist(${p.id})" class="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 shadow-md transition">
                    <i class="${isWishlisted ? 'fa-solid text-rose-500' : 'fa-regular'} fa-heart"></i>
                </button>

                <!-- Product Image -->
                <div onclick="app.openProductModal(${p.id})" class="aspect-square bg-slate-100 overflow-hidden relative cursor-pointer">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>

                <!-- Product Content -->
                <div class="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div class="space-y-1.5 cursor-pointer" onclick="app.openProductModal(${p.id})">
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-400 font-semibold uppercase tracking-wider">${p.category}</span>
                            <div class="flex items-center gap-1 text-amber-400 font-bold">
                                <i class="fa-solid fa-star text-[11px]"></i>
                                <span class="text-slate-700 text-xs">${p.rating}</span>
                            </div>
                        </div>
                        <h3 class="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition line-clamp-1">${p.title}</h3>
                        <div class="flex items-baseline gap-2 pt-1">
                            <span class="text-lg font-extrabold text-brand-600">$${p.price.toFixed(2)}</span>
                            ${p.oldPrice ? `<span class="text-slate-400 line-through text-xs">$${p.oldPrice.toFixed(2)}</span>` : ''}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button onclick="app.openProductModal(${p.id})" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition">
                            Quick View
                        </button>
                        <button onclick="app.addToCart(${p.id})" class="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================= QUICK VIEW MODAL =================
    openProductModal(id) {
        const p = PRODUCTS.find(item => item.id === id);
        if (!p) return;

        const modal = document.getElementById('product-modal');
        document.getElementById('modal-img').src = p.image;
        document.getElementById('modal-category').textContent = p.category;
        document.getElementById('modal-title').textContent = p.title;
        document.getElementById('modal-price').textContent = `$${p.price.toFixed(2)}`;
        document.getElementById('modal-desc').textContent = p.description;
        document.getElementById('modal-rating').textContent = p.rating;
        document.getElementById('modal-reviews').textContent = `(${p.reviews} reviews)`;

        const oldPriceEl = document.getElementById('modal-old-price');
        if (p.oldPrice) {
            oldPriceEl.textContent = `$${p.oldPrice.toFixed(2)}`;
            oldPriceEl.classList.remove('hidden');
        } else {
            oldPriceEl.classList.add('hidden');
        }

        const badgeEl = document.getElementById('modal-badge');
        if (p.badge) {
            badgeEl.textContent = p.badge;
            badgeEl.classList.remove('hidden');
        } else {
            badgeEl.classList.add('hidden');
        }

        // Quantity controls inside modal
        let qty = 1;
        const qtyVal = document.getElementById('modal-qty-value');
        qtyVal.textContent = qty;

        const minusBtn = document.getElementById('modal-qty-minus');
        const plusBtn = document.getElementById('modal-qty-plus');
        
        // Remove old listeners by cloning
        const newMinus = minusBtn.cloneNode(true);
        const newPlus = plusBtn.cloneNode(true);
        minusBtn.parentNode.replaceChild(newMinus, minusBtn);
        plusBtn.parentNode.replaceChild(newPlus, plusBtn);

        document.getElementById('modal-qty-minus').addEventListener('click', () => {
            if (qty > 1) {
                qty--;
                document.getElementById('modal-qty-value').textContent = qty;
            }
        });
        document.getElementById('modal-qty-plus').addEventListener('click', () => {
            if (qty < 10) {
                qty++;
                document.getElementById('modal-qty-value').textContent = qty;
            }
        });

        // Add to cart from modal
        const addCartBtn = document.getElementById('modal-add-to-cart-btn');
        const newAddCart = addCartBtn.cloneNode(true);
        addCartBtn.parentNode.replaceChild(newAddCart, addCartBtn);

        document.getElementById('modal-add-to-cart-btn').addEventListener('click', () => {
            this.addToCart(p.id, qty);
            modal.classList.add('hidden');
        });

        // Wishlist button inside modal
        const isWishlisted = this.wishlist.some(item => item.id === p.id);
        const wishlistBtn = document.getElementById('modal-wishlist-btn');
        const wishlistText = document.getElementById('modal-wishlist-text');
        wishlistText.textContent = isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';

        const newWishlistBtn = wishlistBtn.cloneNode(true);
        wishlistBtn.parentNode.replaceChild(newWishlistBtn, wishlistBtn);

        document.getElementById('modal-wishlist-btn').addEventListener('click', () => {
            this.toggleWishlist(p.id);
            const updatedWishlisted = this.wishlist.some(item => item.id === p.id);
            document.getElementById('modal-wishlist-text').textContent = updatedWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';
        });

        modal.classList.remove('hidden');
    }

    // ================= CART LOGIC =================
    setupCart() {
        document.getElementById('clear-cart-btn').addEventListener('click', () => {
            if (this.cart.length === 0) return;
            this.cart = [];
            this.appliedCoupon = null;
            this.discountPercent = 0;
            this.saveCart();
            this.renderCartItems();
            this.showToast('Cart cleared successfully.', 'info');
        });

        document.getElementById('apply-coupon-btn').addEventListener('click', () => {
            const codeInput = document.getElementById('coupon-input').value.toUpperCase().trim();
            const msgEl = document.getElementById('coupon-message');
            msgEl.classList.remove('hidden');

            if (codeInput === 'LUXE20') {
                this.appliedCoupon = 'LUXE20';
                this.discountPercent = 0.20;
                msgEl.textContent = 'Promo code LUXE20 applied (20% Off)!';
                msgEl.className = 'text-xs font-bold text-emerald-600 mt-1';
                this.showToast('Promo code applied successfully!', 'success');
            } else if (codeInput === 'FREESHIP') {
                this.appliedCoupon = 'FREESHIP';
                this.discountPercent = 0.10;
                msgEl.textContent = 'Promo code FREESHIP applied (10% Off)!';
                msgEl.className = 'text-xs font-bold text-emerald-600 mt-1';
                this.showToast('Promo code applied successfully!', 'success');
            } else {
                msgEl.textContent = 'Invalid promo code. Try LUXE20.';
                msgEl.className = 'text-xs font-bold text-rose-600 mt-1';
                this.showToast('Invalid promo code.', 'error');
            }
            this.updateCartTotals();
        });

        document.getElementById('checkout-btn').addEventListener('click', () => {
            if (this.cart.length === 0) {
                this.showToast('Your cart is empty!', 'error');
                return;
            }
            // Close cart drawer
            document.getElementById('cart-drawer').classList.add('translate-x-full');
            document.getElementById('cart-backdrop').classList.add('hidden');

            // Show success checkout modal
            const randomOrderNum = '#LC-' + Math.floor(10000 + Math.random() * 90000);
            document.getElementById('order-number-text').textContent = randomOrderNum;
            document.getElementById('checkout-modal').classList.remove('hidden');

            // Clear cart
            this.cart = [];
            this.appliedCoupon = null;
            this.discountPercent = 0;
            this.saveCart();
            this.updateBadges();
        });
    }

    addToCart(productId, quantity = 1) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existing = this.cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity });
        }

        this.saveCart();
        this.renderCartItems();
        this.showToast(`Added "${product.title}" to cart!`, 'success');
    }

    updateCartQuantity(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.id !== productId);
            this.showToast(`Removed item from cart.`, 'info');
        }

        this.saveCart();
        this.renderCartItems();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.saveCart();
        this.renderCartItems();
        this.showToast(`Item removed from cart.`, 'info');
    }

    quickAdd(productId) {
        this.addToCart(productId, 1);
    }

    saveCart() {
        localStorage.setItem('luxecart_cart', JSON.stringify(this.cart));
        this.updateBadges();
    }

    renderCartItems() {
        const container = document.getElementById('cart-items-container');
        const countHeader = document.getElementById('cart-count-header');
        
        const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        countHeader.textContent = totalCount;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 space-y-3">
                    <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base">Your cart is empty</h4>
                    <p class="text-slate-500 text-xs">Explore our shop and add items to your cart.</p>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-xl shrink-0">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-slate-900 text-sm truncate">${item.title}</h4>
                        <p class="text-brand-600 font-extrabold text-sm mt-0.5">$${item.price.toFixed(2)}</p>
                        <div class="flex items-center gap-3 mt-2">
                            <div class="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                                <button onclick="app.updateCartQuantity(${item.id}, -1)" class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold">−</button>
                                <span class="px-2.5 font-bold text-slate-800">${item.quantity}</span>
                                <button onclick="app.updateCartQuantity(${item.id}, 1)" class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold">+</button>
                            </div>
                            <button onclick="app.removeFromCart(${item.id})" class="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1">
                                <i class="fa-solid fa-trash-can"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        this.updateCartTotals();
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = subtotal * this.discountPercent;
        const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 10.00;
        const total = subtotal - discount + shipping;

        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        
        const discountRow = document.getElementById('discount-row');
        if (this.discountPercent > 0) {
            discountRow.classList.remove('hidden');
            document.getElementById('discount-code-label').textContent = this.appliedCoupon;
            document.getElementById('cart-discount').textContent = `-$${discount.toFixed(2)}`;
        } else {
            discountRow.classList.add('hidden');
        }

        const shippingEl = document.getElementById('cart-shipping');
        if (shipping === 0) {
            shippingEl.textContent = 'FREE';
            shippingEl.className = 'font-bold text-brand-600';
        } else {
            shippingEl.textContent = `$${shipping.toFixed(2)}`;
            shippingEl.className = 'font-semibold text-slate-900';
        }

        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

        // Shipping Progress Bar
        const freeShippingThreshold = 50;
        const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
        document.getElementById('shipping-progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('shipping-progress-percent').textContent = `${Math.round(progressPercent)}%`;

        const progressText = document.getElementById('shipping-progress-text');
        if (subtotal >= freeShippingThreshold) {
            progressText.textContent = '🎉 You qualify for Free Express Shipping!';
        } else {
            const diff = (freeShippingThreshold - subtotal).toFixed(2);
            progressText.textContent = `Add $${diff} more for Free Shipping!`;
        }
    }

    // ================= WISHLIST LOGIC =================
    setupWishlist() {
        document.getElementById('wishlist-clear-btn').addEventListener('click', () => {
            if (this.wishlist.length === 0) return;
            this.wishlist = [];
            this.saveWishlist();
            this.renderWishlistItems();
            this.renderAll();
            this.showToast('Wishlist cleared.', 'info');
        });

        document.getElementById('wishlist-add-all-btn').addEventListener('click', () => {
            if (this.wishlist.length === 0) return;
            this.wishlist.forEach(item => {
                const existing = this.cart.find(c => c.id === item.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    this.cart.push({ ...item, quantity: 1 });
                }
            });
            this.saveCart();
            this.wishlist = [];
            this.saveWishlist();
            this.renderWishlistItems();
            this.renderAll();
            document.getElementById('wishlist-modal').classList.add('hidden');
            this.showToast('All wishlist items added to cart!', 'success');
        });
    }

    toggleWishlist(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const index = this.wishlist.findIndex(item => item.id === productId);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showToast(`Removed "${product.title}" from wishlist.`, 'info');
        } else {
            this.wishlist.push(product);
            this.showToast(`Added "${product.title}" to wishlist!`, 'success');
        }

        this.saveWishlist();
        this.renderAll();
        if (!document.getElementById('wishlist-modal').classList.contains('hidden')) {
            this.renderWishlistItems();
        }
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
        this.renderWishlistItems();
        this.renderAll();
        this.showToast('Item removed from wishlist.', 'info');
    }

    saveWishlist() {
        localStorage.setItem('luxecart_wishlist', JSON.stringify(this.wishlist));
        this.updateBadges();
    }

    renderWishlistItems() {
        const container = document.getElementById('wishlist-items-container');
        const countHeader = document.getElementById('wishlist-count-header');
        countHeader.textContent = this.wishlist.length;

        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 space-y-3">
                    <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                        <i class="fa-regular fa-heart"></i>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base">Your wishlist is empty</h4>
                    <p class="text-slate-500 text-xs">Click the heart icon on any product to save it for later.</p>
                </div>
            `;
        } else {
            container.innerHTML = this.wishlist.map(item => `
                <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-xl shrink-0">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-slate-900 text-sm truncate">${item.title}</h4>
                        <p class="text-brand-600 font-extrabold text-sm mt-0.5">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="app.addToCart(${item.id}); app.removeFromWishlist(${item.id});" class="bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-xl text-xs font-bold shadow transition" title="Move to Cart">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                        <button onclick="app.removeFromWishlist(${item.id})" class="bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 p-2.5 rounded-xl text-xs transition" title="Remove">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    updateBadges() {
        const totalCartItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-badge').textContent = totalCartItems;

        const wishlistBadge = document.getElementById('wishlist-badge');
        if (this.wishlist.length > 0) {
            wishlistBadge.textContent = this.wishlist.length;
            wishlistBadge.classList.remove('hidden');
        } else {
            wishlistBadge.classList.add('hidden');
        }
    }

    // ================= FORMS & TOASTS =================
    setupContactForm() {
        const form = document.getElementById('contact-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showToast('Thank you! Your message has been sent successfully.', 'success');
            form.reset();
        });
    }

    setupNewsletter() {
        const form = document.getElementById('newsletter-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showToast('Subscribed successfully! Use code LUXE20 for 20% off.', 'success');
            form.reset();
        });
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        let bgClass = 'bg-slate-900 text-white';
        let icon = 'fa-circle-check text-brand-400';
        if (type === 'success') {
            bgClass = 'bg-slate-900 text-white border border-brand-500/30';
            icon = 'fa-circle-check text-brand-400';
        } else if (type === 'error') {
            bgClass = 'bg-slate-900 text-white border border-rose-500/30';
            icon = 'fa-circle-exclamation text-rose-400';
        } else if (type === 'info') {
            bgClass = 'bg-slate-900 text-white border border-sky-500/30';
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

    startCountdown() {
        let totalSeconds = 12 * 3600 + 45 * 60 + 30;
        setInterval(() => {
            if (totalSeconds > 0) totalSeconds--;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            const timerEl = document.getElementById('countdown-timer');
            if (timerEl) {
                timerEl.textContent = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }
}

// Initialize Application on DOM Load
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ECommerceApp();
});
