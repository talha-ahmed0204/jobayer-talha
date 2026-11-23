// Age from birthday (4 Sep 2007)
const birth = new Date(2007, 8, 4);
const now = new Date();
let age = now.getFullYear() - birth.getFullYear();
if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
document.querySelectorAll('#age, #age2').forEach(el => (el.textContent = age));
document.getElementById('year').textContent = now.getFullYear();

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Typing effect
const words = ['CS Diploma Student', 'Python Learner', 'AI Enthusiast', 'Motion Designer', 'Web Slinger'];
const typed = document.getElementById('typed');
let w = 0, i = 0, deleting = false;
if (!reduceMotion) (function type() {
  const word = words[w];
  typed.textContent = '> ' + word.slice(0, i);
  if (!deleting && i < word.length) i++;
  else if (deleting && i > 0) i--;
  else if (!deleting) { deleting = true; return setTimeout(type, 1600); }
  else { deleting = false; w = (w + 1) % words.length; }
  setTimeout(type, deleting ? 40 : 85);
})();

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Mobile menu
const nav = document.querySelector('.nav');
const menuBtn = document.querySelector('.menu-btn');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });

// Copy email
const toast = document.querySelector('.toast');
document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    toast.textContent = 'Email copied to clipboard!';
  } catch {
    toast.textContent = btn.dataset.copy;
  }
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toast.textContent = ''), 2500);
}));

// Scroll-driven UI: active nav link, progress bar, back-to-top, dangling spider
const links = document.querySelectorAll('.links a');
const sections = [...links].map(a => document.querySelector(a.getAttribute('href')));
const progress = document.querySelector('.progress');
const toTop = document.querySelector('.to-top');
const dangler = document.querySelector('.dangler');
let ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY + 140;
  let current = null;
  sections.forEach((s, idx) => { if (s && s.offsetTop <= y) current = idx; });
  links.forEach((a, idx) => {
    a.classList.toggle('active', idx === current);
    idx === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
  });
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  progress.style.setProperty('--p', p);
  toTop.classList.toggle('show', scrollY > innerHeight * 0.8);
  dangler.style.setProperty('--drop', (80 + p * (innerHeight * 0.5)) + 'px');
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// ===== Spider web canvas =====
const canvas = document.getElementById('web');
const ctx = canvas.getContext('2d');
let W, H, DPR, webs = [];
const mouse = { x: -9999, y: -9999 };
const shots = [];

function makeWeb(cx, cy, radius, spokes, rings, a0, a1) {
  const pts = [];
  for (let r = 1; r <= rings; r++) {
    const ring = [];
    for (let s = 0; s <= spokes; s++) {
      const a = a0 + (a1 - a0) * (s / spokes);
      const rr = radius * (r / rings) * (0.92 + Math.random() * 0.12);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      ring.push({ ox: x, oy: y, x, y });
    }
    pts.push(ring);
  }
  return { cx, cy, pts };
}

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const R = Math.min(Math.max(W, H) * 0.42, 520);
  webs = [
    makeWeb(0, 0, R, 9, 8, 0, Math.PI / 2),
    makeWeb(W, H, R * 0.8, 8, 7, Math.PI, Math.PI * 1.5),
  ];
}

let running = false;
function wake() { if (!running && !document.hidden) { running = true; requestAnimationFrame(draw); } }
function draw() {
  let moving = false;
  ctx.clearRect(0, 0, W, H);
  ctx.lineWidth = 1;
  for (const web of webs) {
    for (const ring of web.pts) for (const p of ring) {
      const dx = mouse.x - p.ox, dy = mouse.y - p.oy, d = Math.hypot(dx, dy);
      const pull = d < 180 ? (1 - d / 180) * 0.35 : 0;
      const tx = p.ox + dx * pull, ty = p.oy + dy * pull;
      const mx = (tx - p.x) * 0.12, my = (ty - p.y) * 0.12;
      p.x += mx; p.y += my;
      if (Math.abs(mx) + Math.abs(my) > 0.02) moving = true;
    }
    ctx.strokeStyle = 'rgba(200, 215, 255, 0.22)';
    ctx.beginPath();
    const outer = web.pts[web.pts.length - 1];
    for (let s = 0; s < outer.length; s++) {
      ctx.moveTo(web.cx, web.cy);
      for (const ring of web.pts) ctx.lineTo(ring[s].x, ring[s].y);
    }
    for (const ring of web.pts) {
      ctx.moveTo(ring[0].x, ring[0].y);
      for (let s = 1; s < ring.length; s++) {
        const a = ring[s - 1], b = ring[s];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const sx = (mx - web.cx) * 0.04, sy = (my - web.cy) * 0.04;
        ctx.quadraticCurveTo(mx - sx, my - sy, b.x, b.y);
      }
    }
    ctx.stroke();
  }

  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.t += 1;
    const grow = Math.min(s.t / 10, 1);
    const fade = s.t > 50 ? Math.max(0, 1 - (s.t - 50) / 40) : 1;
    if (fade <= 0) { shots.splice(i, 1); continue; }
    const ex = s.sx + (s.x - s.sx) * grow, ey = s.sy + (s.y - s.sy) * grow;
    ctx.strokeStyle = `rgba(255,255,255,${0.85 * fade})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(s.sx, s.sy); ctx.lineTo(ex, ey); ctx.stroke();
    if (grow === 1) {
      const r = Math.min((s.t - 10) * 2.2, 26);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + s.rot;
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r);
      }
      for (const f of [0.45, 0.8]) {
        for (let k = 0; k <= 8; k++) {
          const a = (k / 8) * Math.PI * 2 + s.rot;
          const px = s.x + Math.cos(a) * r * f, py = s.y + Math.sin(a) * r * f;
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
      }
      ctx.stroke();
    }
  }
  if (moving || shots.length) requestAnimationFrame(draw);
  else running = false;
}

resize();
addEventListener('resize', () => { resize(); wake(); });
if (!reduceMotion) {
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; wake(); }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; wake(); });
  addEventListener('click', e => {
    if (e.target.closest('a, button, input, textarea')) return;
    const fromLeft = e.clientX > W / 2;
    shots.push({ sx: fromLeft ? 0 : W, sy: H, x: e.clientX, y: e.clientY, t: 0, rot: Math.random() * Math.PI });
    wake();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
}
wake();

// 3D tilt on cards
if (!reduceMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tile, .t-card, .project').forEach(card => {
    card.classList.add('tilt');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (x * 10) + 'deg');
      card.style.setProperty('--rx', (-y * 10) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

// Load the 3D globe once the page is idle or the visitor interacts, so it never slows the first paint
let globeLoaded = false;
function loadGlobe() {
  if (globeLoaded) return;
  globeLoaded = true;
  ['pointermove', 'pointerdown', 'scroll', 'keydown'].forEach(ev => removeEventListener(ev, loadGlobe));
  import('./three-scene.js').catch(() => document.querySelector('.hero-3d')?.remove());
}
['pointermove', 'pointerdown', 'scroll', 'keydown'].forEach(ev => addEventListener(ev, loadGlobe, { passive: true, once: true }));
if (matchMedia('(hover: hover) and (min-width: 901px)').matches) {
  addEventListener('load', () => setTimeout(() => (window.requestIdleCallback || setTimeout)(loadGlobe), 1500));
}
