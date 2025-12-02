/**
 * Onboarding System for Bulgarian-German Learning App
 * Provides first-time user experience for Vincent (DE) and Ida (BG)
 */
declare class OnboardingFlow {
    private currentStep;
    private userData;
    private steps;
    constructor();
    init(): void;
    private attachHelpButtonHandler;
    startOnboarding(): void;
    hasCompletedOnboarding(): boolean;
    shouldShowOnboarding(): boolean;
    private showOnboarding;
    private createModal;
    private renderStep;
    private renderWelcomeStep;
    private renderLanguageSelectionStep;
    private renderLearningGoalStep;
    private renderTutorialStep;
    private renderReadyStep;
    private getGoalLabel;
    private nextStep;
    private previousStep;
    private skipOnboarding;
    private completeOnboarding;
    private closeOnboarding;
    private announceToScreenReader;
}
export default OnboardingFlow;
//# sourceMappingURL=onboarding.d.ts.map