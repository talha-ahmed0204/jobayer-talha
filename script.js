// Age from birthday (4 Sep 2007)
const birth = new Date(2007, 8, 4);
const now = new Date();
let age = now.getFullYear() - birth.getFullYear();
if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
document.querySelectorAll('#age, #age2').forEach(el => (el.textContent = age));
document.getElementById('year').textContent = now.getFullYear();

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Typing effect
const words = ['CS Diploma Student', 'Python Learner', 'AI Enthusiast', 'Motion Designer'];
const typed = document.getElementById('typed');
let w = 0, i = 0, deleting = false;
(function type() {
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

// Active nav link
const links = document.querySelectorAll('.links a');
const sections = [...links].map(a => document.querySelector(a.getAttribute('href')));
addEventListener('scroll', () => {
  const y = scrollY + 140;
  let current = null;
  sections.forEach((s, idx) => { if (s && s.offsetTop <= y) current = idx; });
  links.forEach((a, idx) => a.classList.toggle('active', idx === current));
}, { passive: true });

// Hide social links that aren't set yet
document.querySelectorAll('[data-todo]').forEach(a => { if (a.getAttribute('href') === '#') a.style.display = 'none'; });
