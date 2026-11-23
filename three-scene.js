import * as THREE from 'three';

const canvas = document.getElementById('globe');
const host = canvas.parentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 900px)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0, 7.5);

const RED = 0xe62429, BLUE = 0x2b5cff, WHITE = 0xdfe6ff;
const globe = new THREE.Group();
scene.add(globe);

// Outer web sphere: latitude rings + longitude spokes, like a 3D spider web
const R = 2.2;
const webMat = new THREE.LineBasicMaterial({ color: WHITE, transparent: true, opacity: 0.35 });
for (let i = 1; i < 10; i++) {
  const phi = (i / 10) * Math.PI;
  const pts = [];
  for (let k = 0; k <= 96; k++) {
    const t = (k / 96) * Math.PI * 2;
    const sag = 1 - 0.04 * Math.abs(Math.sin(t * 6));
    pts.push(new THREE.Vector3(Math.sin(phi) * Math.cos(t) * R * sag, Math.cos(phi) * R, Math.sin(phi) * Math.sin(t) * R * sag));
  }
  globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), webMat));
}
for (let j = 0; j < 12; j++) {
  const t = (j / 12) * Math.PI * 2;
  const pts = [];
  for (let k = 0; k <= 64; k++) {
    const phi = (k / 64) * Math.PI;
    pts.push(new THREE.Vector3(Math.sin(phi) * Math.cos(t) * R, Math.cos(phi) * R, Math.sin(phi) * Math.sin(t) * R));
  }
  globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), webMat));
}

// Inner red wireframe core
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.25, 1),
  new THREE.MeshBasicMaterial({ color: RED, wireframe: true, transparent: true, opacity: 0.9 })
);
globe.add(core);
const coreGlow = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.15, 3),
  new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.12 })
);
globe.add(coreGlow);

// Orbiting blue ring
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.9, 0.012, 8, 160),
  new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.8 })
);
ring.rotation.x = Math.PI / 2.4;
scene.add(ring);

// Particle field
const COUNT = small ? 300 : 700;
const pos = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
  const r = 3 + Math.random() * 3.5, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
  pos[i * 3] = r * Math.sin(b) * Math.cos(a);
  pos[i * 3 + 1] = r * Math.cos(b);
  pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
}
const particles = new THREE.Points(
  new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
  new THREE.PointsMaterial({ color: 0x9db4ff, size: 0.03, transparent: true, opacity: 0.8 })
);
scene.add(particles);

const target = { x: 0, y: 0 };
addEventListener('pointermove', e => {
  target.x = (e.clientX / innerWidth - 0.5) * 2;
  target.y = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
host.classList.add('ready');

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  if (!visible || document.hidden) return;
  const t = clock.getElapsedTime();
  const spin = reduceMotion ? 0 : 1;
  globe.rotation.y += (0.0025 + target.x * 0.004) * spin;
  globe.rotation.x += ((target.y * 0.5) - globe.rotation.x) * 0.05;
  core.rotation.x -= 0.004 * spin;
  core.rotation.z += 0.003 * spin;
  const pulse = 1 + Math.sin(t * 2) * 0.04 * spin;
  coreGlow.scale.setScalar(pulse);
  ring.rotation.z += 0.003 * spin;
  particles.rotation.y -= 0.0006 * spin;
  camera.position.x += (target.x * 0.6 - camera.position.x) * 0.04;
  camera.position.y += (-target.y * 0.4 - camera.position.y) * 0.04;
  camera.position.z = 7.5 + Math.min(scrollY / innerHeight, 1) * 3;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
frame();
