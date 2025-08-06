// Mobile navigation toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Animation on scroll
document.addEventListener('DOMContentLoaded', () => {
  const animatedItems = document.querySelectorAll('.feature-card, .project-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedItems.forEach(item => {
    observer.observe(item);
  });
  
  // Load project cards
  fetchAndRenderProjectCards();
});

// Hero image floating animation
const heroImage = document.querySelector('.hero-image');
if (heroImage) {
  setInterval(() => {
    heroImage.style.animation = 'none';
    setTimeout(() => {
      heroImage.style.animation = 'float 4s ease-in-out infinite';
    }, 10);
  }, 4000);
}

// Project cards from markdown
async function fetchAndRenderProjectCards() {
  const container = document.querySelector('.projects-grid');

  try {
    const res = await fetch('https://api.github.com/repos/bright-horizon-tech/braincell-posts/contents/projects');
    const files = await res.json();

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const rawMdRes = await fetch(file.download_url);
        const rawMd = await rawMdRes.text();

        const lines = rawMd.split('\n').filter(l => l.trim());
        const title = lines[0].replace(/^#\s*/, '') || file.name.replace('.md', '');
        const previewMd = lines.slice(1, 5).join(' ');
        const previewHTML = marked.parse(previewMd);

        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
          <div class="project-content">
            <h3>${title}</h3>
            <div class="md-preview">${previewHTML}</div>
            <button class="btn view-full" data-url="${file.download_url}">View Full</button>
          </div>
        `;
        container.appendChild(card);
      }
    }

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

    // Add click handlers to buttons
    document.querySelectorAll('.view-full').forEach(button => {
      button.addEventListener('click', async () => {
        const fullUrl = button.dataset.url;
        const fullMd = await (await fetch(fullUrl)).text();
        const fullHTML = marked.parse(fullMd);

        // Create popup/modal
        const popup = document.createElement('div');
        popup.className = 'popup-markdown';
        popup.innerHTML = `
          <div class="popup-content">
            <button class="close-popup">&times;</button>
            <div class="markdown-content">${fullHTML}</div>
          </div>
        `;
        document.body.appendChild(popup);
        
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

  } catch (err) {
    console.error("Error fetching markdown files:", err);
    container.innerHTML = `<p class="error">Couldn't load projects. Try again later.</p>`;
  }
}
