// Copy to clipboard functionality for code blocks
function copyToClipboard(button) {
  const codeBlock = button.closest('.code-block');
  const code = codeBlock.querySelector('code').innerText;
  
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
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

// Add event listeners to all copy buttons
document.addEventListener('DOMContentLoaded', () => {
  const copyButtons = document.querySelectorAll('.copy-button');
  copyButtons.forEach(button => {
    button.addEventListener('click', () => copyToClipboard(button));
  });
});
