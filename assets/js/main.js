// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

function updateHamburgerIcon() {
    if (!hamburger || !navMenu) return;

    const spans = hamburger.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(10px, 10px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isActive));
        document.body.classList.toggle('menu-open', isActive);
        updateHamburgerIcon();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
            updateHamburgerIcon();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
            updateHamburgerIcon();
        }
    });
}

// Smooth Scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to Section Function (for Start Preparing button)
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply scroll reveal to cards
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.test-card, .material-card, .resource-card, .single-tricks-card, .youtube-card, .link-card, .calculator-card, .whatsapp-card');
    cards.forEach(card => {
        card.classList.add('scroll-reveal');
        observer.observe(card);
    });
});

// Enhanced Button Hover Effects
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mouseenter', (e) => {
        createRipple(e, button);
    });

    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        button.style.setProperty('--mouse-x', x + 'px');
        button.style.setProperty('--mouse-y', y + 'px');
    });
});

// Ripple Effect on Button Click
function createRipple(e, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Active Navigation Link Highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
            link.style.color = 'var(--accent-color)';
        } else {
            link.style.color = 'var(--text-primary)';
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Card Hover Effects with 3D Perspective
document.querySelectorAll('.test-card, .material-card, .resource-card, .single-tricks-card, .youtube-card, .link-card, .calculator-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = (y / rect.height) * 10;
        const rotateY = (x / rect.width) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Navbar Shadow on Scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (scrollY > 50) {
        navbar.style.boxShadow = '0 12px 40px rgba(0, 212, 255, 0.1)';
    } else {
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    }
});

// Parallax Effect on Hero Section
const hero = document.querySelector('.home');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroBackground = hero.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
    });
}

// Animate Numbers (for future stats section)
function animateValue(element, start, end, duration) {
    let current = start;
    const increment = (end - start) / (duration / 16);

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Keyboard Navigation
let currentSectionIndex = 0;
const sections = document.querySelectorAll('section');

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
        sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
        sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth' });
    }
});

// Dark Mode Toggle (optional feature)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Page Load Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Prevent body scroll when mobile menu is open
document.addEventListener('scroll', () => {
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll performance optimization
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateActiveNavLink();
            ticking = false;
        });
        ticking = true;
    }
});

// External Link Target Blank
document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    }
});

// Button Click Feedback
buttons.forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Initial fade-in animation
window.addEventListener('load', () => {
    document.querySelectorAll('section').forEach((section, index) => {
        section.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
        section.style.opacity = '0';
    });
});

// Prevent right-click on images (optional)
document.addEventListener('contextmenu', (e) => {
    // Remove this if you want to allow right-click
    // e.preventDefault();
});

// Analytics placeholder (for future integration)
function trackPageView() {
    console.log('Page view tracked:', window.location.href);
}

// Console Easter Egg
console.log('%cWelcome to Pakistan Entry Test Preparation Hub!', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
console.log('%cPrepare smart, succeed faster!', 'color: #00a8cc; font-size: 14px;');

// Push notification support
if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Service worker can be registered here for offline support and notifications
}

console.log('All interactive features initialized successfully! 🚀');
