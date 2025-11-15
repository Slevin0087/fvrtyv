export class AnimationsVictory {
    constructor(eventManager, stateManager) {
        this.eventManager = eventManager
        this.stateManager = stateManager
    }


createVictoryConfetti() {
    this.stateManager.resetIscreateVictoryConfetti(true)
    const canvas = document.createElement("canvas");
    canvas.id = 'victory-confetti'
    const ctx = canvas.getContext("2d");

    canvas.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 99999;
  `;

    document.body.appendChild(canvas);

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    // --- GPU-friendly colors
    const colors = [
      "#ff0000",
      "#ff6b00",
      "#ffff00",
      "#00ff00",
      "#00ffff",
      "#0000ff",
      "#ff00ff",
    ];

    // --- particles
    const count = 250; // можно увеличить, FPS всё равно останется высоким
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 6 + Math.random() * 12,
        speedY: 1 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 0.9,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[(Math.random() * colors.length) | 0],
        shape:
          Math.random() < 0.33
            ? "circle"
            : Math.random() < 0.66
            ? "square"
            : "triangle",
      });
    }

    let running = true;

    function draw() {
      if (!running) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        const s = p.size;

        switch (p.shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
            ctx.fill();
            break;

          case "square":
            ctx.fillRect(-s / 2, -s / 2, s, s);
            break;

          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 2, s / 2);
            ctx.lineTo(-s / 2, s / 2);
            ctx.closePath();
            ctx.fill();
            break;
        }

        ctx.restore();
      }

      requestAnimationFrame(draw);
    }

    draw();

    setTimeout(() => {
      running = false;
      canvas.style.transition = "opacity .6s";
      canvas.style.opacity = "0";
      this.stateManager.resetIscreateVictoryConfetti(false)
      setTimeout(() => canvas.remove(), 4000);
    }, 50000);
  }
}
