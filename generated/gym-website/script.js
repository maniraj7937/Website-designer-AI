document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            offset: 100,
            duration: 800
        });
    }

    // Sticky Header on Scroll
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Navigation Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // Active Navigation Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    });

    // BMI Calculator
    const bmiForm = document.getElementById('bmiForm');
    const bmiResult = document.getElementById('bmiResult');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');

    if (bmiForm) {
        bmiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const heightInput = document.getElementById('height').value;
            const weightInput = document.getElementById('weight').value;

            if (heightInput > 0 && weightInput > 0) {
                const heightInMeters = heightInput / 100;
                const bmi = (weightInput / (heightInMeters * heightInMeters)).toFixed(1);
                
                bmiValue.textContent = bmi;
                let category = '';
                let color = '';

                if (bmi < 18.5) {
                    category = 'Underweight';
                    color = '#ffc107';
                } else if (bmi >= 18.5 && bmi <= 24.9) {
                    category = 'Normal Weight (Optimal)';
                    color = '#28a745';
                } else if (bmi >= 25 && bmi <= 29.9) {
                    category = 'Overweight';
                    color = '#ff9800';
                } else {
                    category = 'Obese';
                    color = '#ff1e1e';
                }

                bmiCategory.textContent = `Status: ${category}`;
                bmiCategory.style.color = color;
                bmiResult.style.display = 'block';
            }
        });
    }

    // Pricing Billing Toggle (Monthly vs Annual)
    const billingToggle = document.getElementById('billingToggle');
    const priceAmounts = document.querySelectorAll('.pricing-card .amount');

    if (billingToggle) {
        billingToggle.addEventListener('change', () => {
            const isAnnual = billingToggle.checked;
            priceAmounts.forEach(el => {
                const monthlyPrice = el.getAttribute('data-monthly');
                const annualPrice = el.getAttribute('data-annual');
                el.textContent = isAnnual ? annualPrice : monthlyPrice;
            });
        });
    }

    // Testimonials Slider
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;
    const totalSlides = testimonialCards.length;

    function showSlide(index) {
        testimonialCards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + totalSlides) % totalSlides;
        testimonialCards[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });

        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                showSlide(idx);
            });
        });

        // Auto slide every 6 seconds
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 6000);
    }

    // Contact Form Submission Simulation
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            formSuccess.style.display = 'block';
            contactForm.reset();
            setTimeout(() => {
                formSuccess.style.display = 'none';
            }, 5000);
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to Titan Gym newsletter!');
            newsletterForm.reset();
        });
    }
});
