/**
 * shared.js - Cross-page content integration for book/series pages
 * Handles:
 * 1. Character sharing between book and series pages
 * 2. Series summary inclusion in book pages
 */

document.addEventListener('DOMContentLoaded', function() {
  // =============================================
  // 1. CHARACTER SHARING SYSTEM
  // =============================================
  
  /**
   * Builds the series character grid by collecting characters from all books
   */
  function buildSeriesCharacterGrid() {
    const characterGrid = document.querySelector('.character-grid[data-series]');
    if (!characterGrid) return;
    
    const seriesId = characterGrid.dataset.series;
    const sortMethod = characterGrid.dataset.sort || 'book-order';
    
    // Get all characters marked with this series
    const characterCards = Array.from(
      document.querySelectorAll(`.character-card[data-series="${seriesId}"]`)
    );
    
    // Sort characters based on specified method
    if (sortMethod === 'book-order') {
      characterCards.sort((a, b) => {
        const aBooks = a.dataset.books.split(',');
        const bBooks = b.dataset.books.split(',');
        return aBooks[0].localeCompare(bBooks[0]);
      });
    } else if (sortMethod === 'alphabetical') {
      characterCards.sort((a, b) => {
        const aName = a.querySelector('h3').textContent;
        const bName = b.querySelector('h3').textContent;
        return aName.localeCompare(bName);
      });
    }
    
    // Clear existing content (in case of reload)
    characterGrid.innerHTML = '';
    
    // Process and display each character
    characterCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.removeAttribute('data-character-id');
      
      // Add book appearance badges
      const books = card.dataset.books.split(',');
      const bookBadges = books.map(book => {
        const cleanBook = book.trim();
        return `<span class="book-badge" data-book="${cleanBook}">${cleanBook.replace(/-/g, ' ')}</span>`;
      }).join('');
      
      // Add role indicator if specified
      const roleBadge = card.dataset.role === 'mc' ? 
        '<span class="role-badge mc">Main Character</span>' : 
        '';
      
      // Create info container
      const infoContainer = document.createElement('div');
      infoContainer.className = 'character-meta';
      infoContainer.innerHTML = `
        ${roleBadge}
        <div class="book-appearances">Appears in: ${bookBadges}</div>
      `;
      
      // Insert meta info after character name
      const characterName = clone.querySelector('h3');
      characterName.insertAdjacentElement('afterend', infoContainer);
      
      characterGrid.appendChild(clone);
    });
    
    // Add click handlers for book badges
    document.querySelectorAll('.book-badge').forEach(badge => {
      badge.addEventListener('click', function() {
        const bookId = this.dataset.book;
        window.location.href = `/books/${bookId}`;
      });
    });
  }
  
  // =============================================
  // 2. SERIES SNIPPET INCLUSION SYSTEM
  // =============================================
  
  /**
   * Inserts series summary snippets into book pages
   */
  function insertSeriesSnippets() {
    const snippetContainer = document.querySelector('.series-info-snippet');
    if (!snippetContainer) return;
    
    const seriesId = snippetContainer.dataset.series;
    const seriesSnippet = document.querySelector(`.series-snippet[data-series="${seriesId}"]`);
    
    if (seriesSnippet) {
      // Clone the snippet content
      const snippetContent = seriesSnippet.cloneNode(true);
      snippetContent.removeAttribute('data-series');
      snippetContent.removeAttribute('data-max-length');
      
      // Truncate if needed
      const maxLength = parseInt(seriesSnippet.dataset.maxLength) || 200;
      const paragraphs = snippetContent.querySelectorAll('p');
      
      paragraphs.forEach(p => {
        if (p.textContent.length > maxLength) {
          p.textContent = p.textContent.substring(0, maxLength) + '...';
        }
      });
      
      // Insert into book page
      snippetContainer.appendChild(snippetContent);
      
      // Add "View Full Series" button
      const viewMoreBtn = document.createElement('a');
      viewMoreBtn.href = `/series/${seriesId}`;
      viewMoreBtn.className = 'btn btn-secondary';
      viewMoreBtn.textContent = 'View Full Series';
      snippetContainer.appendChild(viewMoreBtn);
    }
  }
  
  // =============================================
  // INITIALIZATION
  // =============================================
  
  // Check which features to initialize
  if (document.querySelector('.character-grid[data-series]')) {
    buildSeriesCharacterGrid();
  }
  
  if (document.querySelector('.series-info-snippet')) {
    insertSeriesSnippets();
  }
  
  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  
  /**
   * Debounce function for performance
   */
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Rebuild on window resize (for responsive layouts)
  window.addEventListener('resize', debounce(function() {
    if (document.querySelector('.character-grid[data-series]')) {
      buildSeriesCharacterGrid();
    }
  }, 250));
});