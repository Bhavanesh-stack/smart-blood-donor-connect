// ===== AUTH HELPERS =====

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

function isLoggedIn() {
  return !!getToken();
}

function redirectIfNotAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}

function redirectByRole() {
  const user = getUser();
  if (!user) return;
  if (user.role === 'donor') {
    window.location.href = '/donor-dashboard.html';
  } else {
    window.location.href = '/recipient-dashboard.html';
  }
}

function redirectIfAuth() {
  if (isLoggedIn()) {
    redirectByRole();
  }
}

// ===== PAGE TRANSITIONS =====
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-transition');
});

// Animate navigating links
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('http') || anchor.target === '_blank') return;
  e.preventDefault();
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(-10px)';
  document.body.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  setTimeout(() => { window.location.href = href; }, 250);
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} slide-in-right`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('slide-in-right');
    toast.classList.add('slide-out-right');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== BLOOD GROUP BADGE =====
function getBloodGroupBadgeClass(group) {
  if (!group) return 'badge-o';
  const prefix = group.replace(/[+-]/g, '').toUpperCase();
  const map = { 'A': 'badge-a', 'B': 'badge-b', 'AB': 'badge-ab', 'O': 'badge-o' };
  return map[prefix] || 'badge-o';
}

function getBloodGroupBadge(group) {
  const cls = getBloodGroupBadgeClass(group);
  return `<span class="${cls} px-3 py-1 rounded-full text-sm font-bold">${group}</span>`;
}

// ===== LOADING =====
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.innerHTML = `
    <div class="text-center">
      <div class="spinner" style="width:48px;height:48px;border-width:4px;"></div>
      <p class="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
}

// ===== GEOLOCATION =====
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ===== AVATAR GENERATOR =====
const AVATAR_GRADIENTS = [
  ['#DC2626', '#F59E0B'],
  ['#7C3AED', '#EC4899'],
  ['#2563EB', '#06B6D4'],
  ['#059669', '#34D399'],
  ['#D97706', '#EF4444'],
  ['#8B5CF6', '#6366F1'],
  ['#0891B2', '#2563EB'],
  ['#E11D48', '#F97316'],
  ['#4F46E5', '#7C3AED'],
  ['#0D9488', '#059669'],
];

function getAvatarGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function createAvatarHTML(name, size = 48) {
  const [c1, c2] = getAvatarGradient(name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);
  return `
    <div class="avatar-ring" style="width:${size + 6}px;height:${size + 6}px;border-radius:50%;">
      <div class="avatar-gradient" style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,${c1},${c2});font-size:${fontSize}px;">
        ${initials}
      </div>
    </div>
  `;
}

function createAvatarSimple(name, size = 48) {
  const [c1, c2] = getAvatarGradient(name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);
  return `
    <div class="avatar-gradient" style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,${c1},${c2});font-size:${fontSize}px;">
      ${initials}
    </div>
  `;
}

// ===== CONFETTI =====
function launchConfetti(duration = 3000) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];
  const shapes = ['square', 'circle'];
  const totalPieces = 80;

  for (let i = 0; i < totalPieces; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const left = Math.random() * 100;
    const size = Math.random() * 8 + 6;
    const animDuration = Math.random() * 2 + 1.5;
    const delay = Math.random() * 1.5;

    piece.style.left = `${left}%`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = color;
    piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
    piece.style.animationDuration = `${animDuration}s`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.opacity = '0';
    piece.style.animationFillMode = 'forwards';

    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), duration + 2000);
}

// ===== TIME AGO =====
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ===== EMPTY STATE SVGs =====
function getEmptyStateSVG(type) {
  const svgs = {
    'no-requests': `
      <div class="empty-state-icon">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FEF2F2" stroke="#FECACA" stroke-width="2"/>
          <rect x="65" y="55" width="70" height="90" rx="8" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          <line x1="80" y1="75" x2="120" y2="75" stroke="#D1D5DB" stroke-width="3" stroke-linecap="round"/>
          <line x1="80" y1="90" x2="115" y2="90" stroke="#E5E7EB" stroke-width="3" stroke-linecap="round"/>
          <line x1="80" y1="105" x2="110" y2="105" stroke="#E5E7EB" stroke-width="3" stroke-linecap="round"/>
          <circle cx="100" cy="130" r="12" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="2"/>
          <path d="M96 130 L100 134 L104 126" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="145" cy="55" r="18" fill="#DC2626"/>
          <text x="145" y="61" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="Inter">0</text>
        </svg>
      </div>
    `,
    'no-donors': `
      <div class="empty-state-icon">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FEF2F2" stroke="#FECACA" stroke-width="2"/>
          <circle cx="85" cy="80" r="20" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          <circle cx="85" cy="75" r="8" fill="#FCA5A5"/>
          <path d="M65 115 Q85 100 105 115" stroke="#E5E7EB" stroke-width="2" fill="white"/>
          <circle cx="125" cy="80" r="20" fill="white" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="4 3"/>
          <text x="125" y="85" text-anchor="middle" fill="#D1D5DB" font-size="20" font-weight="bold">?</text>
          <path d="M80 140 Q100 155 120 140" stroke="#FCA5A5" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="4 3"/>
          <circle cx="100" cy="148" r="4" fill="#DC2626" opacity="0.5"/>
        </svg>
      </div>
    `,
    'no-history': `
      <div class="empty-state-icon">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="2"/>
          <rect x="60" y="50" width="80" height="100" rx="10" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          <line x1="75" y1="75" x2="125" y2="75" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
          <line x1="75" y1="90" x2="120" y2="90" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
          <line x1="75" y1="105" x2="110" y2="105" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
          <line x1="75" y1="120" x2="115" y2="120" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
          <path d="M90 60 L100 45 L110 60" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
    `
  };
  return svgs[type] || svgs['no-requests'];
}

// ===== SECTION TRANSITION HELPER =====
function animateSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove('section-transition');
    void section.offsetWidth;
    section.classList.add('section-transition');
  }
}
