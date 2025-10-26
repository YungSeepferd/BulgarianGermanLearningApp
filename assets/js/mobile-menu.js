/**
 * Mobile Menu Toggle
 * Handles the mobile navigation menu toggle functionality
 */

export class MobileMenu {
  constructor() {
    this.menuToggle = document.getElementById('mobile-menu-toggle');
    this.navMenu = document.getElementById('nav-menu');

    if (this.menuToggle && this.navMenu) {
      this.init();
    }
  }

  init() {
    // Toggle menu on button click
    this.menuToggle.addEventListener('click', () => {
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.menuToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen()) {
        this.closeMenu();
      }
    });

    // Close menu when window is resized to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && this.isMenuOpen()) {
        this.closeMenu();
      }
    });

    // Close menu when navigating to a new page
    this.navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });
  }

  toggleMenu() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.navMenu.classList.add('mobile-menu-open');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.navMenu.classList.remove('mobile-menu-open');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    // Restore body scroll
    document.body.style.overflow = '';
  }

  isMenuOpen() {
    return this.navMenu.classList.contains('mobile-menu-open');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
  });
} else {
  new MobileMenu();
}
