

document.addEventListener('DOMContentLoaded', () => {
  // Sélecteurs utiles
  const nav = document.querySelector('.nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const header = document.getElementById('header');
  const links = document.querySelectorAll('.nav__link, [data-scroll]');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  function toggleMenu() {
    nav.classList.toggle('nav--open');
    const isOpen = nav.classList.contains('nav--open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }
  if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
  }

  
  function closeMenu() {
    nav.classList.remove('nav--open');
    navToggle.setAttribute('aria-expanded', 'false');
  }


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

});
