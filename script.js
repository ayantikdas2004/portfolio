/**
 * ====================================================
 * ALEX MERCER PORTFOLIO — script.js
 * Handles: parallax, scroll reveal, cursor, theme,
 *          text rotation, skill bars, form, navbar
 * ====================================================
 */

// ─── Utility: Wait for DOM ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────
  // 1. CUSTOM CURSOR
  //    Tracks mouse position with a small dot and a
  //    larger ring that lags behind for depth.
  // ─────────────────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  // Only run on non-touch devices
  if (window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot snaps instantly
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    // Follower lags behind with lerp (linear interpolation)
    function animateCursor() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.left = followerX + 'px';
      follower.style.top  = followerY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect: enlarge on interactive elements
    const hoverTargets = 'a, button, .project-card, .social-link, .tech-badge, input, textarea';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hovering');
        follower.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovering');
        follower.classList.remove('is-hovering');
      });
    });
  }


  // ─────────────────────────────────────────────────────
  // 2. SCROLL PROGRESS BAR
  //    Thin gradient line at top tracking scroll depth
  // ─────────────────────────────────────────────────────
  const progressBar = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }


  // ─────────────────────────────────────────────────────
  // 3. NAVBAR — Scroll-aware styling & active link
  // ─────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Active nav link based on section in view
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollMid >= top && scrollMid <= bottom) {
        const id = section.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--text-primary)' : '';
        });
      }
    });
  }


  // ─────────────────────────────────────────────────────
  // 4. MOBILE MENU
  // ─────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });


  // ─────────────────────────────────────────────────────
  // 5. DARK / LIGHT THEME TOGGLE
  // ─────────────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  const htmlEl = document.documentElement;

  // Persist across page loads
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☾';

  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    themeIcon.textContent = next === 'dark' ? '☀' : '☾';
    localStorage.setItem('portfolio-theme', next);
  });


  // ─────────────────────────────────────────────────────
  // 6. HERO TEXT ROTATION
  //    Cycles through words with a smooth clip animation
  // ─────────────────────────────────────────────────────
  const words = document.querySelectorAll('.title-word');
  let currentWordIndex = 0;

  function rotateWord() {
    const current = words[currentWordIndex];
    const next = words[(currentWordIndex + 1) % words.length];

    // Exit current
    current.classList.remove('active');
    current.classList.add('exiting');

    // After exit transition, reset and advance
    setTimeout(() => {
      current.classList.remove('exiting');
      currentWordIndex = (currentWordIndex + 1) % words.length;
      words[currentWordIndex].classList.add('active');
    }, 500);
  }

  // Start rotation after initial load delay
  setTimeout(() => {
    setInterval(rotateWord, 2800);
  }, 1500);


  // ─────────────────────────────────────────────────────
  // 7. SCROLL REVEAL
  //    Elements with .reveal-up/.reveal-left/.reveal-right
  //    fade in as they enter the viewport.
  //    Uses IntersectionObserver for performance.
  // ─────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate skill bars when about section reveals
        if (entry.target.classList.contains('reveal-right')) {
          animateSkillBars();
        }
        // Unobserve after first reveal for performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  // ─────────────────────────────────────────────────────
  // 8. SKILL BARS ANIMATION
  //    Triggered once when the about section enters view
  // ─────────────────────────────────────────────────────
  let skillsAnimated = false;

  function animateSkillBars() {
    if (skillsAnimated) return;
    skillsAnimated = true;

    document.querySelectorAll('.skill-fill').forEach(bar => {
      const targetWidth = bar.getAttribute('data-width');
      // Small delay to ensure layout paint
      requestAnimationFrame(() => {
        bar.style.width = targetWidth + '%';
      });
    });
  }

  // Also observe the skills section directly as fallback
  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateSkillBars();
        skillsObserver.disconnect();
      }
    }, { threshold: 0.3 });
    skillsObserver.observe(skillsSection);
  }


  // ─────────────────────────────────────────────────────
  // 9. PARALLAX SCROLLING
  //    Multiple layers move at different rates creating
  //    depth. Using requestAnimationFrame + scroll event
  //    for smooth 60fps performance.
  // ─────────────────────────────────────────────────────
  const heroBg = document.getElementById('heroBg');
  const aboutOrb = document.getElementById('aboutOrb');
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const orb3 = document.querySelector('.orb-3');

  // Ticking flag prevents unnecessary rAF calls
  let ticking = false;
  let lastScrollY = window.scrollY;

  function applyParallax() {
    const scrollY = window.scrollY;

    // ── Hero background layers at different speeds ──
    if (heroBg) {
      // Background grid moves slowest
      heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    // Orbs drift at different rates for layered depth
    if (orb1) orb1.style.transform = `translateY(${scrollY * -0.15}px)`;
    if (orb2) orb2.style.transform = `translateY(${scrollY * 0.12}px)`;
    if (orb3) orb3.style.transform = `translateY(${scrollY * -0.08}px) translateX(${scrollY * 0.05}px)`;

    // ── About section orb parallax ──
    if (aboutOrb) {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        const aboutTop = aboutSection.offsetTop;
        const relativeScroll = scrollY - aboutTop;
        aboutOrb.style.transform = `translateY(calc(-50% + ${relativeScroll * 0.2}px))`;
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }


  // ─────────────────────────────────────────────────────
  // 10. SCROLL HANDLER — batches all scroll work
  // ─────────────────────────────────────────────────────
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavbar();
        updateActiveNav();
        applyParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load
  updateNavbar();
  updateScrollProgress();


  // ─────────────────────────────────────────────────────
  // 11. SMOOTH SCROLL for anchor links
  //     Accounts for sticky navbar height
  // ─────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ─────────────────────────────────────────────────────
  // 12. CONTACT FORM
  //     Simulates async submission with loading state
  // ─────────────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      // e.preventDefault(); // Commented out to allow Netlify form submission
      const submitBtn = contactForm.querySelector('.form-submit');
      const btnText = submitBtn.querySelector('span');
      const originalText = btnText.textContent;

      // Loading state
      submitBtn.classList.add('loading');
      btnText.textContent = 'Sending…';

      // Simulate network request (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Success state
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success');
      btnText.textContent = '✓ Message Sent!';

      // Reset after delay
      setTimeout(() => {
        submitBtn.classList.remove('success');
        btnText.textContent = originalText;
        contactForm.reset();
      }, 3500);
    });

    // Input focus animations - add subtle lift to labels
    contactForm.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('focus', () => {
        input.closest('.form-group').style.transform = 'translateY(-2px)';
        input.closest('.form-group').style.transition = 'transform 0.3s ease';
      });
      input.addEventListener('blur', () => {
        input.closest('.form-group').style.transform = '';
      });
    });
  }


  // ─────────────────────────────────────────────────────
  // 13. HERO — Mouse parallax on floating tags
  //     Subtle tilt effect as mouse moves across hero
  // ─────────────────────────────────────────────────────
  const heroSection = document.getElementById('hero');
  const floatingTags = document.querySelectorAll('.ftag');

  if (heroSection && window.matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (e.clientX - rect.left - cx) / cx; // -1 to 1
      const dy = (e.clientY - rect.top - cy) / cy;

      floatingTags.forEach((tag, i) => {
        // Each tag gets a different multiplier for varied depth
        const depth = 0.5 + (i * 0.3);
        tag.style.transform = `translate(${dx * 12 * depth}px, ${dy * 8 * depth}px)`;
      });

      // Very subtle hero content tilt
      const heroContent = heroSection.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.transform = `perspective(1000px) rotateY(${dx * 1.5}deg) rotateX(${-dy * 1}deg)`;
        heroContent.style.transition = 'transform 0.4s ease';
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      floatingTags.forEach(tag => { tag.style.transform = ''; });
      const heroContent = heroSection.querySelector('.hero-content');
      if (heroContent) heroContent.style.transform = '';
    });
  }


  // ─────────────────────────────────────────────────────
  // 14. PROJECT CARDS — Mouse tracking glow effect
  //     Card surface reflects a glow following the cursor
  // ─────────────────────────────────────────────────────
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.background = `
        radial-gradient(
          circle at ${x}% ${y}%,
          rgba(0, 245, 212, 0.06) 0%,
          var(--surface) 60%
        )
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });


  // ─────────────────────────────────────────────────────
  // 15. TIMELINE ITEMS — Staggered reveal
  //     Each item delays based on its position
  // ─────────────────────────────────────────────────────
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    item.style.setProperty('--delay', `${i * 0.12}s`);
  });


  // ─────────────────────────────────────────────────────
  // 16. STAT NUMBERS — Count-up animation
  //     Numbers increment from 0 to their value on reveal
  // ─────────────────────────────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCountUp(el, target, suffix) {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      el.textContent = start + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      statNumbers.forEach(el => {
        const text = el.textContent;
        const suffix = text.replace(/[0-9]/g, ''); // e.g., "+"
        const num = parseInt(text);
        animateCountUp(el, num, suffix);
      });
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);


  // ─────────────────────────────────────────────────────
  // 17. INITIAL PAGE LOAD ANIMATION
  //     Staggered entrance for hero elements
  // ─────────────────────────────────────────────────────
  // Elements with --delay CSS variable auto-stagger via CSS
  // The .reveal-up class handles the animation; we just
  // trigger them immediately on load (no scroll needed for hero)
  const heroRevealEls = document.querySelectorAll('.hero .reveal-up');
  heroRevealEls.forEach(el => {
    // Small timeout ensures CSS transition fires
    setTimeout(() => el.classList.add('visible'), 100);
  });


  // ─────────────────────────────────────────────────────
  // 18. RESIZE HANDLER — Recalculate positions
  // ─────────────────────────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Recalculate section positions for parallax accuracy
      applyParallax();
    }, 150);
  });


  console.log('✓ Portfolio initialized — Alex Mercer');
});