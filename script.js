/* ═══════════════════════════════════════════════════════
   TOP-1% PORTFOLIO  ·  script.js
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────
   1.  STAR / PARTICLE CANVAS
───────────────────────────────────────── */
(function initStarField() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], mouse = { x: 0, y: 0 };
  const COUNT = 120;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Star {
    constructor() { this.reset(true); }
    reset(random) {
      this.x   = random ? Math.random() * W : W * .5;
      this.y   = random ? Math.random() * H : H * .5;
      this.r   = Math.random() * 1.2 + .2;
      this.a   = Math.random();
      this.da  = (Math.random() - .5) * .004;
      this.vx  = (Math.random() - .5) * .15;
      this.vy  = (Math.random() - .5) * .15;
      this.col = Math.random() < .2 ? '#8b5cf6' : '#ffffff';
    }
    update() {
      // Subtle mouse parallax
      const dx = (mouse.x - W / 2) * .00006;
      const dy = (mouse.y - H / 2) * .00006;
      this.x += this.vx + dx;
      this.y += this.vy + dy;
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

  // Draw faint connecting lines between nearby stars
  function drawLines() {
    ctx.globalAlpha = 1;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = 'rgba(139,92,246,' + ((1 - dist / 90) * .06) + ')';
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


/* ─────────────────────────────────────────
   2.  CUSTOM CURSOR
───────────────────────────────────────── */
(function initCursor() {
  const ring = document.getElementById('cursorRing');
  const dot  = document.getElementById('cursorDot2');
  if (!ring || !dot) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * .14;
    ry += (my - ry) * .14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const triggers = 'a, button, .pr-btn, .tl-card, .sb-item, .code-snippet, .pr-browser';
  document.querySelectorAll(triggers).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-big'));
  });
})();


/* ─────────────────────────────────────────
   3.  SCROLL PROGRESS BAR
───────────────────────────────────────── */
(function initScrollBar() {
  const bar = document.getElementById('scrollBar');
  if (!bar) return;
  const update = () => {
    const max  = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = max ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ─────────────────────────────────────────
   4.  NAVBAR – SCROLL SOLID + ACTIVE LINK
───────────────────────────────────────── */
(function initNavbar() {
  const nav      = document.getElementById('navbar');
  const links    = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 30);

    let active = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 110) active = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + active);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────
   5.  HAMBURGER / MOBILE MENU
───────────────────────────────────────── */
(function initMenu() {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobMenu');
  if (!btn || !menu) return;

  function toggle() {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);

  menu.querySelectorAll('.mob-link').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle();
  });
})();


/* ─────────────────────────────────────────
   6.  THEME TOGGLE
───────────────────────────────────────── */
(function initTheme() {
  const btn = document.getElementById('themeBtn');
  const html = document.documentElement;
  const saved = localStorage.getItem('pf-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn && btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pf-theme', next);
  });
})();


/* ─────────────────────────────────────────
   7.  TYPEWRITER
───────────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('tw-el');
  if (!el) return;

  const words = [' & UI/UX Designer.', ' & Problem Solver.', ' & Creative Coder.', ' @ Facebook.'];
  let wi = 0, ci = 0, deleting = false, wait = false;

  function tick() {
    const word = words[wi];
    if (wait) { wait = false; return setTimeout(tick, 1800); }

    if (!deleting && ci <= word.length) {
      el.textContent = word.slice(0, ci++);
      if (ci > word.length) { wait = true; deleting = true; }
      setTimeout(tick, 105);
    } else if (deleting && ci >= 0) {
      el.textContent = word.slice(0, ci--);
      if (ci < 0) { deleting = false; ci = 0; wi = (wi + 1) % words.length; }
      setTimeout(tick, 55);
    }
  }
  setTimeout(tick, 900);
})();


/* ─────────────────────────────────────────
   8.  SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────
   9.  COUNTER ANIMATION
───────────────────────────────────────── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseFloat(el.dataset.target);
      if (isNaN(target)) return;
      obs.unobserve(el);

      const dur  = 1400;
      const step = 16;
      const inc  = target / (dur / step);
      let cur = 0;

      const timer = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Number.isInteger(target)
          ? Math.floor(cur)
          : cur.toFixed(1);
        if (cur >= target) clearInterval(timer);
      }, step);
    });
  }, { threshold: .5 });

  document.querySelectorAll('.sb-val[data-target]').forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────
   10.  HERO CARD SKILL BARS
───────────────────────────────────────── */
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
  }, { threshold: .4 });
  obs.observe(card);
})();


/* ─────────────────────────────────────────
   11.  MAGNETIC HOVER  (subtle DOM offset)
───────────────────────────────────────── */
(function initMagnetic() {
  document.querySelectorAll('.btn-main, .btn-ghost, .nav-hire, .email-link').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      el.style.transform = `translate(${dx * .2}px, ${dy * .2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────
   12.  SMOOTH SCROLL (all # links)
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav')) || 68;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────
   13.  TILT ON BROWSER FRAMES
───────────────────────────────────────── */
document.querySelectorAll('.pr-browser').forEach(el => {
  el.addEventListener('mousemove', e => {
    const { left, top, width, height } = el.getBoundingClientRect();
    const rx = ((e.clientY - top)  / height - .5) * -8;
    const ry = ((e.clientX - left) / width  - .5) *  8;
    el.style.transform =
      `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});


/* ─────────────────────────────────────────
   14.  PARALLAX BLOBS ON MOUSE
───────────────────────────────────────── */
(function initParallax() {
  const blobs = document.querySelectorAll('.hb-blob');
  let raf;
  document.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      blobs.forEach((b, i) => {
        const f = (i + 1) * 14;
        b.style.transform =
          `translate(${(e.clientX - cx) / cx * f}px, ${(e.clientY - cy) / cy * f}px)`;
      });
    });
  });
})();


/* ─────────────────────────────────────────
   15.  TIMELINE CONNECTOR ANIMATE ON SCROLL
───────────────────────────────────────── */
(function initTimeline() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: .15 });

  // Already handled by reveal-up class, just ensure .tl-card dot glow
  document.querySelectorAll('.tl-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.querySelector('.tlc-icon') &&
        (card.querySelector('.tlc-icon').style.boxShadow = '0 0 20px rgba(109,40,217,.5)');
    });
    card.addEventListener('mouseleave', () => {
      card.querySelector('.tlc-icon') &&
        (card.querySelector('.tlc-icon').style.boxShadow = '');
    });
  });
})();


/* ─────────────────────────────────────────
   16.  MARQUEE PAUSE ON HOVER
───────────────────────────────────────── */
(function initMarquee() {
  const track = document.querySelector('.mb-track');
  if (!track) return;
  track.addEventListener('mouseenter', () =>
    track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () =>
    track.style.animationPlayState = 'running');
})();


/* ─────────────────────────────────────────
   17.  PAGE LOAD COMPLETE
───────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  // Immediately trigger hero stagger-in items (they use CSS animation)
  // Trigger skill bars for hero card visible on load
  setTimeout(() => {
    const card = document.querySelector('.hero-card');
    if (card) card.classList.add('in-view');
  }, 600);
});