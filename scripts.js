// Mobile navigation toggle and animations (keep existing code)

// Project cards from markdown with pagination and filtering
const PROJECTS_PER_PAGE = 6;
let allProjects = [];
let filteredProjects = [];
let currentPage = 1;
let currentTagFilter = '';
let currentSearchTerm = '';
let currentSort = 'newest';

async function fetchAndRenderProjectCards() {
  const container = document.querySelector('.projects-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const pagination = document.getElementById('pagination');
  const tagFilter = document.getElementById('tag-filter');
  
  // Show loading spinner
  loadingSpinner.classList.add('visible');
  container.innerHTML = '';
  pagination.style.display = 'none';

  try {
    const res = await fetch('https://api.github.com/repos/bright-horizon-tech/braincell-posts/contents/projects');
    const files = await res.json();
    const mdFiles = files.filter(file => file.name.endsWith('.md'));
    
    // Sort files by commit date (newest first by default)
    mdFiles.sort((a, b) => new Date(b.commit.committer.date) - new Date(a.commit.committer.date));
    
    // Reset state
    allProjects = [];
    const allTags = new Set();
    
    // Process each markdown file
    for (const file of mdFiles) {
      try {
        const rawMdRes = await fetch(file.download_url);
        const rawMd = await rawMdRes.text();
        
        const lines = rawMd.split('\n').filter(l => l.trim());
        const title = lines[0].replace(/^#\s*/, '') || file.name.replace('.md', '');
        
        // Extract tags - look for a line starting with "Tags:"
        let tags = [];
        const tagsLine = lines.find(line => line.toLowerCase().startsWith('tags:'));
        if (tagsLine) {
          tags = tagsLine.replace(/^tags:\s*/i, '')
                         .split(',')
                         .map(tag => tag.trim())
                         .filter(tag => tag);
        }
        
        // Add tags to global set
        tags.forEach(tag => allTags.add(tag));
        
        const previewMd = lines.slice(1, 5).join(' ');
        const fullMd = rawMd;
        const date = file.commit.committer.date;
        
        allProjects.push({
          title,
          tags,
          previewMd,
          fullMd,
          download_url: file.download_url,
          date
        });
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }
    }
    
    // Populate tag filter dropdown
    tagFilter.innerHTML = '<option value="">All Tags</option>';
    allTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
    
    // Apply initial filters and render
    applyFilters();
    
  } catch (err) {
    console.error("Error fetching markdown files:", err);
    container.innerHTML = `<p class="error">Couldn't load projects. Try again later.</p>`;
  } finally {
    loadingSpinner.classList.remove('visible');
  }
}

function applyFilters() {
  filteredProjects = [...allProjects];
  
  // Apply search filter
  if (currentSearchTerm) {
    const searchTerm = currentSearchTerm.toLowerCase();
    filteredProjects = filteredProjects.filter(project => 
      project.title.toLowerCase().includes(searchTerm) || 
      project.previewMd.toLowerCase().includes(searchTerm) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply tag filter
  if (currentTagFilter) {
    filteredProjects = filteredProjects.filter(project => 
      project.tags.includes(currentTagFilter)
    );
  }
  
  // Apply sorting
  switch (currentSort) {
    case 'oldest':
      filteredProjects.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'alphabetical':
      filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
      filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
  }
  
  // Render paginated results
  renderPaginatedProjects();
}

function renderPaginatedProjects() {
  const container = document.querySelector('.projects-grid');
  const pagination = document.getElementById('pagination');
  const pageInfo = document.getElementById('page-info');
  
  container.innerHTML = '';
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  currentPage = Math.min(currentPage, totalPages) || 1;
  
  // Update page info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  
  // Show/hide pagination
  if (filteredProjects.length > PROJECTS_PER_PAGE) {
    pagination.style.display = 'flex';
  } else {
    pagination.style.display = 'none';
  }
  
  // Enable/disable pagination buttons
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages;
  
  // Get projects for current page
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PROJECTS_PER_PAGE, filteredProjects.length);
  const pageProjects = filteredProjects.slice(startIndex, endIndex);
  
  // Render project cards
  if (pageProjects.length === 0) {
    container.innerHTML = `<p class="no-results">No projects found matching your criteria</p>`;
    return;
  }
  
  pageProjects.forEach(project => {
    const previewHTML = marked.parse(project.previewMd);
    
    const card = document.createElement('div');
    card.className = 'project-card no-image';
    card.innerHTML = `
      <div class="project-content">
        <h3>${project.title}</h3>
        ${project.tags.length ? `
          <div class="project-tags">
            ${project.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
          </div>
        ` : ''}
        <div class="md-preview">${previewHTML}</div>
        <button class="btn view-full" data-url="${project.download_url}">View Full</button>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Add animation to new cards
  document.querySelectorAll('.project-card:not(.visible)').forEach(card => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(card);
  });
  
  // Add tag click handlers
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedTag = tag.dataset.tag;
      document.getElementById('tag-filter').value = selectedTag;
      currentTagFilter = selectedTag;
      currentPage = 1;
      applyFilters();
    });
  });
  
  // Add full view handlers
  document.querySelectorAll('.view-full').forEach(button => {
    button.addEventListener('click', async () => {
      const fullUrl = button.dataset.url;
      const project = allProjects.find(p => p.download_url === fullUrl);
      
      if (!project) return;
      
      const fullHTML = DOMPurify.sanitize(marked.parse(project.fullMd));
      
      // Create popup/modal
      const popup = document.createElement('div');
      popup.className = 'popup-markdown';
      popup.innerHTML = `
        <div class="popup-content">
          <button class="close-popup">&times;</button>
          <h2>${project.title}</h2>
          ${project.tags.length ? `
            <div class="project-tags">
              ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          <div class="markdown-content">${fullHTML}</div>
        </div>
      `;
      document.body.appendChild(popup);
      
      // Add copy buttons to code blocks
      popup.querySelectorAll('pre').forEach(pre => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyButton.addEventListener('click', () => {
          const code = pre.querySelector('code')?.innerText || '';
          navigator.clipboard.writeText(code).then(() => {
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
              copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
          });
        });
        pre.appendChild(copyButton);
      });
      
      // Add animation
      setTimeout(() => {
        popup.style.opacity = '1';
        popup.querySelector('.popup-content').style.transform = 'scale(1)';
      }, 10);
      
      // Close handler
      popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.style.opacity = '0';
        popup.querySelector('.popup-content').style.transform = 'scale(0.95)';
        setTimeout(() => popup.remove(), 300);
      });
    });
  });
}

// Set up event listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('project-search');
  searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    currentPage = 1;
    applyFilters();
  });
  
  // Tag filter
  const tagFilter = document.getElementById('tag-filter');
  tagFilter.addEventListener('change', (e) => {
    currentTagFilter = e.target.value;
    currentPage = 1;
    applyFilters();
  });
  
  // Sort selector
  const sortSelect = document.getElementById('sort-projects');
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    applyFilters();
  });
  
  // Pagination
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPaginatedProjects();
    }
  });
  
  document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      renderPaginatedProjects();
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Existing animation code...
  
  // New project loading code
  fetchAndRenderProjectCards();
  setupEventListeners();
});