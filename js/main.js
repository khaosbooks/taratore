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
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (window.innerWidth > 900) {
                this.querySelector('.submenu')?.classList.add('active');
            }
        });
        item.addEventListener('mouseleave', function() {
            if (window.innerWidth > 900) {
                this.querySelector('.submenu')?.classList.remove('active');
            }
        });
    });

    // Mobile click behavior for main items (Books)
    document.querySelectorAll('.main-menu-group > .with-arrow').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = this.closest('.main-menu-group').querySelector('.main-dropdown');
                const isOpen = dropdown?.classList.contains('active');
                
                // Close all other dropdowns
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

    // Close menu when clicking non-arrow links
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
    // Update copyright year
    const yearElement = document.querySelector('.footer-bottom .year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize MailerLite
    initializeMailerLite();
}

function initializeMailerLite() {
    // Load MailerLite script if not already loaded
    if (!document.querySelector('script[src*="mailerlite"]')) {
        const script = document.createElement('script');
        script.src = 'https://assets.mailerlite.com/js/universal.js';
        script.async = true;
        script.onload = setupMailerLiteForm;
        document.head.appendChild(script);
    } else if (window.ml) {
        setupMailerLiteForm();
    } else {
        // Retry every 500ms until MailerLite is loaded
        const checkInterval = setInterval(() => {
            if (window.ml) {
                clearInterval(checkInterval);
                setupMailerLiteForm();
            }
        }, 500);
    }
}

// ===== PARALLAX EFFECT =====
function initializeParallax() {
  const layers = [
    { element: document.querySelector('.parallax-bg'), speed: 0.5 }, 
    { element: document.querySelector('.parallax-glow'), speed: 0.1 },
    { element: document.querySelector('.parallax-foreground'), speed: 0.3 } 
  ].filter(layer => layer.element); 

  if (layers.length) {
    let lastScrollPosition = 0;
    let ticking = false;
    
    const updateParallax = () => {
      layers.forEach(layer => {
        layer.element.style.transform = `translateY(${lastScrollPosition * layer.speed}px)`;
      });
      ticking = false;
    };
    
    const onScroll = () => {
      lastScrollPosition = window.pageYOffset;
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax(); 
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadComponents().then(() => {
        initializeParallax(); 
    });
});