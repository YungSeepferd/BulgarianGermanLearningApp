// Copy to clipboard functionality for code blocks
function copyToClipboard(button) {
    const codeBlock = button.closest('.code-block');
    if (!codeBlock) {
        return;
    }
    const codeElement = codeBlock.querySelector('code');
    if (!codeElement) {
        return;
    }
    const code = codeElement.textContent || '';
    navigator.clipboard.writeText(code).then(() => {
        // Visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = 'Copied!';
        button.disabled = true;
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }).catch((error) => {
        console.error('Failed to copy text:', error);
    });
}
// Add event listeners to all copy buttons
document.addEventListener('DOMContentLoaded', () => {
    const copyButtons = document.querySelectorAll('.copy-button');
    for (const button of copyButtons) {
        button.addEventListener('click', () => copyToClipboard(button));
    }
});
//# sourceMappingURL=code.js.map