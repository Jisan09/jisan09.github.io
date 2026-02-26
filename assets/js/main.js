const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let width = 0;
let height = 0;
let dots = [];
let mouse = { x: 0, y: 0 };

function resize() {
  if (!canvas || !ctx) return;
  const ratio = window.devicePixelRatio || 1;
  width = canvas.width = canvas.offsetWidth * ratio;
  height = canvas.height = canvas.offsetHeight * ratio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);
}

function createDots(count = 70) {
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.offsetWidth,
    y: Math.random() * canvas.offsetHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1,
  }));
}

function draw() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  const styles = getComputedStyle(document.body);
  const accent = styles.getPropertyValue('--accent').trim();
  const accent2 = styles.getPropertyValue('--accent-2').trim();
  ctx.fillStyle = `${accent}22`;
  ctx.strokeStyle = `${accent2}22`;

  for (const d of dots) {
    d.x += d.vx;
    d.y += d.vy;
    if (d.x < 0 || d.x > canvas.offsetWidth) d.vx *= -1;
    if (d.y < 0 || d.y > canvas.offsetHeight) d.vy *= -1;

    const dx = (mouse.x - d.x) * 0.0006;
    const dy = (mouse.y - d.y) * 0.0006;
    d.x += dx;
    d.y += dy;

    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i];
      const b = dots[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 120) {
        ctx.globalAlpha = 1 - dist / 120;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

function handleReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

if (canvas && ctx) {
  resize();
  createDots();
  draw();
  window.addEventListener('resize', () => {
    resize();
    createDots();
  });
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  });
}

handleReveal();

const toggleInput = document.querySelector('[data-theme-toggle]');
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

document.body.dataset.theme = initialTheme;
if (toggleInput) {
  toggleInput.checked = initialTheme === 'dark';
  toggleInput.addEventListener('change', () => {
    const nextTheme = toggleInput.checked ? 'dark' : 'light';
    document.body.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  });
}
