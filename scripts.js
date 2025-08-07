// 📱 Mobile nav toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.remove('active');
  });
});

// 🌀 Scroll reveal animation
function setupScrollAnimations() {
  const elements = document.querySelectorAll('.project-card, .feature-card');
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

// 📂 Load project cards from GitHub Markdown
async function fetchAndRenderProjectCards() {
  const container = document.querySelector('.projects-grid');
  if (!container) return;

  const baseUrl = 'https://raw.githubusercontent.com/bright-horizon-tech/braincell-posts/projects/';
  const fileList = [
    'FolderFlow.md',
    // Add more .md filenames here
  ];

  const filesToLoad = fileList.slice(0, 12);

  for (const fileName of filesToLoad) {
    try {
      const res = await fetch(`${baseUrl}${fileName}`);
      if (!res.ok) throw new Error(`Could not fetch ${fileName}`);
      const raw = await res.text();
      const lines = raw.split('\n');

      // 🧽 Skip frontmatter
      let start = 0;
      if (lines[0].trim() === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            start = i + 1;
            break;
          }
        }
      }

      // 🧠 Parse title and description
      let title = '';
      let desc = '';

      for (let i = start; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!title && line.startsWith('#')) {
          title = line.replace(/^#+\s*/, '');
          continue;
        }
        if (line === '') break;
        desc += lines[i] + '\n';
      }

      if (!title) title = fileName.replace('.md', '');
      const previewHTML = marked.parse(desc);

      // 🧱 Build card
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <h3>${title}</h3>
        <div class="md-preview">${previewHTML}</div>
        <button class="btn view-full" data-url="${baseUrl}${fileName}">View Full</button>
      `;
      container.appendChild(card);
    } catch (err) {
      console.error(`Error with ${fileName}:`, err);
      const errorCard = document.createElement('div');
      errorCard.className = 'project-card';
      errorCard.innerHTML = `
        <h3>${fileName.replace('.md', '')}</h3>
        <div class="md-preview">⚠️ Failed to load project.</div>
        <button class="btn" disabled>Unavailable</button>
      `;
      container.appendChild(errorCard);
    }
  }

  setupScrollAnimations();
  setupPopups();
}

// 🧊 Popup modal viewer
function setupPopups() {
  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('view-full')) {
      const url = e.target.dataset.url;
      openModal(url);
    }

    if (e.target.classList.contains('popup-markdown') || e.target.classList.contains('close-popup')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

let currentModal = null;

async function openModal(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load');

    const raw = await res.text();
    const html = marked.parse(raw);

    const popup = document.createElement('div');
    popup.className = 'popup-markdown';
    popup.innerHTML = `
      <div class="popup-content">
        <button class="close-popup">&times;</button>
        <div class="markdown-content">${html}</div>
      </div>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    currentModal = popup;
    popup.querySelector('.close-popup').focus();
  } catch (err) {
    console.error('Modal load error:', err);
    alert('Error loading full view.');
  }
}

function closeModal() {
  if (currentModal) {
    currentModal.classList.add('closing');
    setTimeout(() => {
      currentModal.remove();
      document.body.style.overflow = '';
      currentModal = null;
    }, 250);
  }
}

// 🧃 Init
document.addEventListener('DOMContentLoaded', fetchAndRenderProjectCards);
