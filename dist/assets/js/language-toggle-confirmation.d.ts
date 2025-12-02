/**
 * Language Toggle Confirmation Modal
 * Ensures users understand the impact of switching learning direction
 * For Vincent (DE) and Ida (BG)
 */
type Direction = 'de-bg' | 'bg-de';
declare class LanguageToggleConfirmation {
    private isModalOpen;
    private pendingDirection;
    private callback;
    private escapeHandler;
    show(currentDirection: Direction, newDirection: Direction, onConfirm: (direction: Direction) => void): void;
    private createModal;
    private getDirectionInfo;
    private confirm;
    private cancel;
    private close;
    private announceToScreenReader;
}
export default LanguageToggleConfirmation;
//# sourceMappingURL=language-toggle-confirmation.d.ts.map