// JavaScript for interactive elements

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile nav if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');

    navToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Event listeners for all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            const service = this.dataset.service;

            if (action) {
                handleActionButton(action);
            } else if (service) {
                handleServiceButton(service);
            }
        });
    });

    function handleActionButton(action) {
        switch (action) {
            case 'join-now':
                alert('Welcome to FitLife! Let\'s get started on your fitness journey.');
                // In a real app, this would redirect to a sign-up page or open a modal.
                break;
            case 'view-schedule':
                alert('Viewing our exciting class schedule! Check back for updates.');
                // In a real app, this would navigate to a classes page or display a schedule modal.
                break;
            case 'read-more-about':
                alert('Delving deeper into the FitLife story and values.');
                // In a real app, this would navigate to a more detailed about page.
                break;
            case 'contact-us':
                alert('Ready to connect! We\'ll get back to you shortly.');
                // In a real app, this would navigate to a contact form or display contact info.
                break;
            default:
                console.log(`Action button clicked: ${action}`);
        }
    }

    function handleServiceButton(service) {
        switch (service) {
            case 'personal-training':
                alert('Discover the benefits of personalized training with our expert coaches.');
                // In a real app, this would navigate to a personal training detail page.
                break;
            case 'group-classes':
                alert('Explore our diverse range of group classes for all fitness levels.');
                // In a real app, this would navigate to a group classes page.
                break;
            case 'nutrition-plans':
                alert('Learn more about our customized nutrition plans to fuel your body.');
                // In a real app, this would navigate to a nutrition services page.
                break;
            case 'spa-recovery':
                alert('Indulge in relaxation and recovery at our state-of-the-art spa facilities.');
                // In a real app, this would navigate to a spa and recovery page.
                break;
            default:
                console.log(`Service button clicked: ${service}`);
        }
    }
});
