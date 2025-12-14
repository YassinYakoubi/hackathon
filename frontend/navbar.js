/* filepath: /home/jackoby/Desktop/hackathon/frontend/navbar.js */
// Create navbar HTML
function createNavbar() {
  const currentPage = document.body.getAttribute('data-page') || 'home';
  
  const navbarHTML = `
    <nav class="navbar" id="navbar">
      <div class="navbar-container">
        <a href="index.html" class="navbar-brand">
          <div class="navbar-logo-wrapper">
            <img src="logo.jpeg" alt="Wellbeing Companion" class="navbar-logo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%2346c47e%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%22555%22 font-size=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3E🧠%3C/text%3E%3C/svg%3E'">
          </div>
          <div class="navbar-brand-text">
            <div class="navbar-title">Wellbeing Companion</div>
            <div class="navbar-subtitle">Your AI Mental Health Friend</div>
          </div>
        </a>
        
        <button class="navbar-mobile-toggle" onclick="toggleMobileMenu()" aria-label="Toggle menu">
          <span id="hamburger-icon">☰</span>
        </button>
        
        <div class="navbar-menu" id="navbarMenu">
          <a href="index.html" class="navbar-link ${currentPage === 'home' ? 'active' : ''}" data-page="home">
            🏠 Home
          </a>
          <a href="chat.html" class="navbar-link ${currentPage === 'chat' ? 'active' : ''}" data-page="chat">
            💬 Chat
          </a>
          <a href="tasks.html" class="navbar-link ${currentPage === 'tasks' ? 'active' : ''}" data-page="tasks">
            📚 Tasks
          </a>
          <a href="dashboard.html" class="navbar-link ${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
            📊 Dashboard
          </a>
          <a href="quiz.html" class="navbar-link navbar-cta" data-page="quiz">
            🔄 Take Quiz
          </a>
        </div>
      </div>
    </nav>
  `;
  
  // Insert navbar at the beginning of body
  document.body.insertAdjacentHTML('afterbegin', navbarHTML);
  
  // Initialize features
  initScrollEffect();
  initPageTransitions();
  initMobileMenu();
}

// Scroll effect
function initScrollEffect() {
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

// Page transitions
function initPageTransitions() {
  // Add fade-in effect to all links
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't prevent default, let navigation happen naturally
      // Just add a smooth transition effect
      document.body.style.opacity = '0.97';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });
  });
}

// Mobile menu
function initMobileMenu() {
  const menu = document.getElementById('navbarMenu');
  const toggle = document.querySelector('.navbar-mobile-toggle');
  
  // Close menu when clicking a link
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      updateHamburgerIcon(false);
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      updateHamburgerIcon(false);
    }
  });
  
  // Prevent body scroll when menu is open (mobile)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isActive = menu.classList.contains('active');
        if (window.innerWidth <= 768) {
          document.body.style.overflow = isActive ? 'hidden' : '';
        }
      }
    });
  });
  
  observer.observe(menu, { attributes: true });
}

// Toggle mobile menu
function toggleMobileMenu() {
  const menu = document.getElementById('navbarMenu');
  const toggle = document.querySelector('.navbar-mobile-toggle');
  const isActive = menu.classList.toggle('active');
  toggle.classList.toggle('active');
  
  updateHamburgerIcon(isActive);
}

// Update hamburger icon
function updateHamburgerIcon(isOpen) {
  const icon = document.getElementById('hamburger-icon');
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
    icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
    icon.style.transition = 'transform 0.3s ease';
  }
}

// Add loading animation
function showPageLoading() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--primary-green), transparent);
    background-size: 50% 100%;
    animation: loading 1s ease-in-out infinite;
    z-index: 9999;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loading {
      0% { background-position: -50% 0; }
      100% { background-position: 150% 0; }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(loader);
  
  setTimeout(() => {
    loader.remove();
    style.remove();
  }, 500);
}

// Initialize navbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createNavbar);
} else {
  createNavbar();
}

// Show loading on page load
window.addEventListener('load', showPageLoading);