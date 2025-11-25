/**
 * Mobile Menu Toggle
 * Handles the mobile navigation menu toggle functionality
 * Note: This class is not exported as a module - it's instantiated automatically
 * and available globally for debugging if needed via window.MobileMenu
 */

interface MobileMenuInstance {
  toggleMenu(): void;
  openMenu(): void;
  closeMenu(): void;
  isMenuOpen(): boolean;
}

class MobileMenu {
  private menuToggle: HTMLElement | null;
  private navMenu: HTMLElement | null;

  constructor() {
    this.menuToggle = document.querySelector('#mobile-menu-toggle');
    this.navMenu = document.querySelector('#nav-menu');

    if (this.menuToggle && this.navMenu) {
      this.init();
    }
  }

  init(): void {
    // Toggle menu on button click
    this.menuToggle!.addEventListener('click', () => {
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!this.menuToggle!.contains(target) && !this.navMenu!.contains(target)) {
        this.closeMenu();
      }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
    const navLinks = this.navMenu!.querySelectorAll('.nav-link');
    for (const link of navLinks) {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    }
  }

  toggleMenu(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    this.navMenu!.classList.add('mobile-menu-open');
    this.menuToggle!.setAttribute('aria-expanded', 'true');
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  }

  closeMenu(): void {
    this.navMenu!.classList.remove('mobile-menu-open');
    this.menuToggle!.setAttribute('aria-expanded', 'false');
    // Restore body scroll
    document.body.style.overflow = '';
  }

  isMenuOpen(): boolean {
    return this.navMenu!.classList.contains('mobile-menu-open');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = new MobileMenu();
    (window as unknown as { mobileMenu: MobileMenuInstance }).mobileMenu = mobileMenu;
  });
} else {
  const mobileMenu = new MobileMenu();
  (window as unknown as { mobileMenu: MobileMenuInstance }).mobileMenu = mobileMenu;
}