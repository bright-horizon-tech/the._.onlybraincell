// 📱 Mobile nav toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.remove('active');
  });
});

// 🚀 Scroll-in animation for project and feature cards
function setupScrollAnimations() {
  const elements = document.querySelectorAll('.feature-card, .project-card');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// 📂 Load project cards from raw GitHub folder
async function fetchAndRenderProjectCards() {
  const container = document.querySelector('.projects-grid');
  if (!container) return;

  const baseUrl = 'https://raw.githubusercontent.com/bright-horizon-tech/braincell-posts/projects/';
  const fileList = [
    'FolderFlow.md',
    // ⬇️ Add more .md file names below when you create them
    // 'AnotherProject.md',
    // 'YetAnother.md'
  ];

  // Load only first 12 projects
  const filesToLoad = fileList.slice(0, 12);

  for (const fileName of filesToLoad) {
    try {
      const response = await fetch(`${baseUrl}${fileName}`);
      if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);
      
      const rawMd = await response.text();
      const lines = rawMd.split('\n');
      const title = lines[0]?.replace(/^#\s*/, '') || fileName.replace('.md', '');
      
      // Extract description until first '---'
      let description = '';
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') break;
        description += lines[i] + '\n';
      }
      
      const previewHTML = marked.parse(description);

      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <div class="project-content">
          <h3>${title}</h3>
          <div class="md-preview">${previewHTML}</div>
          <button class="btn view-full" data-url="${baseUrl}${fileName}">View Full</button>
        </div>
      `;
      container.appendChild(card);
    } catch (err) {
      console.warn(`Couldn't fetch ${fileName}:`, err);
      // Create placeholder card
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="project-content">
          <h3>${fileName.replace('.md', '')}</h3>
          <div class="md-preview">Failed to load project details</div>
          <button class="btn" disabled>Unavailable</button>
        </div>
      `;
      container.appendChild(card);
    }
  }

  setupScrollAnimations();
  setupPopups();
}

// 🧠 Full view modal logic
function setupPopups() {
  // Use event delegation for dynamically created buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-full')) {
      const url = e.target.dataset.url;
      openModal(url);
    }
    
    if (e.target.classList.contains('close-popup')) {
      closeModal();
    }
  });

  // Close modal when clicking on overlay
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('popup-markdown')) {
      closeModal();
    }
  });

  // Close modal with ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

let currentModal = null;

async function openModal(url) {
  try {
    // Close existing modal if open
    if (currentModal) {
      closeModal();
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load project');
    
    const fullMd = await response.text();
    const fullHTML = marked.parse(fullMd);

    const popup = document.createElement('div');
    popup.className = 'popup-markdown';
    popup.innerHTML = `
      <div class="popup-content">
        <button class="close-popup">&times;</button>
        <div class="markdown-content">${fullHTML}</div>
      </div>
    `;
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    currentModal = popup;
    
    // Add active class to show modal with animation
    setTimeout(() => {
      popup.classList.add('active');
    }, 10);

  } catch (err) {
    console.error('Error loading project:', err);
    alert('Failed to load project details. Please try again later.');
  }
}

function closeModal() {
  if (currentModal) {
    currentModal.classList.remove('active');
    setTimeout(() => {
      currentModal.remove();
      document.body.style.overflow = '';
      currentModal = null;
    }, 300);
  }
}

// 🧃 On page load, do the things
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProjectCards();
});
