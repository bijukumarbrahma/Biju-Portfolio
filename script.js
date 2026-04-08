/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO  ·  script.js  (Mobile Performance Optimized)
   ═══════════════════════════════════════════════════════════════
   KEY FIXES:
   - Detect touch/mobile once at top, skip heavy effects
   - Star canvas: fewer particles on mobile, no mouse parallax
   - Parallax blobs: disabled on touch devices
   - Tilt effect: disabled on touch devices
   - Magnetic hover: disabled on touch devices
   - Debounced resize to avoid layout thrashing
   - All scroll listeners use { passive: true }
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────────────
   0.  DEVICE DETECTION
   Checked once at startup — used to skip desktop-only effects.
   Pointer: coarse = touchscreen (phone/tablet)
   Width check as fallback for some hybrid devices.
─────────────────────────────────────────────────── */
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const IS_MOBILE = IS_TOUCH || window.innerWidth < 768;


/* ─────────────────────────────────────────────────
   1.  STAR / PARTICLE CANVAS
   FIX: Reduced particle count on mobile (120 → 40).
   FIX: Mouse parallax skipped on touch — no mousemove events.
   FIX: Connecting-lines check only runs if there are enough stars nearby.
   FIX: Canvas resize is debounced to avoid thrashing.
─────────────────────────────────────────────────── */
(function initStarField() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [];
  // FIX: significantly fewer stars on mobile (saves CPU + battery)
  const COUNT = IS_MOBILE ? 40 : 110;
  // FIX: smaller connection radius on mobile (fewer line calculations)
  const CONNECT_DIST = IS_MOBILE ? 0 : 90; // skip connecting lines entirely on mobile

  const mouse = { x: -9999, y: -9999 }; // Start offscreen so parallax doesn't shift on load

  // Debounced resize — avoids calling resize() on every px during orientation change
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', onResize, { passive: true });

  // FIX: Only track mouse on non-touch devices
  if (!IS_TOUCH) {
    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
  }

  class Star {
    constructor() { this.reset(true); }
    reset(random) {
      this.x   = random ? Math.random() * W : W * .5;
      this.y   = random ? Math.random() * H : H * .5;
      this.r   = Math.random() * 1.2 + .2;
      this.a   = Math.random();
      this.da  = (Math.random() - .5) * .003; // FIX: slightly slower twinkle
      this.vx  = (Math.random() - .5) * .12;  // FIX: slower drift on mobile
      this.vy  = (Math.random() - .5) * .12;
      this.col = Math.random() < .18 ? '#8b5cf6' : '#ffffff';
    }
    update() {
      // FIX: Skip mouse parallax on touch devices entirely
      if (!IS_TOUCH) {
        const dx = (mouse.x - W / 2) * .00005;
        const dy = (mouse.y - H / 2) * .00005;
        this.x += this.vx + dx;
        this.y += this.vy + dy;
      } else {
        this.x += this.vx;
        this.y += this.vy;
      }
      this.a += this.da;
      if (this.a <= 0 || this.a >= 1) this.da *= -1;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col;
      ctx.globalAlpha = this.a * .8;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) stars.push(new Star());

  // FIX: Connecting lines only on desktop (O(n²) loop is expensive on mobile)
  function drawLines() {
    if (CONNECT_DIST === 0) return; // mobile: skip completely
    ctx.globalAlpha = 1;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = 'rgba(139,92,246,' + ((1 - dist / CONNECT_DIST) * .06) + ')';
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function raf() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(raf);
  }
  raf();
})();


/* ─────────────────────────────────────────────────
   2.  CUSTOM CURSOR  (desktop only)
   FIX: Entire block skipped on touch devices.
─────────────────────────────────────────────────── */
(function initCursor() {
  // FIX: Don't waste any JS on cursor for touch users — CSS already hides the elements
  if (IS_TOUCH) return;

  const ring = document.getElementById('cursorRing');
  const dot  = document.getElementById('cursorDot2');
  if (!ring || !dot) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    // Dot follows cursor exactly (no lag)
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  // Ring follows with spring lag for nice effect
  (function loop() {
    rx += (mx - rx) * .14;
    ry += (my - ry) * .14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const triggers = 'a, button, .pr-btn, .tl-card, .sb-item, .code-snippet, .proj-card';
  document.querySelectorAll(triggers).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-big'));
  });
})();


/* ─────────────────────────────────────────────────
   3.  SCROLL PROGRESS BAR
   FIX: passive:true already set — just verifying it stays here.
─────────────────────────────────────────────────── */
(function initScrollBar() {
  const bar = document.getElementById('scrollBar');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ─────────────────────────────────────────────────
   4.  NAVBAR — scroll-solid + active link highlight
─────────────────────────────────────────────────── */
(function initNavbar() {
  const nav      = document.getElementById('navbar');
  const links    = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 30);

    let active = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) active = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + active);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────────
   5.  HAMBURGER / MOBILE MENU
─────────────────────────────────────────────────── */
(function initMenu() {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobMenu');
  if (!btn || !menu) return;

  function close() {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggle() {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);

  // Close menu when a nav link is tapped
  menu.querySelectorAll('.mob-link').forEach(a => {
    a.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
})();


/* ─────────────────────────────────────────────────
   6.  THEME TOGGLE
─────────────────────────────────────────────────── */
(function initTheme() {
  const btn  = document.getElementById('themeBtn');
  const html = document.documentElement;
  const saved = localStorage.getItem('pf-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  if (btn) {
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('pf-theme', next);
    });
  }
})();


/* ─────────────────────────────────────────────────
   7.  TYPEWRITER (about section)
─────────────────────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('tw-el');
  if (!el) return;

  const words = [' & UI/UX Designer.', ' & Problem Solver.', ' & Creative Coder.', ' & Flutter Dev.'];
  let wi = 0, ci = 0, deleting = false, wait = false;

  function tick() {
    const word = words[wi];
    if (wait) { wait = false; return setTimeout(tick, 1800); }

    if (!deleting && ci <= word.length) {
      el.textContent = word.slice(0, ci++);
      if (ci > word.length) { wait = true; deleting = true; }
      setTimeout(tick, 100);
    } else if (deleting && ci >= 0) {
      el.textContent = word.slice(0, ci--);
      if (ci < 0) { deleting = false; ci = 0; wi = (wi + 1) % words.length; }
      setTimeout(tick, 50);
    }
  }
  setTimeout(tick, 1000);
})();


/* ─────────────────────────────────────────────────
   8.  SCROLL REVEAL (IntersectionObserver)
   FIX: rootMargin reduced slightly for mobile viewports.
─────────────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        obs.unobserve(e.target); // Unobserve after first reveal (fire once)
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────────
   9.  COUNTER ANIMATION (about stats)
─────────────────────────────────────────────────── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseFloat(el.dataset.target);
      if (isNaN(target)) return;
      obs.unobserve(el);

      const dur = 1200;
      const step = 16;
      const inc  = target / (dur / step);
      let cur = 0;

      const timer = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Number.isInteger(target) ? Math.floor(cur) : cur.toFixed(1);
        if (cur >= target) clearInterval(timer);
      }, step);
    });
  }, { threshold: .4 });

  document.querySelectorAll('.sb-val[data-target]').forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────────
   10.  HERO CARD SKILL BARS
─────────────────────────────────────────────────── */
(function initSkillBars() {
  const card = document.querySelector('.hero-card');
  if (!card) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        card.classList.add('in-view');
        obs.unobserve(card);
      }
    });
  }, { threshold: .3 });
  obs.observe(card);
})();


/* ─────────────────────────────────────────────────
   11.  MAGNETIC HOVER  (desktop only)
   FIX: Completely skipped on touch — serves no purpose
   on mobile and adds unnecessary event listeners.
─────────────────────────────────────────────────── */
(function initMagnetic() {
  if (IS_TOUCH) return; // FIX: skip on mobile

  document.querySelectorAll('.btn-main, .btn-ghost, .nav-hire, .email-link').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      el.style.transform = `translate(${dx * .18}px, ${dy * .18}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────────────
   12.  SMOOTH SCROLL (all # anchor links)
─────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const selector = a.getAttribute('href');
    if (selector === '#') return; // Skip bare # links
    const target = document.querySelector(selector);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav')
    ) || 64;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────────────
   13.  3D TILT ON PROJECT CARDS  (desktop only)
   FIX: Replaced tilt on .pr-browser (old layout) with
   lightweight tilt on new .proj-card elements.
   FIX: Skipped entirely on touch devices.
─────────────────────────────────────────────────── */
(function initTilt() {
  if (IS_TOUCH) return; // FIX: no tilt on mobile — no hover events

  document.querySelectorAll('.proj-card').forEach(el => {
    el.addEventListener('mousemove', e => {
      const { left, top, width, height } = el.getBoundingClientRect();
      // Reduced tilt angle from 8° → 5° for a more subtle effect
      const rx = ((e.clientY - top)  / height - .5) * -5;
      const ry = ((e.clientX - left) / width  - .5) *  5;
      el.style.transform =
        `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────────────
   14.  PARALLAX BLOBS ON MOUSE  (desktop only)
   FIX: Completely disabled on touch devices — mousemove
   never fires on phones, so the listener did nothing
   but waste memory. Blob CSS animations handle the
   movement on mobile instead.
─────────────────────────────────────────────────── */
(function initParallax() {
  if (IS_TOUCH) return; // FIX: skip on mobile

  const blobs = document.querySelectorAll('.hb-blob');
  if (!blobs.length) return;

  let raf;
  document.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      blobs.forEach((b, i) => {
        // Reduced factor from 14 → 10 for subtler movement
        const f = (i + 1) * 10;
        b.style.transform =
          `translate(${(e.clientX - cx) / cx * f}px, ${(e.clientY - cy) / cy * f}px)`;
      });
    });
  }, { passive: true });
})();


/* ─────────────────────────────────────────────────
   15.  TIMELINE CARD HOVER GLOW
─────────────────────────────────────────────────── */
(function initTimeline() {
  // FIX: Skip mouse events on touch — use :hover in CSS instead for touch
  if (IS_TOUCH) return;

  document.querySelectorAll('.tl-card').forEach(card => {
    const icon = card.querySelector('.tlc-icon');
    if (!icon) return;
    card.addEventListener('mouseenter', () => {
      icon.style.boxShadow = '0 0 20px rgba(109,40,217,.5)';
    });
    card.addEventListener('mouseleave', () => {
      icon.style.boxShadow = '';
    });
  });
})();


/* ─────────────────────────────────────────────────
   16.  MARQUEE PAUSE ON HOVER  (desktop only)
─────────────────────────────────────────────────── */
(function initMarquee() {
  if (IS_TOUCH) return; // FIX: no hover events on touch — keep marquee running

  const track = document.querySelector('.mb-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();


/* ─────────────────────────────────────────────────
   17.  PAGE LOAD COMPLETE
─────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Trigger hero card skill bars on load (visible above fold)
  setTimeout(() => {
    const card = document.querySelector('.hero-card');
    if (card) card.classList.add('in-view');
  }, 500);
});