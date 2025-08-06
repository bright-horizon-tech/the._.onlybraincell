// 📱 Mobile nav toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.remove('active');
  });
});

// 🎈 Floaty hero image vibes
const heroImage = document.querySelector('.hero-image');
if (heroImage) {
  setInterval(() => {
    heroImage.style.animation = 'none';
    setTimeout(() => {
      heroImage.style.animation = 'float 4s ease-in-out infinite';
    }, 10);
  }, 4000);
}

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

// 📂 Load project cards from raw GitHub folder (not using GitHub API)
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

  for (const fileName of fileList) {
    try {
      const rawMd = await (await fetch(`${baseUrl}${fileName}`)).text();
      const lines = rawMd.split('\n').filter(Boolean);
      const title = lines[0]?.replace(/^#\s*/, '') || fileName.replace('.md', '');
      const previewMd = lines.slice(1, 5).join(' ');
      const previewHTML = marked.parse(previewMd);

      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-content">
          <h3>${title}</h3>
          <div class="md-preview">${previewHTML}</div>
          <button class="btn view-full" data-url="${baseUrl}${fileName}">View Full</button>
        </div>
      `;
      container.appendChild(card);
    } catch (err) {
      console.warn(`Couldn't fetch ${fileName}:`, err);
    }
  }

  setupScrollAnimations();
  setupPopups();
}

// 🧠 Full view popup logic
function setupPopups() {
  document.querySelectorAll('.view-full').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      const fullMd = await (await fetch(url)).text();
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

      // Animate popup
      setTimeout(() => {
        popup.style.opacity = '1';
        popup.querySelector('.popup-content').style.transform = 'scale(1)';
      }, 10);

      popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.style.opacity = '0';
        popup.querySelector('.popup-content').style.transform = 'scale(0.95)';
        setTimeout(() => popup.remove(), 300);
      });
    });
  });
}

// 🧃 On page load, do the things
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProjectCards();
});
