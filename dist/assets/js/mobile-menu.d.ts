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
declare class MobileMenu {
    private menuToggle;
    private navMenu;
    constructor();
    init(): void;
    toggleMenu(): void;
    openMenu(): void;
    closeMenu(): void;
    isMenuOpen(): boolean;
}
//# sourceMappingURL=mobile-menu.d.ts.map