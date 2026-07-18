/* StudyBuddy — landing page interactions.
   Loaded with `defer`, so the DOM is ready by the time this runs. */

(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)');
    // Must match the off-canvas nav breakpoint in main.css.
    const MOBILE_NAV = window.matchMedia('(max-width: 1024px)');

    const CARD_SELECTOR = '.test-card, .coming-soon-card, .single-tricks-card, .youtube-card, .link-card, .calculator-card, .whatsapp-card';

    /* ---------------------------------------------------------------
       Mobile navigation
    --------------------------------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.querySelector('.navbar');

    function syncNavbarHeight() {
        if (!navbar) return;
        document.documentElement.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
    }

    function setMenuIcon(isOpen) {
        if (!hamburger) return;
        const [top, mid, bottom] = hamburger.querySelectorAll('span');
        if (!top || !mid || !bottom) return;
        // Bars are 3px tall with a 6px gap, so each outer bar travels 9px to meet the centre.
        top.style.transform = isOpen ? 'translateY(9px) rotate(45deg)' : '';
        mid.style.opacity = isOpen ? '0' : '1';
        bottom.style.transform = isOpen ? 'translateY(-9px) rotate(-45deg)' : '';
    }

    function setMenu(isOpen) {
        if (!navMenu || !hamburger) return;
        navMenu.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        setMenuIcon(isOpen);
    }

    const closeMenu = () => setMenu(false);

    if (hamburger && navMenu) {
        // Scrim sits behind the panel and closes the menu when tapped.
        const scrim = document.createElement('div');
        scrim.className = 'nav-scrim';
        document.body.appendChild(scrim);
        scrim.addEventListener('click', closeMenu);

        hamburger.addEventListener('click', () => {
            setMenu(!navMenu.classList.contains('active'));
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
                hamburger.focus();
            }
        });

        // Leaving mobile widths must not strand the page in the "menu open" state.
        MOBILE_NAV.addEventListener('change', e => {
            if (!e.matches) closeMenu();
        });
    }

    syncNavbarHeight();
    window.addEventListener('resize', syncNavbarHeight);

    /* ---------------------------------------------------------------
       Smooth scrolling for in-page anchors
       (CSS scroll-margin-top keeps targets clear of the sticky navbar)
    --------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.getElementById(href.slice(1));
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: reduceMotion.matches ? 'auto' : 'smooth',
                block: 'start',
            });
            // Keep keyboard focus with the visual jump.
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });

    /* ---------------------------------------------------------------
       Scroll reveal
    --------------------------------------------------------------- */
    const cards = document.querySelectorAll(CARD_SELECTOR);

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
        cards.forEach(card => card.classList.add('revealed'));
    } else {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        cards.forEach(card => {
            card.classList.add('scroll-reveal');
            observer.observe(card);
        });
    }

    /* ---------------------------------------------------------------
       Buttons — ripple + press feedback
    --------------------------------------------------------------- */
    function createRipple(e, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        element.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    document.querySelectorAll('.btn').forEach(button => {
        if (!reduceMotion.matches) {
            button.addEventListener('mouseenter', e => createRipple(e, button));
        }

        button.addEventListener('pointerdown', () => {
            button.style.transform = 'scale(0.97)';
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt => {
            button.addEventListener(evt, () => {
                button.style.transform = '';
            });
        });
    });

    /* ---------------------------------------------------------------
       Card tilt — pointer-driven, desktop only
    --------------------------------------------------------------- */
    if (!reduceMotion.matches && !coarsePointer.matches) {
        document.querySelectorAll(CARD_SELECTOR).forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const rotateX = (y / rect.height) * -6;
                const rotateY = (x / rect.width) * 6;
                // Includes the lift the CSS :hover rule would otherwise apply —
                // an inline transform overrides it, so it has to be reproduced here.
                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ---------------------------------------------------------------
       Scroll-driven state — one listener, rAF throttled
    --------------------------------------------------------------- */
    const navLinks = Array.from(document.querySelectorAll('.nav-menu .nav-link'));
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const heroBackground = document.querySelector('.home .hero-background');

    function currentSectionIndex() {
        let index = 0;
        sections.forEach((section, i) => {
            if (window.scrollY >= section.offsetTop - 200) index = i;
        });
        return index;
    }

    function updateActiveNavLink() {
        if (!sections.length) return;
        const currentId = sections[currentSectionIndex()].id;
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    }

    function updateNavbarShadow() {
        if (!navbar) return;
        navbar.classList.toggle('is-scrolled', window.scrollY > 50);
    }

    function updateParallax() {
        if (!heroBackground || reduceMotion.matches) return;
        heroBackground.style.transform = `translate3d(0, ${window.scrollY * 0.5}px, 0)`;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateActiveNavLink();
            updateNavbarShadow();
            updateParallax();
            ticking = false;
        });
    }, { passive: true });

    updateActiveNavLink();
    updateNavbarShadow();

    /* ---------------------------------------------------------------
       Keyboard section navigation (Arrow Up / Down)
    --------------------------------------------------------------- */
    document.addEventListener('keydown', e => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        if (!sections.length) return;

        // Never hijack arrows while the user is in a field or the open menu.
        const el = document.activeElement;
        if (el && el.closest('input, textarea, select, [contenteditable="true"], .nav-menu')) return;

        // Derive the index from where the page actually is, so the two stay in
        // sync even after the user scrolls with the wheel.
        const index = currentSectionIndex();
        const next = e.key === 'ArrowDown'
            ? Math.min(index + 1, sections.length - 1)
            : Math.max(index - 1, 0);

        if (next === index) return;

        e.preventDefault();
        sections[next].scrollIntoView({
            behavior: reduceMotion.matches ? 'auto' : 'smooth',
            block: 'start',
        });
    });

    /* ---------------------------------------------------------------
       External links open in a new tab, safely
    --------------------------------------------------------------- */
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (link.hostname === window.location.hostname) return;
        if (!link.hasAttribute('target')) link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    console.log(
        '%cStudyBuddy — Pakistan Entry Test Preparation Hub',
        'color: #00d4ff; font-size: 14px; font-weight: bold;'
    );
})();
