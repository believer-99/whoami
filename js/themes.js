/* ================================================================
   themes.js — Theme switching & background effects
   ================================================================ */

const Themes = (() => {
  const VALID = ['default', 'light', 'mario', 'interstellar'];
  let bgAnim = null;  // requestAnimationFrame id
  let stars  = [];

  // ── Star field (interstellar) ──────────────────────────────
  function initStars(canvas) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      spd: Math.random() * 0.4 + 0.1,
      alpha: Math.random(),
      delta: (Math.random() * 0.01 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
    }));
  }

  function animateStars(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.alpha += s.delta;
        if (s.alpha > 1 || s.alpha < 0) s.delta *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.fill();
        s.y += s.spd;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      }
      bgAnim = requestAnimationFrame(frame);
    }
    frame();
  }

  // ── Mario pixel-cloud bg ───────────────────────────────────
  function animateMario(canvas) {
    const ctx = canvas.getContext('2d');
    const clouds = Array.from({ length: 5 }, (_, i) => ({
      x: i * 220 + 50,
      y: 40 + Math.random() * 80,
      w: 80 + Math.random() * 60,
      spd: 0.3 + Math.random() * 0.4,
    }));

    function drawCloud(x, y, w) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x, y, w, 20);
      ctx.fillRect(x + 10, y - 10, w - 20, 10);
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      for (const c of clouds) {
        drawCloud(c.x, c.y, c.w);
        c.x += c.spd;
        if (c.x > canvas.width + 100) c.x = -150;
      }
      bgAnim = requestAnimationFrame(frame);
    }
    frame();
  }

  function stopBg() {
    if (bgAnim) { cancelAnimationFrame(bgAnim); bgAnim = null; }
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ── Public ─────────────────────────────────────────────────
  return {
    list() { return VALID; },

    current() {
      for (const t of VALID) {
        if (document.body.classList.contains('theme-' + t)) return t;
      }
      return 'default';
    },

    apply(name) {
      if (!name) return { ok: false, msg: 'Usage: theme <name>  |  Available: ' + VALID.join(', ') };
      if (!VALID.includes(name)) return { ok: false, msg: `Unknown theme "${name}". Available: ${VALID.join(', ')}` };

      // Remove all theme classes
      VALID.forEach(t => document.body.classList.remove('theme-' + t));
      if (name !== 'default') document.body.classList.add('theme-' + name);

      stopBg();
      const canvas = document.getElementById('bg-canvas');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      if (name === 'interstellar') {
        initStars(canvas);
        animateStars(canvas);
      } else if (name === 'mario') {
        animateMario(canvas);
      }

      try { localStorage.setItem('portfolio_theme', name); } catch {}
      return { ok: true, msg: `Theme set to "${name}"` };
    },

    restore() {
      try {
        const saved = localStorage.getItem('portfolio_theme');
        if (saved && VALID.includes(saved)) this.apply(saved);
      } catch {}
    },
  };
})();
