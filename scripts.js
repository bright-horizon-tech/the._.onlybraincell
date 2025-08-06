// Mobile navigation toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Animate elements on scroll
document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
  fetchAndRenderProjectCards();
});

// Floating hero image animation reset
const heroImage = document.querySelector('.hero-image');
if (heroImage) {
  setInterval(() => {
    heroImage.style.animation = 'none';
    setTimeout(() => {
      heroImage.style.animation = 'float 4s ease-in-out infinite';
    }, 10);
  }, 4000);
}

// Animate cards when they enter viewport
function animateOnScroll() {
  const animatedItems = document.querySelectorAll('.feature-card, .project-card');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedItems.forEach(item => observer.observe(item));
}

// Fetch and render project cards from raw GitHub content
async function fetchAndRenderProjectCards() {
  const container = document.querySelector('.projects-grid');
  const repo = 'bright-horizon-tech/braincell-posts';
  const branch = 'projects';
  const files = ['FolderFlow.md']; // Add more filenames here if needed

  for (const file of files) {
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/projects/${file}`;

    try {
      const rawMd = await (await fetch(rawUrl)).text();
      const lines = rawMd.split('\n').filter(line => line.trim());
      const title = lines[0].replace(/^#\s*/, '') || file.replace('.md', '');
      const previewMd = lines.slice(1, 5).join(' ');
      const previewHTML = marked.parse(previewMd);

      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-content">
          <h3>${title}</h3>
          <div class="md-preview">${previewHTML}</div>
          <button class="btn view-full" data-url="${rawUrl}">View Full</button>
        </div>
      `;
      container.appendChild(card);

      // Animate the card on scroll
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(card);

      // Full view popup handler
      card.querySelector('.view-full').addEventListener('click', async () => {
        const fullMd = await (await fetch(rawUrl)).text();
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

    } catch (err) {
      console.error(`Error loading ${file}:`, err);
      container.innerHTML = `<p class="error">Couldn't load project cards. Please try again later.</p>`;
    }
  }
}
