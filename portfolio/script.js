// ---------- Dark / light theme ----------
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

function applyTheme(theme) {
  root.dataset.theme = theme;
  // The button names the mode you will switch TO
  const next = theme === 'dark' ? 'Light' : 'Dark';
  themeBtn.textContent = next;
  themeBtn.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
  try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked, ignore */ }
}

applyTheme(root.dataset.theme || 'light');
themeBtn.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

function setMenu(open) {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
}

menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

// ---------- Highlight the nav link of the section in view ----------
const links = [...nav.querySelectorAll('a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
let lock = false;      // true while a clicked link is still smooth-scrolling
let lockTimer;

function setActive(id) {
  links.forEach(a => {
    a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id));
  });
}

function updateActive() {
  if (lock) return;
  // The active section is the last one whose top has passed just under the header
  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 120) current = sec.id;
  });
  // Contact is too short to reach the top, so use the bottom of the page instead
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) current = sections[sections.length - 1].id;
  setActive(current);
}

function unlock() {
  lock = false;
  clearTimeout(lockTimer);
  updateActive();
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateActive(); ticking = false; });
}, { passive: true });
window.addEventListener('scrollend', () => { if (lock) unlock(); });
window.addEventListener('resize', updateActive);

// Light up the clicked link right away, and keep it lit while the page scrolls there
links.forEach(a => a.addEventListener('click', () => {
  setActive(a.getAttribute('href').slice(1));
  lock = true;
  clearTimeout(lockTimer);
  lockTimer = setTimeout(unlock, 1200);   // fallback if scrollend isn't supported
}));

updateActive();

// ---------- Project screenshots: fallback + lightbox ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');

document.querySelectorAll('.shot').forEach(shot => {
  const img = shot.querySelector('img');
  if (!img) return;

  // If the picture file is missing, show the dashed placeholder instead
  const markMissing = () => shot.classList.add('missing');
  img.addEventListener('error', markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();

  shot.addEventListener('click', () => {
    if (shot.classList.contains('missing')) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.showModal();
  });
});

// Close with the X button or by clicking the dark area (Esc works automatically)
lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

// ---------- Profile photo: show initials if the picture file is missing ----------
const avatarImg = document.querySelector('.avatar img');
if (avatarImg) {
  const markAvatar = () => avatarImg.parentElement.classList.add('missing');
  avatarImg.addEventListener('error', markAvatar);
  if (avatarImg.complete && avatarImg.naturalWidth === 0) markAvatar();
}
