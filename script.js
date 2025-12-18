// ============================================================================
// Script principal du site (JavaScript vanilla)
// - Défilement fluide natif
// - Menu mobile (hamburger)
// - Animations au scroll via IntersectionObserver
// - Utilitaires et améliorations UX
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Sélecteurs utiles
  const nav = document.querySelector('.nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const header = document.getElementById('header');
  const links = document.querySelectorAll('.nav__link, [data-scroll]');
  const yearEl = document.getElementById('year');

  // Met à jour l'année dans le footer
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // Menu mobile : ouverture/fermeture
  // --------------------------------------------------------------------------
  function toggleMenu() {
    nav.classList.toggle('nav--open');
    const isOpen = nav.classList.contains('nav--open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }
  if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
  }

  // Ferme le menu quand on clique sur un lien
  function closeMenu() {
    nav.classList.remove('nav--open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  // --------------------------------------------------------------------------
  // Défilement fluide natif vers les ancres
  // --------------------------------------------------------------------------
  function smoothScrollTo(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        smoothScrollTo(href);
        closeMenu();
      }
    });
  });

  // --------------------------------------------------------------------------
  // Observer pour révéler les sections au scroll
  // --------------------------------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    {
      threshold: 0.15,
    }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // --------------------------------------------------------------------------
  // Mise en surbrillance du lien actif (section visible)
  // --------------------------------------------------------------------------
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav__link[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav__link').forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: `-${header.offsetHeight + 48}px 0px -60% 0px`, threshold: 0.3 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  // --------------------------------------------------------------------------
  // Amélioration : rendre tel/mail cliquables depuis boutons (déjà présents)
  // --------------------------------------------------------------------------
  // Rien à faire ici, les liens `tel:` et `mailto:` sont déjà opérationnels.

  // --------------------------------------------------------------------------
  // Effet 3D/parallax sur le fond de la section Services
  // --------------------------------------------------------------------------
  const servicesSection = document.getElementById('services');
  const servicesEffect = document.querySelector('.services__effect');
  if (servicesSection && servicesEffect) {
    const maxTilt = 6; // degrés
    const maxMove = 12; // px
    let rafId = null;
    let pending = { rx: 0, ry: 0, tx: 0, ty: 0 };

    function applyTransform() {
      servicesEffect.style.setProperty('--rx', `${pending.rx}deg`);
      servicesEffect.style.setProperty('--ry', `${pending.ry}deg`);
      servicesEffect.style.setProperty('--tx', `${pending.tx}px`);
      servicesEffect.style.setProperty('--ty', `${pending.ty}px`);
      rafId = null;
    }

    function onMove(e) {
      const rect = servicesSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const ry = (x - 0.5) * (maxTilt * 2);
      const rx = (0.5 - y) * (maxTilt * 2);
      const tx = (x - 0.5) * (maxMove * 2);
      const ty = (y - 0.5) * (maxMove * 2);
      pending = { rx, ry, tx, ty };
      if (!rafId) rafId = requestAnimationFrame(applyTransform);
    }

    function onLeave() {
      pending = { rx: 0, ry: 0, tx: 0, ty: 0 };
      if (!rafId) rafId = requestAnimationFrame(applyTransform);
    }

    servicesSection.addEventListener('mousemove', onMove);
    servicesSection.addEventListener('mouseleave', onLeave);
  }

  // Effet drapeau animé sur canvas
  const flagCanvas = document.getElementById('servicesFlag');
  if (flagCanvas) {
    const ctx = flagCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, buffer, bctx, running = true;

    function makeBuffer() {
      buffer = document.createElement('canvas');
      buffer.width = Math.max(1, Math.floor(w * dpr));
      buffer.height = Math.max(1, Math.floor(h * dpr));
      bctx = buffer.getContext('2d');
      const grad = bctx.createLinearGradient(0, 0, buffer.width, 0);
      grad.addColorStop(0, '#0a1a2b');
      grad.addColorStop(0.5, '#113a5a');
      grad.addColorStop(1, '#1c4f7d');
      bctx.fillStyle = grad;
      bctx.fillRect(0, 0, buffer.width, buffer.height);
      const rg = bctx.createRadialGradient(
        buffer.width * 0.85,
        buffer.height * 0.12,
        buffer.width * 0.02,
        buffer.width * 0.85,
        buffer.height * 0.12,
        buffer.width * 0.5
      );
      rg.addColorStop(0, 'rgba(232,245,154,0.28)');
      rg.addColorStop(1, 'rgba(232,245,154,0)');
      bctx.fillStyle = rg;
      bctx.globalCompositeOperation = 'lighter';
      bctx.fillRect(0, 0, buffer.width, buffer.height);
      bctx.globalCompositeOperation = 'source-over';
    }

    function resize() {
      const rect = flagCanvas.getBoundingClientRect();
      w = Math.max(300, rect.width);
      h = Math.max(200, rect.height);
      flagCanvas.width = Math.floor(w * dpr);
      flagCanvas.height = Math.floor(h * dpr);
      flagCanvas.style.transform = 'translateZ(40px)';
      makeBuffer();
    }
    resize();
    window.addEventListener('resize', resize);

    const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaReduce.matches) running = false;

    let last = performance.now();
    function loop(t) {
      if (!running) {
        ctx.drawImage(buffer, 0, 0, buffer.width, buffer.height, 0, 0, flagCanvas.width, flagCanvas.height);
        return;
      }
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const stride = Math.max(2, Math.floor(2 * dpr));
      const amp = Math.max(8, Math.min(18, w / 60)) * dpr;
      const speed = 0.9;
      ctx.clearRect(0, 0, flagCanvas.width, flagCanvas.height);
      for (let sy = 0; sy < buffer.height; sy += stride) {
        const phase = (sy / buffer.height) * Math.PI * 2;
        const dx = Math.sin(phase + t * 0.0015 * speed) * amp;
        const dy = Math.cos(phase * 0.5 + t * 0.0012 * speed) * (amp * 0.05);
        ctx.drawImage(
          buffer,
          0, sy, buffer.width, stride,
          dx, sy + dy, flagCanvas.width, stride
        );
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
});
