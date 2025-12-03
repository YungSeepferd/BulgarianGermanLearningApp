import { browser } from '$app/environment';

export function fireConfetti() {
  if (!browser) return;

  // Dynamic import to avoid SSR issues
  import('canvas-confetti').then((confetti) => {
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti.default({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      // and launch a few from the right edge
      confetti.default({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }).catch(err => console.error('Failed to load confetti:', err));
}