(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hamburger = document.getElementById('hamburger');
  const mobile = document.getElementById('mobile');

  const toggleMobile = (forceOpen) => {
    if (!hamburger || !mobile) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !mobile.classList.contains('is-open');
    mobile.classList.toggle('is-open', shouldOpen);
    hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  };

  hamburger?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMobile();
  });

  mobile?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMobile(false));
  });

  mobile?.addEventListener('click', (event) => {
    if (event.target === mobile) {
      toggleMobile(false);
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') toggleMobile(false);
  });

  const canvas = document.getElementById('starfield');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const density = 140;
    const stars = Array.from({ length: density }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.6 + 0.4, tw: Math.random() * 0.4 + 0.6 }));

    const resize = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((s) => {
        const size = (1.1 - s.z) * 2.2;
        const opacity = s.tw * 0.9;
        ctx.fillStyle = `rgba(124,247,255,${opacity})`;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }
})();
