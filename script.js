const birth = new Date(2007, 8, 4);
const now = new Date();
let age = now.getFullYear() - birth.getFullYear();
if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
document.getElementById('age').textContent = age;
document.getElementById('age2').textContent = age;
document.getElementById('year').textContent = now.getFullYear();

const words = ['Student.', 'Creator.', 'Tech Enthusiast.', 'Lifelong Learner.'];
const el = document.getElementById('typed');
let w = 0, i = 0, deleting = false;
(function type() {
  const word = words[w];
  el.textContent = word.slice(0, i);
  if (!deleting && i < word.length) i++;
  else if (deleting && i > 0) i--;
  else if (!deleting) { deleting = true; return setTimeout(type, 1400); }
  else { deleting = false; w = (w + 1) % words.length; }
  setTimeout(type, deleting ? 45 : 90);
})();

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(s => observer.observe(s));
