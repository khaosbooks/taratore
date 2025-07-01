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
    
    // Mobile menu toggle
    hamburger?.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Mobile click behavior for main menu items (Books)
    document.querySelectorAll('.main-menu-group > .with-arrow').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = this.closest('.main-menu-group').querySelector('.main-dropdown');
                const isOpen = dropdown?.classList.contains('active');
                
                // Close all other main dropdowns
                document.querySelectorAll('.main-dropdown.active').forEach(dd => {
                    if (dd !== dropdown) dd.classList.remove('active');
                });
                
                // Close all submenus when opening a main menu
                if (!isOpen) {
                    document.querySelectorAll('.nested-dropdown.active').forEach(sub => {
                        sub.classList.remove('active');
                    });
                }
                
                dropdown?.classList.toggle('active', !isOpen);
            }
        });
    });

    // Mobile click behavior for submenu items (Series 1/2)
    document.querySelectorAll('.submenu-group > .with-arrow').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = this.closest('.submenu-group').querySelector('.nested-dropdown');
                const isOpen = submenu?.classList.contains('active');
                
                // Toggle current submenu
                submenu?.classList.toggle('active', !isOpen);
                
                // Close other submenus at the same level
                if (this.closest('.main-dropdown')) {
                    this.closest('.main-dropdown').querySelectorAll('.nested-dropdown').forEach(sm => {
                        if (sm !== submenu) sm.classList.remove('active');
                    });
                }
            }
        });
    });

    // Close menu when clicking regular links
    document.querySelectorAll('.dropdown-link:not(.with-arrow)').forEach(link => {
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