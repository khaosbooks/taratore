// ===== COMPONENT LOADING =====
async function loadComponents() {
    try {
        const [headerHtml, footerHtml] = await Promise.all([
            fetch('/includes/header.html').then(res => res.text()),
            fetch('/includes/footer.html').then(res => res.text())
        ]);
        
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
        document.body.insertAdjacentHTML('beforeend', footerHtml);
        
        initializeHeader();
        initializeFooter();

        document.body.classList.add('components-loaded');
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// ===== HEADER INITIALIZATION =====
function initializeHeader() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Add dropdown arrows if missing
    document.querySelectorAll('.mobile-menu-group > .nav-link, .mobile-menu-group > .dropdown-link').forEach(link => {
        if (!link.querySelector('.dropdown-arrow') && link.nextElementSibling?.classList.contains('dropdown')) {
            link.innerHTML += '<span class="dropdown-arrow">▾</span>';
            link.classList.add('with-arrow');
        }
    });

    // Mobile menu toggle
    hamburger?.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Desktop hover behavior
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (window.innerWidth > 900) {
                this.querySelector('.dropdown')?.classList.add('active');
            }
        });
        item.addEventListener('mouseleave', function() {
            if (window.innerWidth > 900) {
                this.querySelector('.dropdown')?.classList.remove('active');
            }
        });
    });

    // Mobile click behavior
    document.querySelectorAll('.mobile-menu-group > .with-arrow').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const parentGroup = this.closest('.mobile-menu-group');
                const dropdown = parentGroup.querySelector('.dropdown');
                const isOpen = dropdown?.classList.contains('active');
                
                // Close all other dropdowns at the same level
                document.querySelectorAll('.dropdown.active').forEach(dd => {
                    if (dd !== dropdown) dd.classList.remove('active');
                });
                
                // Toggle current dropdown
                dropdown?.classList.toggle('active', !isOpen);
            }
        });
    });

    // Mobile submenu click behavior
    document.querySelectorAll('.dropdown-item > .mobile-menu-group > .with-arrow').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const parentGroup = this.closest('.mobile-menu-group');
                const submenu = parentGroup.querySelector('.submenu');
                const isOpen = submenu?.classList.contains('active');
                
                // Close all other submenus at the same level
                parentGroup.parentElement.querySelectorAll('.submenu.active').forEach(sm => {
                    if (sm !== submenu) sm.classList.remove('active');
                });
                
                // Toggle current submenu
                submenu?.classList.toggle('active', !isOpen);
            }
        });
    });

    // Close menu when clicking dropdown links
    document.querySelectorAll('.dropdown-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 900) {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
            }
        });
    });

    // Sticky header
    const header = document.querySelector('.header');
    function updateHeader() {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', updateHeader);
    updateHeader();

    // Highlight current page
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.pathname === window.location.pathname) {
            link.classList.add('active');
            const parentItem = link.closest('.mobile-menu-group');
            if (parentItem) {
                parentItem.querySelector('.dropdown')?.classList.add('active');
            }
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && hamburger && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ===== FOOTER INITIALIZATION =====
function initializeFooter() {
    const yearElement = document.querySelector('.footer-bottom .year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    document.querySelectorAll('.footer-nav a').forEach(link => {
        if (link.pathname === window.location.pathname) {
            link.classList.add('active');
        }
    });
    
    document.querySelector('.footer-logo')?.addEventListener('click', (e) => {
        if (e.currentTarget.href === window.location.href) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});