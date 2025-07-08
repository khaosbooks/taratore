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
        initializeAccordions();
        initializeTooltips();
        initializeReviewScroller();

        document.body.classList.add('components-loaded');
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// ===== REVIEW SCROLLER =====
function initializeReviewScroller() {
    // Wait for everything to be ready
    setTimeout(() => {
        const container = document.querySelector('.reviews-container');
        if (!container) {
            console.error('Review container not found');
            return;
        }

        const scroller = container.querySelector('.reviews-scroller');
        const track = container.querySelector('.reviews-track');
        const cards = Array.from(track.querySelectorAll('.review-card'));
        const prevBtn = container.querySelector('.left-arrow');
        const nextBtn = container.querySelector('.right-arrow');

        // Validate we have enough cards
        if (cards.length < 3) {
            console.warn('Need at least 3 review cards');
            return;
        }

        // Clone cards for infinite loop
        const cloneCards = cards.map(card => card.cloneNode(true));
        cloneCards.forEach(card => track.appendChild(card));

        // Calculate card width including gap
        const cardWidth = cards[0].offsetWidth + 
                        parseInt(getComputedStyle(cards[0]).marginLeft) +
                        parseInt(getComputedStyle(cards[0]).marginRight) +
                        parseInt(getComputedStyle(track).gap);

        // State management
        let currentIndex = 0;
        let isAnimating = false;

        // Core scroll function
        function scrollToIndex(index, behavior = 'smooth') {
            if (isAnimating) return;
            isAnimating = true;

            const totalCards = cards.length;
            let targetPos = index * cardWidth;

            // Handle infinite loop
            if (index >= totalCards) {
                currentIndex = 0;
                targetPos = 0;
            } else if (index < 0) {
                currentIndex = totalCards - 1;
                targetPos = totalCards * cardWidth;
            } else {
                currentIndex = index;
            }

            scroller.scrollTo({
                left: targetPos,
                behavior: behavior
            });

            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }

        // Navigation functions
        function nextCard() {
            scrollToIndex(currentIndex + 1);
        }

        function prevCard() {
            scrollToIndex(currentIndex - 1);
        }

        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextCard);
        if (prevBtn) prevBtn.addEventListener('click', prevCard);

        // Handle infinite scroll reset
        scroller.addEventListener('scroll', () => {
            const totalWidth = cards.length * cardWidth;
            if (scroller.scrollLeft >= totalWidth) {
                scroller.scrollLeft = 0;
            } else if (scroller.scrollLeft <= 0) {
                scroller.scrollLeft = totalWidth - cardWidth;
            }
        });

        // Initialize position
        scrollToIndex(0, 'auto');

    }, 100); // Small delay to ensure DOM is ready
}

// ===== TOOLTIP INITIALIZATION =====
function initializeTooltips() {
    document.querySelectorAll('.tooltip-icon[data-wordcount]').forEach(icon => {
        const wordCount = parseInt(icon.dataset.wordcount);
        const pageCount = Math.round(wordCount / 250);
        
        icon.querySelector('.tooltip-text').textContent = 
            `This would be ${pageCount} pages long as a paperback book.`;
        
        icon.setAttribute('role', 'button');
        icon.setAttribute('aria-label', 'Word count explanation');
    });
}

// ===== ACCORDION INITIALIZATION =====
function initializeAccordions() {
    document.querySelectorAll('.accordion-item').forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        header.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0';
        
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            content.style.maxHeight = isExpanded ? '0' : `${content.scrollHeight}px`;
        });
    });
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

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        }
    });

    // Sticky header
    const header = document.querySelector('.header');
    function updateHeader() {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', updateHeader);
    updateHeader();
}

// ===== FOOTER INITIALIZATION =====
function initializeFooter() {
    // Update copyright year
    const yearElement = document.querySelector('.footer-bottom .year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});