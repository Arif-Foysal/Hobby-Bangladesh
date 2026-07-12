import canvasConfetti from "canvas-confetti";

export function fireConfetti() {
  const duration = 2000;
  const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 9999 };

  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  const promise = canvasConfetti({
    ...defaults,
    particleCount: 80,
    origin: { x: random(0.2, 0.8), y: 0.3 },
    colors: ["#10b981", "#34d399", "#6ee7b7", "#f59e0b", "#fbbf24"],
  });

  const shoot = () => {
    canvasConfetti({
      ...defaults,
      particleCount: 40,
      origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
    });
    canvasConfetti({
      ...defaults,
      particleCount: 40,
      origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
    });
  };

  setTimeout(shoot, 200);
  setTimeout(shoot, 400);
  setTimeout(shoot, 600);

  return promise;
}