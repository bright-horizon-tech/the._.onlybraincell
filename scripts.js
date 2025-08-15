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

// 📂 Load project cards from JSON list in GitHub repo
async function fetchAndRenderProjectCards() {
  const container = document.querySelector('.projects-grid');
  if (!container) return;

  const baseUrl = 'https://raw.githubusercontent.com/bright-horizon-tech/braincell-posts/projects/';
  const jsonUrl = `${baseUrl}project-files.json`;

  try {
    // Get list of project files from JSON
    const jsonRes = await fetch(jsonUrl);
    if (!jsonRes.ok) throw new Error('Failed to fetch project-files.json');
    const fileList = await jsonRes.json();

    const filesToLoad = fileList.slice(0, 12);

    for (const fileName of filesToLoad) {
      try {
        const response = await fetch(`${baseUrl}${encodeURIComponent(fileName)}`);
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
  } catch (err) {
    console.error('Error fetching project list:', err);
    container.innerHTML = `<p>Could not load project list.</p>`;
  }
}

// 🧠 Full view modal logic
function setupPopups() {
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view-full')) {
      const url = e.target.dataset.url;
      openModal(url);
    }
    if (e.target.classList.contains('close-popup')) {
      closeModal();
    }
  });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('popup-markdown')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

let currentModal = null;

async function openModal(url) {
  try {
    if (currentModal) closeModal();

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

    setTimeout(() => popup.classList.add('active'), 10);
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

// 🧃 Init
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProjectCards();
});

document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

