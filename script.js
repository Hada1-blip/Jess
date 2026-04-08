/* ============================================
   CONCIERGERIE BY JESS — script.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL ─────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── ACTIVE LINK ────────────────────────── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__drawer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── HAMBURGER ──────────────────────────── */
  const ham    = document.querySelector('.hamburger');
  const drawer = document.querySelector('.nav__drawer');
  if (ham && drawer) {
    ham.addEventListener('click', () => {
      const open = ham.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL ──────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add('visible'), delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  }

  /* ── COUNTER ANIMATION ──────────────────── */
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el     = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const dur    = 1800;
        const step   = 16;
        let current  = 0;
        const inc    = target / (dur / step);
        const timer  = setInterval(() => {
          current += inc;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = prefix + Math.floor(current) + suffix;
        }, step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObs.observe(c));
  }

  /* ── CAROUSEL ───────────────────────────── */
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(car => {
    const track  = car.querySelector('.carousel__track');
    const cards  = car.querySelectorAll('.carousel__item');
    const prev   = car.querySelector('.carousel__prev');
    const next   = car.querySelector('.carousel__next');
    const dots   = car.querySelectorAll('.carousel__dot');
    let idx = 0;
    let startX = 0, isDragging = false, dragOffset = 0;

    const getVisible = () => {
      const w = car.offsetWidth;
      if (w < 600) return 1;
      if (w < 900) return 2;
      return 3;
    };

    const goto = (i) => {
      const vis = getVisible();
      const max = Math.max(0, cards.length - vis);
      idx = Math.min(Math.max(i, 0), max);
      const pct = idx * (100 / vis);
      track.style.transform = `translateX(-${pct}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === idx));
    };

    if (prev) prev.addEventListener('click', () => goto(idx - 1));
    if (next) next.addEventListener('click', () => goto(idx + 1));
    dots.forEach((d, di) => d.addEventListener('click', () => goto(di)));

    /* Touch / drag */
    track.addEventListener('mousedown',  e => { isDragging = true; startX = e.clientX; });
    track.addEventListener('touchstart', e => { isDragging = true; startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('mousemove',  e => { if (!isDragging) return; dragOffset = e.clientX - startX; });
    track.addEventListener('touchmove',  e => { if (!isDragging) return; dragOffset = e.touches[0].clientX - startX; }, { passive: true });
    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      if (dragOffset < -60) goto(idx + 1);
      else if (dragOffset > 60) goto(idx - 1);
      dragOffset = 0;
    };
    track.addEventListener('mouseup', endDrag);
    track.addEventListener('touchend', endDrag);

    window.addEventListener('resize', () => goto(idx));
    goto(0);
  });

  /* ── GALLERY LIGHTBOX ───────────────────── */
  const galleryItems = document.querySelectorAll('.gallery__item');
  if (galleryItems.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `<div class="lightbox__backdrop"></div>
      <button class="lightbox__close">✕</button>
      <img class="lightbox__img" src="" alt="">`;
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('.lightbox__img');
    const open  = (src, alt) => { lbImg.src = src; lbImg.alt = alt; lb.classList.add('open'); document.body.style.overflow='hidden'; };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow=''; };

    galleryItems.forEach(item => {
      item.style.cursor = 'zoom-in';
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) open(img.src, img.alt);
      });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__backdrop').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    /* Lightbox styles injected */
    const s = document.createElement('style');
    s.textContent = `
      .lightbox { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s; }
      .lightbox.open { opacity:1;pointer-events:all; }
      .lightbox__backdrop { position:absolute;inset:0;background:rgba(0,0,0,.88); }
      .lightbox__img { position:relative;max-width:90vw;max-height:88vh;object-fit:contain;border-radius:2px; }
      .lightbox__close { position:absolute;top:20px;right:24px;background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;z-index:1; }
    `;
    document.head.appendChild(s);
  }

  /* ── FORM FEEDBACK ──────────────────────── */
  document.querySelectorAll('.js-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = '✓ Message envoyé';
      btn.disabled = true;
      btn.style.background = '#6a9e72';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3200);
    });
  });

});
