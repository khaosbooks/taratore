// ===== COMPONENT LOADING =====
async function loadComponents() {
	try {
		// Preload hero image (must be first operation)
		const heroBg = document.querySelector('.parallax-bg');
		if (heroBg) {
			const bgUrl = heroBg.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = bgUrl;
			document.head.appendChild(link);
		}

		// Load header/footer
		const [headerHtml, footerHtml] = await Promise.all([
			fetch('/includes/header.html').then(res => res.text()),
			fetch('/includes/footer.html').then(res => res.text())
		]);

		// Insert into DOM once
		document.body.insertAdjacentHTML('afterbegin', headerHtml);
		document.body.insertAdjacentHTML('beforeend', footerHtml);

		// Initialize all components
		initializeHeader();
		initializeFooter();
		initializeAccordions();
		initializeExcerptAccordions();
		initializeTooltips();
		initializeLoadMore();
		initializeLoadMoreReviews();
		initializeMaps();
		initializeResourceTabs();
		initializeCountdown();
		initializeHeroSlider();
		initializeSpoilers();
		initializeCharacterDeepLinks();
		initializeBlogComponents();

		document.body.classList.add('components-loaded');

		// Lazy-load non-critical images
		document.querySelectorAll('img:not([loading])').forEach(img => {
			img.setAttribute('loading', 'lazy');
		});



	} catch (error) {
		console.error('Error loading components:', error);
	}
}

// ===== BLOG ACCORDION & FILTER FIX =====
function initializeBlogComponents() {
  const blogSearch = document.querySelector('.blog-filters .search-input');
  const blogFilters = document.querySelectorAll('.blog-filters .pill-list li');
  const resultCount = document.querySelector('.blog-filters .result-count span');
  const blogArticles = document.querySelectorAll('.section-light .accordion-item');

  if (!blogArticles.length) return;

  // Initialize all accordions
  function initAccordions() {
    blogArticles.forEach(article => {
      const header = article.querySelector('.accordion-header');
      const content = article.querySelector('.accordion-content');
      const pills = article.querySelector('.pill-list');

      // Set initial state
      header.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '0';
      if (pills) pills.style.display = 'flex';

      // Remove any existing listeners to prevent duplicates
      header.replaceWith(header.cloneNode(true));
      const newHeader = article.querySelector('.accordion-header');
      
      newHeader.addEventListener('click', function(e) {
        e.preventDefault();
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        this.setAttribute('aria-expanded', !isExpanded);
        content.style.maxHeight = isExpanded ? '0' : content.scrollHeight + 'px';
      });
    });
  }

  // Filter function
  function filterArticles() {
    const searchTerm = blogSearch?.value.toLowerCase() || '';
    const activeFilter = document.querySelector('.blog-filters .pill-list .current')?.dataset.filter || 'all';
    let visibleCount = 0;

    blogArticles.forEach(article => {
      const matchesSearch = article.textContent.toLowerCase().includes(searchTerm);
      const matchesCategory = activeFilter === 'all' || 
                           article.dataset.categories.includes(activeFilter);
      
      if (matchesSearch && matchesCategory) {
        article.style.display = 'block';
        visibleCount++;
        
        // Reset accordion state but preserve current open/close
        const header = article.querySelector('.accordion-header');
        const content = article.querySelector('.accordion-content');
        const isCurrentlyExpanded = header.getAttribute('aria-expanded') === 'true';
        
        content.style.maxHeight = isCurrentlyExpanded ? content.scrollHeight + 'px' : '0';
      } else {
        article.style.display = 'none';
      }
    });

    if (resultCount) resultCount.textContent = visibleCount;
  }

  // Initialize everything
  initAccordions();
  filterArticles();

  // Event listeners
  if (blogSearch) blogSearch.addEventListener('input', filterArticles);
  blogFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      blogFilters.forEach(f => f.classList.remove('current'));
      this.classList.add('current');
      filterArticles();
    });
  });
}

// ===== ANCHOR TO CHARACTER CARDS =====
function initializeCharacterDeepLinks() {
  // Check if URL has a character hash
  if (window.location.hash.startsWith('#character-')) {
    const characterId = window.location.hash.substring(1);
    const characterCard = document.getElementById(characterId);
    
    if (characterCard) {
      // Scroll to character
      setTimeout(() => {
        characterCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add visual highlight
        characterCard.style.boxShadow = '0 0 0 3px var(--accent)';
        characterCard.style.transition = 'box-shadow 0.3s ease';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          characterCard.style.boxShadow = 'none';
        }, 3000);
        
        // Optionally auto-expand first accordion
        const firstAccordion = characterCard.querySelector('.accordion-header');
        if (firstAccordion) {
          firstAccordion.click();
        }
      }, 300); // Small delay to account for page load
    }
  }
}

// ===== SPOILER TAGS =====
function initializeSpoilers() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('spoiler') && !e.target.classList.contains('revealed')) {
      e.target.classList.add('revealed');
      e.preventDefault();
    }
  });
}

// ===== HERO SLIDER =====
function initializeHeroSlider() {
	const homepageHero = document.querySelector('.homepage-hero');
	if (!homepageHero) return;

	const slides = homepageHero.querySelectorAll('.book-hero');
	const indicators = homepageHero.querySelectorAll('.indicator');
	if (slides.length < 2) return;

	let currentSlide = 0;
	const SLIDE_INTERVAL = 7000;
	let slideshowTimer;

	function showSlide(index) {
		slides.forEach(slide => slide.classList.remove('active-slide'));
		indicators.forEach(indicator => indicator.classList.remove('active'));

		slides[index].classList.add('active-slide');
		indicators[index].classList.add('active');
		currentSlide = index;

		initializeParallax();
	}

	function showNextSlide() {
		const nextSlide = (currentSlide + 1) % slides.length;
		showSlide(nextSlide);
	}

	function startSlideshow() {
		slideshowTimer = setInterval(showNextSlide, SLIDE_INTERVAL);
	}

	showSlide(0);
	startSlideshow();

	indicators.forEach((indicator, index) => {
		indicator.addEventListener('click', () => {
			clearInterval(slideshowTimer);
			showSlide(index);
			startSlideshow();
		});
	});
}

// ===== COUNTDOWN TIMER =====
function initializeCountdown() {
	const countdownElement = document.querySelector('.countdown-timer');
	if (!countdownElement) return;

	// Add CSS for styling the labels
	const style = document.createElement('style');
	style.textContent = `
    .countdown-timer span:not([class^="countdown-"]) {
      color: rgba(var(--primary-bg-rgb), var(--dropdown-bg-opacity));;
    }
    .countdown-days, .countdown-hours, .countdown-minutes, .countdown-seconds { color: var(--accent); }

		.countdown-done {
		  color: rgba(var(--primary-bg-rgb), var(--dropdown-bg-opacity));;
		}
  `;
	document.head.appendChild(style);

	const endDate = new Date(countdownElement.dataset.endDate).getTime();

	// Update the countdown every second
	const timer = setInterval(() => {
		const now = new Date().getTime();
		const distance = endDate - now;

		// Time calculations
		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		// Display the result
		if (distance > 0) {
			countdownElement.innerHTML = `
        <span class="countdown-days">${days.toString().padStart(2, '0')}</span><span>d</span> 
        <span class="countdown-hours">${hours.toString().padStart(2, '0')}</span><span>h</span> 
        <span class="countdown-minutes">${minutes.toString().padStart(2, '0')}</span><span>m</span>
        <span class="countdown-seconds">${seconds.toString().padStart(2, '0')}</span><span>s</span>
      `;
		} else {
			// If the countdown is finished
			clearInterval(timer);
			countdownElement.innerHTML = '<span class="countdown-done">There is no current promo sale!</span>';
		}
	}, 1000);

	// Initial call to avoid 1s delay
	timer();
}

// ===== GLOSSARY & DOWNLOADS TABS =====
function initializeResourceTabs() {
	const glossaryFilters = document.querySelector('.glossary-filters');
	const downloadFilters = document.querySelector('.download-filters');

	if (glossaryFilters) glossaryFilters.classList.add('active-filters');
	if (downloadFilters) downloadFilters.classList.remove('active-filters');

	const tabs = document.querySelectorAll('.tab-nav a');
	tabs.forEach(tab => {
		tab.addEventListener('click', function(e) {
			e.preventDefault();

			tabs.forEach(t => t.classList.remove('current'));
			const glossaryCard = document.querySelector('.glossary-filters');
			const downloadsCard = document.querySelector('.download-filters');

			if (glossaryCard) glossaryCard.classList.remove('active-filters');
			if (downloadsCard) downloadsCard.classList.remove('active-filters');

			document.querySelectorAll('.tab-content').forEach(content => {
				content.classList.remove('active-tab');
			});

			this.classList.add('current');

			const targetTab = this.getAttribute('href').replace('#', '');

			if (targetTab === 'glossary') {
				document.getElementById('glossary').classList.add('active-tab');
				if (glossaryFilters) glossaryFilters.classList.add('active-filters');
			} else if (targetTab === 'downloads') {
				document.getElementById('downloads').classList.add('active-tab');
				if (downloadFilters) downloadFilters.classList.add('active-filters');
			}

			updateResourceCounts();
		});
	});

	setupGlossaryFilters();
	setupDownloadFilters();
	updateResourceCounts();
}
function setupGlossaryFilters() {
	const glossarySearch = document.querySelector('.glossary-filters .search-input');
	const glossaryFilters = document.querySelectorAll('.glossary-filters .pill-list li');

	if (!glossarySearch) return;

	// Search functionality
	glossarySearch.addEventListener('input', function() {
		const searchTerm = this.value.toLowerCase();
		const terms = document.querySelectorAll('#glossary .glossary-term');

		terms.forEach(term => {
			const text = term.textContent.toLowerCase();
			const isVisible = text.includes(searchTerm) && checkGlossaryFilter(term);
			term.style.display = isVisible ? 'block' : 'none';
		});

		updateResourceCounts();
	});

	// Filter functionality
	glossaryFilters.forEach(filter => {
		filter.addEventListener('click', function() {
			glossaryFilters.forEach(f => f.classList.remove('current'));
			this.classList.add('current');

			const terms = document.querySelectorAll('#glossary .glossary-term');
			terms.forEach(term => {
				const isVisible = checkGlossaryFilter(term);
				term.style.display = isVisible ? 'block' : 'none';
			});

			updateResourceCounts();
		});
	});
}
function setupDownloadFilters() {
	const downloadSearch = document.querySelector('.download-filters .search-input');
	const downloadFilters = document.querySelectorAll('.download-filters .pill-list li');

	if (!downloadSearch) return;

	// Search functionality
	downloadSearch.addEventListener('input', function() {
		const searchTerm = this.value.toLowerCase();
		const downloads = document.querySelectorAll('#downloads .card');

		downloads.forEach(download => {
			const text = download.textContent.toLowerCase();
			const isVisible = text.includes(searchTerm) && checkDownloadFilter(download);
			download.style.display = isVisible ? 'block' : 'none';
		});

		updateResourceCounts();
	});

	// Filter functionality
	downloadFilters.forEach(filter => {
		filter.addEventListener('click', function() {
			downloadFilters.forEach(f => f.classList.remove('current'));
			this.classList.add('current');

			const downloads = document.querySelectorAll('#downloads .card');
			downloads.forEach(download => {
				const isVisible = checkDownloadFilter(download);
				download.style.display = isVisible ? 'block' : 'none';
			});

			updateResourceCounts();
		});
	});
}
function checkGlossaryFilter(term) {
	const activeFilter = document.querySelector('.glossary-filters .pill-list .current')?.dataset.filter;
	if (activeFilter === 'all') return true;
	const termTypes = term.dataset.types?.split(' ') || [];
	return termTypes.includes(activeFilter);
}
function checkDownloadFilter(download) {
	const activeFilter = document.querySelector('.download-filters .pill-list .current')?.dataset.filter;
	if (activeFilter === 'all') return true;
	const downloadTypes = download.dataset.types?.split(' ') || [];
	return downloadTypes.includes(activeFilter);
}
function updateResourceCounts() {
	// Glossary count
	const visibleTerms = document.querySelectorAll('#glossary .glossary-term[style*="block"], #glossary .glossary-term:not([style])').length;
	const glossaryCount = document.getElementById('glossary-count');
	if (glossaryCount) glossaryCount.textContent = visibleTerms;

	// Downloads count
	const visibleDownloads = document.querySelectorAll('#downloads .card[style*="block"], #downloads .card:not([style])').length;
	const downloadCount = document.getElementById('download-count');
	if (downloadCount) downloadCount.textContent = visibleDownloads;
}

// ===== MAP INITIALIZATION =====
function initializeMaps() {
	// Handle map zoom buttons
	document.querySelectorAll('.map-zoom').forEach(button => {
		button.addEventListener('click', function() {
			const targetId = this.getAttribute('data-target');
			document.querySelector('.active-map').classList.remove('active-map');
			document.getElementById(targetId).classList.add('active-map');
		});
	});

	// Handle back buttons
	document.querySelectorAll('.map-back-btn').forEach(button => {
		button.addEventListener('click', function() {
			const targetId = this.getAttribute('data-target');
			document.querySelector('.active-map').classList.remove('active-map');
			document.getElementById(targetId).classList.add('active-map');
		});
	});

	// Mobile-specific behavior for zoom icons
  if (window.innerWidth <= 900) {
    document.querySelectorAll('.map-zoom').forEach(zoom => {
      let clicked = false;
      
      zoom.addEventListener('click', function(e) {
        if (!clicked) {
          // First click - show tooltip
          e.preventDefault();
          e.stopPropagation();
          clicked = true;
          
          // Hide tooltip after delay if not clicked again
          setTimeout(() => {
            if (clicked) {
              this.querySelector('.tooltip-text').style.visibility = 'hidden';
              clicked = false;
            }
          }, 3000);
        } else {
          // Second click - allow default navigation
          clicked = false;
        }
      });
    });
  }
}

// ===== LOAD MORE ART =====
function initializeLoadMore() {
	const loadMoreBtn = document.querySelector('.load-more');
	const masonryGrid = document.querySelector('.masonry-grid');

	if (!loadMoreBtn || !masonryGrid) return;

	// Configuration
	const BATCH_SIZE = 5;
	let visibleCount = 0;
	const allImages = Array.from(masonryGrid.querySelectorAll('img'));

	// Initialize: Show first batch immediately
	allImages.forEach((img, index) => {
		if (index >= BATCH_SIZE) {
			img.style.display = 'none'; // Hide rest
		}
	});
	visibleCount = BATCH_SIZE; // Track visible items

	// Single-click handler
	loadMoreBtn.addEventListener('click', (e) => {
		e.preventDefault();

		const nextBatch = allImages.slice(visibleCount, visibleCount + BATCH_SIZE);

		nextBatch.forEach(img => {
			img.style.display = 'block'; // Show next batch
		});

		visibleCount += BATCH_SIZE;

		// Hide button if done
		if (visibleCount >= allImages.length) {
			loadMoreBtn.style.display = 'none';
		}
	});

	// Hide button if all images are already visible
	if (allImages.length <= BATCH_SIZE) {
		loadMoreBtn.style.display = 'none';
	}
}

// ===== LOAD MORE REVIEWS =====
function initializeLoadMoreReviews() {
	const loadMoreBtn = document.querySelector('.load-more-reviews');
	const reviewsGrid = document.querySelector('.reviews-grid');

	if (!loadMoreBtn || !reviewsGrid) return;

	// Configuration
	const BATCH_SIZE = 2; // Load 2 reviews per click
	let visibleCount = BATCH_SIZE; // Start with first batch visible
	const allReviews = Array.from(reviewsGrid.querySelectorAll('.review-card'));

	// Initialize - hide all except first batch
	allReviews.forEach((review, index) => {
		if (index >= BATCH_SIZE) {
			review.style.display = 'none';
		}
	});

	// Update button visibility
	const updateButton = () => {
		if (visibleCount >= allReviews.length) {
			loadMoreBtn.style.display = 'none';
		}
	};

	// Initial check
	updateButton();

	// Load more on click
	loadMoreBtn.addEventListener('click', () => {
		const nextBatch = allReviews.slice(visibleCount, visibleCount + BATCH_SIZE);

		nextBatch.forEach(review => {
			review.style.display = 'block';
		});

		visibleCount += BATCH_SIZE;
		updateButton();
	});
}

// ===== EXCERPT ACCORDION =====
function initializeExcerptAccordions() {
	document.querySelectorAll('.accordion-item .excerpt-close').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const accordion = btn.closest('.accordion-item');
			const header = accordion.querySelector('.accordion-header');
			const content = accordion.querySelector('.accordion-content');

			header.setAttribute('aria-expanded', 'false');
			content.style.maxHeight = '0';
		});
	});
}

// ===== TOOLTIP INITIALIZATION =====
function initializeTooltips() {
	document.querySelectorAll('.tooltip-icon[data-wordcount]').forEach(icon => {
		const wordCount = parseInt(icon.dataset.wordcount);
		const formattedCount = wordCount.toLocaleString();
		const pageCount = Math.round(wordCount / 250);

		// Update tooltip text
		icon.querySelector('.tooltip-text').textContent =
			`This would be ${pageCount} pages long as a paperback book, calculated based on an average of 250 words per page.`;

		// Add accessibility attributes
		icon.setAttribute('role', 'button');
		icon.setAttribute('aria-label', 'Word count explanation');
		icon.setAttribute('tabindex', '0');
	});
}

// ===== ACCORDION INITIALIZATION =====
function initializeAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    // Initialize state
    header.setAttribute('aria-expanded', 'false');
    const content = header.nextElementSibling;
    content.style.maxHeight = '0';
    
    header.addEventListener('click', function(e) {
      e.preventDefault(); 
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      
      // Desktop-specific: Ensure full content height
      if (!isExpanded && window.innerWidth > 900) {
        // Temporarily make visible to measure
        content.style.display = 'block';
        content.style.visibility = 'hidden';
        const fullHeight = content.scrollHeight + 'px';
        content.style.visibility = '';
        
        // Apply calculated height
        content.style.maxHeight = 'none';
        content.style.height = fullHeight;
        setTimeout(() => {
          content.style.height = 'auto'; 
        }, 10);
      }

      // Mobile - instant toggle (no animation)
      else {
        content.style.maxHeight = isExpanded ? '0' : 'none';
      }
    });
  });
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
    
    // Reset all dropdowns when closing menu
    if (!this.classList.contains('active')) {
      document.querySelectorAll('.main-dropdown.active, .nested-dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
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
        const dropdown = this.closest('.main-menu-group').querySelector('.main-dropdown');
        const isOpen = dropdown?.classList.contains('active');
        
        // If this is a link to a page (not just a dropdown toggle)
        if (this.getAttribute('href') && this.getAttribute('href') !== '#') {
          // If dropdown is closed, first open it
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            dropdown?.classList.add('active');
          }
          // If dropdown is already open, allow default link behavior
          return;
        }
        
        // For pure dropdown toggles
        e.preventDefault();
        e.stopPropagation();

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
        const submenu = this.closest('.submenu-group').querySelector('.nested-dropdown');
        const isOpen = submenu?.classList.contains('active');
        
        // If this is a link to a page (not just a dropdown toggle)
        if (this.getAttribute('href') && this.getAttribute('href') !== '#') {
          // If submenu is closed, first open it
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            submenu?.classList.add('active');
          }
          // If submenu is already open, allow default link behavior
          return;
        }
        
        // For pure dropdown toggles
        e.preventDefault();
        e.stopPropagation();

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
  document.querySelectorAll('.dropdown-link:not(.with-arrow), .nav-link:not(.with-arrow)').forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 900) {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
        // Reset all dropdowns when selecting a menu item
        document.querySelectorAll('.main-dropdown.active, .nested-dropdown.active').forEach(dropdown => {
          dropdown.classList.remove('active');
        });
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
      // Reset all dropdowns when clicking outside
      document.querySelectorAll('.main-dropdown.active, .nested-dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
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
	const layers = [{
			element: document.querySelector('.parallax-bg'),
			speed: 0.5
		},
		{
			element: document.querySelector('.parallax-glow'),
			speed: 0.1
		},
		{
			element: document.querySelector('.parallax-foreground'),
			speed: 0.3
		}
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

		window.addEventListener('scroll', onScroll, {
			passive: true
		});
		updateParallax();
	}
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
	loadComponents().then(() => {
		initializeParallax();
	});
});
document.querySelectorAll('img:not([loading])').forEach(img => {
  img.setAttribute('loading', 'lazy');
});