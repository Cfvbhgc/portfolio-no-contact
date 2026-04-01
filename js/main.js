/* ============================================================
   DigitalPr0 Portfolio v2.4 — main.js
   Mobile: CSS animations, floating stars, stagger fade-in,
           timeline draw, card tap effects, touch-friendly modals
   Desktop: Three.js, particles, glitch, cursor, magnetic,
            horizontal scroll, scatter text, parallax, tilt, modals
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Device Detection ---------- */
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth < 768 || (isTouchDevice && window.innerWidth < 1024);
  const isDesktop = !isMobile;

  console.log('Device:', isMobile ? 'MOBILE' : 'DESKTOP', 'Width:', window.innerWidth, 'Touch:', isTouchDevice);

  /* ==========================================================
     NAVBAR (all devices)
  ========================================================== */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ==========================================================
     MOBILE MENU (all devices)
  ========================================================== */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================
     TYPEWRITER (all devices) + GLITCH (desktop only)
  ========================================================== */
  const typewriterEl = document.querySelector('.typewriter');
  if (typewriterEl) {
    const text = typewriterEl.getAttribute('data-text') || 'DigitalPr0';

    if (isMobile) {
      // Mobile: typewriter with cursor blink
      typewriterEl.textContent = '';
      typewriterEl.style.borderRight = '3px solid var(--accent)';
      let mi = 0;
      const cursorBlink = setInterval(() => {
        typewriterEl.style.borderColor =
          typewriterEl.style.borderColor === 'transparent' ? 'var(--accent)' : 'transparent';
      }, 530);
      function mobileType() {
        if (mi < text.length) {
          typewriterEl.textContent += text.charAt(mi);
          mi++;
          setTimeout(mobileType, 70 + Math.random() * 40);
        } else {
          setTimeout(() => {
            clearInterval(cursorBlink);
            typewriterEl.style.borderRight = 'none';
          }, 1500);
        }
      }
      setTimeout(mobileType, 500);
    } else {
      // Desktop: typewriter + glitch
      typewriterEl.textContent = '';
      let i = 0;

      function type() {
        if (i < text.length) {
          typewriterEl.textContent += text.charAt(i);
          i++;
          setTimeout(type, 70);
        } else {
          setTimeout(setupGlitch, 500);
        }
      }

      setTimeout(type, 600);

      const cursorBlink = setInterval(() => {
        typewriterEl.style.borderColor =
          typewriterEl.style.borderColor === 'transparent' ? 'var(--accent)' : 'transparent';
      }, 530);

      function setupGlitch() {
        clearInterval(cursorBlink);
        typewriterEl.style.borderRight = 'none';

        const wrapper = document.createElement('span');
        wrapper.className = 'glitch-wrapper';
        wrapper.setAttribute('data-text', text);
        wrapper.textContent = text;
        typewriterEl.textContent = '';
        typewriterEl.appendChild(wrapper);

        function triggerGlitch() {
          wrapper.classList.add('glitching');
          setTimeout(() => wrapper.classList.remove('glitching'), 400);
          const nextDelay = 5000 + Math.random() * 3000;
          setTimeout(triggerGlitch, nextDelay);
        }
        setTimeout(triggerGlitch, 3000);
      }
    }
  }

  /* ==========================================================
     MOBILE: FULL IMMERSIVE EXPERIENCE
  ========================================================== */
  if (isMobile) {

    /* ============ FULL-PAGE INTERACTIVE CANVAS ============ */
    const globalCanvas = document.createElement('canvas');
    globalCanvas.id = 'mob-global-canvas';
    globalCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none';
    document.body.insertBefore(globalCanvas, document.body.firstChild);

    const gCtx = globalCanvas.getContext('2d');
    let gW, gH;
    let particles = [];
    let explosions = [];
    let touchX = -1, touchY = -1, touching = false;
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 120;
    const TOUCH_RADIUS = 150;

    function gResize() {
      gW = globalCanvas.width = window.innerWidth;
      gH = globalCanvas.height = window.innerHeight;
    }

    function createParticle(x, y, isExplosion) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isExplosion ? (2 + Math.random() * 4) : (0.2 + Math.random() * 0.4);
      const colors = [
        [124,58,237],  // accent purple
        [167,139,250], // light purple
        [37,99,235],   // blue
        [6,182,212],   // cyan
        [139,92,246],  // violet
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: x ?? Math.random() * gW,
        y: y ?? Math.random() * gH,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: isExplosion ? (1 + Math.random() * 2) : (1 + Math.random() * 2.5),
        baseR: 0,
        opacity: isExplosion ? (0.8 + Math.random() * 0.2) : (0.15 + Math.random() * 0.35),
        color: color,
        pulse: Math.random() * Math.PI * 2,
        life: isExplosion ? (30 + Math.random() * 40) : Infinity,
        maxLife: isExplosion ? (30 + Math.random() * 40) : Infinity,
        isExplosion: !!isExplosion
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    // Touch handlers — INTERACTIVE
    document.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      touching = true;
      // Spawn explosion particles
      for (let i = 0; i < 15; i++) {
        particles.push(createParticle(touchX, touchY, true));
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      // Trail particles while dragging
      if (Math.random() > 0.5) {
        particles.push(createParticle(touchX + (Math.random()-0.5)*20, touchY + (Math.random()-0.5)*20, true));
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      touching = false;
      touchX = -1;
      touchY = -1;
    }, { passive: true });

    function drawGlobal() {
      gCtx.clearRect(0, 0, gW, gH);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.pulse += 0.03;
        const pf = 0.7 + Math.sin(p.pulse) * 0.3;

        // Touch interaction — magnetic attract/repel
        if (touching && touchX > 0 && !p.isExplosion) {
          const dx = touchX - p.x;
          const dy = touchY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < TOUCH_RADIUS && dist > 0) {
            const force = (TOUCH_RADIUS - dist) / TOUCH_RADIUS;
            // Orbit around finger
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle + Math.PI/2) * force * 0.3 + Math.cos(angle) * force * 0.05;
            p.vy += Math.sin(angle + Math.PI/2) * force * 0.3 + Math.sin(angle) * force * 0.05;
          }
        }

        // Friction
        if (p.isExplosion) {
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life--;
          p.opacity = (p.life / p.maxLife) * 0.8;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
        } else {
          p.vx *= 0.99;
          p.vy *= 0.99;
          // Gentle drift
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
          // Speed limit
          const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (spd > 1.5) { p.vx *= 1.5/spd; p.vy *= 1.5/spd; }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (!p.isExplosion) {
          if (p.x < -10) p.x = gW + 10;
          if (p.x > gW + 10) p.x = -10;
          if (p.y < -10) p.y = gH + 10;
          if (p.y > gH + 10) p.y = -10;
        }

        const [r,g,b] = p.color;

        // Glow halo
        const grad = gCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4 * pf);
        grad.addColorStop(0, `rgba(${r},${g},${b},${p.opacity * pf * 0.6})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        gCtx.beginPath();
        gCtx.arc(p.x, p.y, p.r * 4 * pf, 0, Math.PI * 2);
        gCtx.fillStyle = grad;
        gCtx.fill();

        // Core
        gCtx.beginPath();
        gCtx.arc(p.x, p.y, p.r * pf, 0, Math.PI * 2);
        gCtx.fillStyle = `rgba(${r},${g},${b},${p.opacity * pf})`;
        gCtx.fill();
      }

      // Connection lines (only non-explosion particles)
      const baseParts = particles.filter(p => !p.isExplosion);
      for (let i = 0; i < baseParts.length; i++) {
        for (let j = i + 1; j < baseParts.length; j++) {
          const a = baseParts[i], b = baseParts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECTION_DIST) {
            const alpha = 0.12 * (1 - d / CONNECTION_DIST);
            gCtx.beginPath();
            gCtx.moveTo(a.x, a.y);
            gCtx.lineTo(b.x, b.y);
            gCtx.strokeStyle = `rgba(124,58,237,${alpha})`;
            gCtx.lineWidth = 0.8;
            gCtx.stroke();
          }
        }
      }

      // Touch ring effect
      if (touching && touchX > 0) {
        const t = Date.now() * 0.003;
        for (let i = 0; i < 3; i++) {
          const ringR = 20 + i * 25 + Math.sin(t + i) * 10;
          gCtx.beginPath();
          gCtx.arc(touchX, touchY, ringR, 0, Math.PI * 2);
          gCtx.strokeStyle = `rgba(124,58,237,${0.15 - i * 0.04})`;
          gCtx.lineWidth = 1.5 - i * 0.4;
          gCtx.stroke();
        }
      }

      // Keep particle count reasonable
      if (particles.length > PARTICLE_COUNT + 50) {
        particles = particles.filter(p => !p.isExplosion || p.life > 5);
      }

      requestAnimationFrame(drawGlobal);
    }

    gResize();
    initParticles();
    drawGlobal();
    window.addEventListener('resize', () => { gResize(); });

    /* ============ HERO SECTION ELEMENTS ============ */
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      // Animated grid overlay
      const grid = document.createElement('div');
      grid.className = 'mob-hero-grid';
      heroSection.appendChild(grid);

      // Morphing neon blob
      const blob = document.createElement('div');
      blob.className = 'mob-blob';
      heroSection.appendChild(blob);

      // 3D wireframe shapes
      for (let i = 1; i <= 5; i++) {
        const shape = document.createElement('div');
        shape.className = `mob-shape mob-shape-${i}`;
        shape.innerHTML = '<div class="mob-shape-inner"></div>';
        heroSection.appendChild(shape);
      }

      // Code rain
      const codeRain = document.createElement('div');
      codeRain.className = 'mob-code-rain';
      const codeSnippets = ['const','let','var','function','return','async','await','import','class','if','else','for','while','true','null','{}','[]','()','</>','=>','===','!==','&&','||','...','0x','//','/*','*/'];
      const cols = Math.floor(window.innerWidth / 25);
      for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.className = 'mob-code-col';
        col.style.left = (i * 25) + 'px';
        col.style.animationDuration = (5 + Math.random() * 10) + 's';
        col.style.animationDelay = (Math.random() * 10) + 's';
        col.style.fontSize = (9 + Math.random() * 4) + 'px';
        let text = '';
        for (let j = 0; j < 6 + Math.floor(Math.random() * 8); j++) {
          text += codeSnippets[Math.floor(Math.random() * codeSnippets.length)] + ' ';
        }
        col.textContent = text;
        codeRain.appendChild(col);
      }
      heroSection.appendChild(codeRain);

      // Floating stars
      for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'hero-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = (5 + Math.random() * 90) + '%';
        const size = (1 + Math.random() * 4) + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.animationDuration = (3 + Math.random() * 8) + 's';
        star.style.animationDelay = (Math.random() * 6) + 's';
        heroSection.appendChild(star);
      }
    }

    /* ============ SCROLL PROGRESS BAR ============ */
    const scrollBar = document.createElement('div');
    scrollBar.className = 'mob-scroll-progress';
    document.body.appendChild(scrollBar);

    /* ============ FLOATING NEON ORBS ============ */
    for (let i = 1; i <= 3; i++) {
      const orb = document.createElement('div');
      orb.className = 'mob-orb mob-orb-' + i;
      document.body.appendChild(orb);
    }

    /* ============ SCROLL HANDLERS ============ */
    let scrollTick = false;
    window.addEventListener('scroll', () => {
      if (!scrollTick) {
        requestAnimationFrame(() => {
          // Scroll progress
          const h = document.documentElement.scrollHeight - window.innerHeight;
          scrollBar.style.width = h > 0 ? ((window.scrollY / h) * 100) + '%' : '0';

          // Timeline progress
          const tl = document.querySelector('.timeline');
          if (tl) {
            const rect = tl.getBoundingClientRect();
            const start = window.innerHeight * 0.85;
            const progress = Math.max(0, Math.min(1, (start - rect.top) / (rect.height + start * 0.3)));
            tl.style.setProperty('--tl-progress', progress);
          }

          scrollTick = false;
        });
        scrollTick = true;
      }
    }, { passive: true });

    /* ============ RIPPLE ON BUTTONS ============ */
    document.querySelectorAll('.hero-cta, .cta-card, .back-btn').forEach(btn => {
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.addEventListener('touchstart', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'mob-ripple';
        const size = Math.max(rect.width, rect.height) * 2;
        const touch = e.touches[0];
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (touch.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (touch.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }, { passive: true });
    });

    /* ============ GLITCH EFFECT ============ */
    const twEl = document.querySelector('.typewriter');
    if (twEl) {
      setTimeout(() => {
        const w = twEl.querySelector('.glitch-wrapper') || twEl;
        if (!w.classList.contains('glitch-wrapper')) {
          const text = twEl.textContent;
          const gw = document.createElement('span');
          gw.className = 'glitch-wrapper';
          gw.setAttribute('data-text', text);
          gw.textContent = text;
          twEl.textContent = '';
          twEl.appendChild(gw);
          twEl.style.borderRight = 'none';
        }
        const gWrapper = twEl.querySelector('.glitch-wrapper');
        function mobGlitch() {
          gWrapper.classList.add('glitching');
          setTimeout(() => gWrapper.classList.remove('glitching'), 300);
          setTimeout(mobGlitch, 3000 + Math.random() * 3000);
        }
        setTimeout(mobGlitch, 2000);
      }, 3500);
    }

    /* ============ BADGE COUNT-UP ============ */
    document.querySelectorAll('.badge').forEach(badge => {
      const text = badge.textContent;
      const match = text.match(/(\d+)/);
      if (match) {
        badge.setAttribute('data-target', match[1]);
        badge.setAttribute('data-suffix', text.replace(match[1], '').trim());
        badge.textContent = '0 ' + badge.getAttribute('data-suffix');
      }
    });
    const badgeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const b = entry.target, target = parseInt(b.getAttribute('data-target')), suffix = b.getAttribute('data-suffix');
          if (!target) return;
          let cur = 0;
          const step = Math.ceil(target / 15);
          const iv = setInterval(() => {
            cur = Math.min(cur + step, target);
            b.textContent = cur + ' ' + suffix;
            if (cur >= target) clearInterval(iv);
          }, 50);
          badgeObs.unobserve(b);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.badge').forEach(b => badgeObs.observe(b));

    /* ============ INTERSECTION OBSERVER — FADE IN ============ */
    // IMPORTANT: Do NOT add mob-fade to hero elements — they have their own CSS animations
    const fadeSelectors = '.reveal, .reveal-left, .about-content, .about-content p, .skill-category, .timeline-item, .project-category-card, .project-card, .section-title, .section-subtitle, .badge, .category-hero h1, .category-hero .category-desc, .category-hero .category-count, .back-link';
    document.querySelectorAll(fadeSelectors).forEach(el => {
      // Skip anything inside .hero — hero has its own CSS animations
      if (el.closest('.hero')) return;
      el.classList.add('mob-fade');
    });

    ['.projects-grid .project-category-card','.project-cards-grid .project-card','.timeline .timeline-item'].forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (el.closest('.hero')) return;
        el.classList.add('mob-fade', 'mob-stagger');
        el.style.setProperty('--stagger-delay', (i * 0.08) + 's');
      });
    });
    document.querySelectorAll('.skill-category').forEach(cat => {
      if (cat.closest('.hero')) return;
      cat.querySelectorAll('.skill-item').forEach((item, i) => {
        item.classList.add('mob-fade', 'mob-stagger');
        item.style.setProperty('--stagger-delay', (i * 0.04) + 's');
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mob-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.mob-fade').forEach(el => observer.observe(el));

    /* ============ TIMELINE ITEMS ============ */
    const tlItemObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mob-tl-item-visible');
          tlItemObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.timeline-item').forEach(item => tlItemObs.observe(item));

    /* ============ CATEGORY PAGES — canvas particles ============ */
    const catHero = document.querySelector('.category-hero');
    if (catHero) {
      const catCanvas = document.createElement('canvas');
      catCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
      catHero.style.position = 'relative';
      catHero.appendChild(catCanvas);
      const cCtx = catCanvas.getContext('2d');
      let cParts = [];
      function cResize() { catCanvas.width = catCanvas.offsetWidth; catCanvas.height = catCanvas.offsetHeight; }
      function cCreate() {
        cParts = [];
        for (let i = 0; i < 30; i++) {
          cParts.push({ x:Math.random()*catCanvas.width, y:Math.random()*catCanvas.height, vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5, r:Math.random()*2+1, opacity:Math.random()*.4+.2, pulse:Math.random()*Math.PI*2 });
        }
      }
      function cDraw() {
        cCtx.clearRect(0, 0, catCanvas.width, catCanvas.height);
        cParts.forEach((p, i) => {
          p.pulse += 0.02; p.x += p.vx; p.y += p.vy;
          if (p.x<0) p.x=catCanvas.width; if (p.x>catCanvas.width) p.x=0;
          if (p.y<0) p.y=catCanvas.height; if (p.y>catCanvas.height) p.y=0;
          const f = .7+Math.sin(p.pulse)*.3;
          const g = cCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
          g.addColorStop(0,`rgba(167,139,250,${p.opacity*f})`);
          g.addColorStop(1,'rgba(167,139,250,0)');
          cCtx.beginPath(); cCtx.arc(p.x,p.y,p.r*3,0,Math.PI*2); cCtx.fillStyle=g; cCtx.fill();
          cCtx.beginPath(); cCtx.arc(p.x,p.y,p.r*f,0,Math.PI*2);
          cCtx.fillStyle=`rgba(167,139,250,${p.opacity*f})`; cCtx.fill();
          for (let j=i+1;j<cParts.length;j++) {
            const d=Math.hypot(p.x-cParts[j].x,p.y-cParts[j].y);
            if(d<90){cCtx.beginPath();cCtx.moveTo(p.x,p.y);cCtx.lineTo(cParts[j].x,cParts[j].y);
            cCtx.strokeStyle=`rgba(124,58,237,${.15*(1-d/90)})`;cCtx.lineWidth=.6;cCtx.stroke();}
          }
        });
        requestAnimationFrame(cDraw);
      }
      cResize(); cCreate(); cDraw();
      window.addEventListener('resize', () => { cResize(); cCreate(); });
    }
  }

  /* ==========================================================
     DESKTOP-ONLY EFFECTS — skip entirely on mobile
  ========================================================== */
  if (isDesktop) {

    /* ---- THREE.JS 3D HERO BACKGROUND ---- */
    const threeContainer = document.getElementById('three-container');
    if (threeContainer && typeof THREE !== 'undefined') {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      threeContainer.appendChild(renderer.domElement);

      const wireMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.3 });
      const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.2 });

      const shapes = [];
      const geo1 = new THREE.IcosahedronGeometry(1.2, 1);
      const mesh1 = new THREE.Mesh(geo1, wireMat);
      mesh1.position.set(-2.5, 0.5, 0);
      scene.add(mesh1);
      shapes.push({ mesh: mesh1, rx: 0.003, ry: 0.005, baseX: -2.5, baseY: 0.5 });

      const geo2 = new THREE.TorusGeometry(0.8, 0.3, 16, 32);
      const mesh2 = new THREE.Mesh(geo2, wireMat2);
      mesh2.position.set(2.5, -0.5, -1);
      scene.add(mesh2);
      shapes.push({ mesh: mesh2, rx: 0.005, ry: 0.003, baseX: 2.5, baseY: -0.5 });

      const geo3 = new THREE.OctahedronGeometry(0.9, 0);
      const mesh3 = new THREE.Mesh(geo3, wireMat);
      mesh3.position.set(0.5, 1.8, -0.5);
      scene.add(mesh3);
      shapes.push({ mesh: mesh3, rx: 0.004, ry: 0.006, baseX: 0.5, baseY: 1.8 });

      const geo4 = new THREE.TetrahedronGeometry(0.7, 0);
      const mesh4 = new THREE.Mesh(geo4, wireMat2);
      mesh4.position.set(-1.5, -1.5, -1);
      scene.add(mesh4);
      shapes.push({ mesh: mesh4, rx: 0.006, ry: 0.004, baseX: -1.5, baseY: -1.5 });

      let mouseX = 0, mouseY = 0;
      if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });
      }

      function animateThree() {
        requestAnimationFrame(animateThree);
        shapes.forEach(s => {
          s.mesh.rotation.x += s.rx;
          s.mesh.rotation.y += s.ry;
          if (!isTouchDevice) {
            s.mesh.position.x = s.baseX + mouseX * 0.3;
            s.mesh.position.y = s.baseY - mouseY * 0.3;
          }
        });
        renderer.render(scene, camera);
      }
      animateThree();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    /* ---- PARTICLE SYSTEM (2D Canvas) ---- */
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let particles = [];
      let pMouseX = -1000, pMouseY = -1000;

      function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      function createParticles() {
        particles = [];
        const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.15
          });
        }
      }

      if (!isTouchDevice) {
        const heroEl = document.querySelector('.hero');
        if (heroEl) {
          heroEl.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            pMouseX = e.clientX - rect.left;
            pMouseY = e.clientY - rect.top;
          }, { passive: true });
          heroEl.addEventListener('mouseleave', () => { pMouseX = -1000; pMouseY = -1000; });
        }
      }

      function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const accentRGB = '124,58,237';

        particles.forEach((p, i) => {
          if (!isTouchDevice && pMouseX > 0) {
            const dx = pMouseX - p.x;
            const dy = pMouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              const force = (200 - dist) / 200 * 0.02;
              p.vx += dx * force * 0.01;
              p.vy += dy * force * 0.01;
            }
          }

          p.vx *= 0.99;
          p.vy *= 0.99;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accentRGB},${p.opacity})`;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const ddx = p.x - p2.x;
            const ddy = p.y - p2.y;
            const d = Math.sqrt(ddx * ddx + ddy * ddy);
            if (d < 130) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${accentRGB},${0.1 * (1 - d / 130)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        });

        requestAnimationFrame(drawParticles);
      }

      resizeCanvas();
      createParticles();
      drawParticles();
      window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
    }

    /* ---- CUSTOM CURSOR (desktop + non-touch only) ---- */
    if (!isTouchDevice) {
      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      document.body.appendChild(dot);

      const outline = document.createElement('div');
      outline.className = 'cursor-outline';
      document.body.appendChild(outline);

      const trailCount = 5;
      const trails = [];
      for (let i = 0; i < trailCount; i++) {
        const t = document.createElement('div');
        t.className = 'cursor-trail';
        t.style.opacity = (1 - i / trailCount) * 0.4;
        t.style.width = (5 - i) + 'px';
        t.style.height = (5 - i) + 'px';
        document.body.appendChild(t);
        trails.push({ el: t, x: 0, y: 0 });
      }

      let curX = 0, curY = 0;
      let outX = 0, outY = 0;

      document.addEventListener('mousemove', (e) => {
        curX = e.clientX;
        curY = e.clientY;
      }, { passive: true });

      function animateCursor() {
        dot.style.left = curX + 'px';
        dot.style.top = curY + 'px';
        outX += (curX - outX) * 0.15;
        outY += (curY - outY) * 0.15;
        outline.style.left = outX + 'px';
        outline.style.top = outY + 'px';

        let prevX = curX, prevY = curY;
        trails.forEach((t, i) => {
          t.x += (prevX - t.x) * (0.3 - i * 0.04);
          t.y += (prevY - t.y) * (0.3 - i * 0.04);
          t.el.style.left = t.x + 'px';
          t.el.style.top = t.y + 'px';
          prevX = t.x;
          prevY = t.y;
        });

        requestAnimationFrame(animateCursor);
      }
      animateCursor();

      document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .hero-cta, .cta-card, .back-btn, .nav-logo');
        const card = e.target.closest('.project-card, .project-category-card');
        if (target) {
          outline.classList.add('hover-link');
          outline.classList.remove('hover-card');
        } else if (card) {
          outline.classList.add('hover-card');
          outline.classList.remove('hover-link');
        } else {
          outline.classList.remove('hover-link', 'hover-card');
        }
      }, { passive: true });
    }

    /* ---- MAGNETIC BUTTONS (desktop + non-touch only) ---- */
    if (!isTouchDevice) {
      const magneticEls = document.querySelectorAll('.hero-cta, .cta-card, .back-btn, .nav-links a, .nav-logo');
      const magnetRadius = 80;

      magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < magnetRadius) {
            const strength = (1 - dist / magnetRadius) * 0.4;
            el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
          }
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
          if (typeof gsap !== 'undefined') {
            gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' });
          }
        });
      });
    }

    /* ---- 3D TILT EFFECT ON CARDS (desktop + non-touch only) ---- */
    if (!isTouchDevice) {
      const tiltCards = document.querySelectorAll('.project-card, .project-category-card');
      tiltCards.forEach(card => {
        const shine = document.createElement('div');
        shine.className = 'card-shine';
        card.appendChild(shine);

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;

          const rotateX = ((y - cy) / cy) * -10;
          const rotateY = ((x - cx) / cx) * 10;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;

          const px = (x / rect.width) * 100;
          const py = (y / rect.height) * 100;
          shine.style.setProperty('--mouse-x', px + '%');
          shine.style.setProperty('--mouse-y', py + '%');
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          if (typeof gsap !== 'undefined') {
            gsap.to(card, { rotateX: 0, rotateY: 0, z: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform' });
          }
        });
      });
    }

    /* ---- GSAP + SCROLLTRIGGER ANIMATIONS (desktop only) ---- */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      gsap.utils.toArray('.reveal-left').forEach(el => {
        gsap.to(el, {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      gsap.utils.toArray('.skill-category').forEach(section => {
        const items = section.querySelectorAll('.skill-item');
        gsap.to(items, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', once: true }
        });
      });

      const projectCards = gsap.utils.toArray('.project-category-card');
      if (projectCards.length) {
        gsap.to(projectCards, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: projectCards[0]?.parentElement, start: 'top 80%', once: true }
        });
      }

      const timelineItems = gsap.utils.toArray('.timeline-item');
      if (timelineItems.length) {
        gsap.to(timelineItems, {
          opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.timeline', start: 'top 80%', once: true }
        });
      }

      const projectPageCards = gsap.utils.toArray('.project-card');
      if (projectPageCards.length) {
        gsap.to(projectPageCards, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: projectPageCards[0]?.parentElement, start: 'top 85%', once: true }
        });
      }

      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        gsap.to('.hero-content', {
          y: -60, opacity: 0.3, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      /* Horizontal Scroll Skills (desktop only) */
      const skillsGrid = document.querySelector('.skills-grid');
      const skillsSection = document.querySelector('.skills-section');
      if (skillsGrid && skillsSection) {
        skillsGrid.classList.add('horizontal-mode');
        const progressBar = document.querySelector('.skills-progress-bar');

        gsap.to(skillsGrid, {
          x: () => -(skillsGrid.scrollWidth - window.innerWidth + 100),
          ease: 'none',
          scrollTrigger: {
            trigger: skillsSection,
            pin: true,
            scrub: 1,
            end: () => '+=' + skillsGrid.scrollWidth,
            onUpdate: (self) => {
              if (progressBar) progressBar.style.width = (self.progress * 100) + '%';
            }
          }
        });
      }

      /* Scatter Text Animation (desktop only) */
      document.querySelectorAll('.scatter-text').forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        text.split('').forEach(char => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          el.appendChild(span);
        });

        const spans = el.querySelectorAll('span');
        spans.forEach(span => {
          gsap.set(span, {
            opacity: 0,
            x: () => (Math.random() - 0.5) * 200,
            y: () => (Math.random() - 0.5) * 100,
            rotation: () => (Math.random() - 0.5) * 60
          });
        });

        gsap.to(spans, {
          opacity: 1, x: 0, y: 0, rotation: 0,
          duration: 0.8, stagger: 0.03, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      /* Parallax Orbs (desktop only) */
      gsap.utils.toArray('.parallax-orb').forEach((orb, i) => {
        const speed = (i + 1) * 0.3;
        gsap.to(orb, {
          y: () => speed * -150,
          ease: 'none',
          scrollTrigger: { trigger: orb.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

  } // END isDesktop

  /* ==========================================================
     PROJECT MODAL SYSTEM (all devices)
  ========================================================== */
  const projectsData = {
    // ---- Frontend ----
    "Цифровой дневник настроений": {
      desc: "Полноценное React-приложение для ежедневного отслеживания эмоционального состояния. Пользователь выбирает настроение, добавляет заметки и видит красочную статистику за неделю, месяц и год. Интерфейс адаптируется по цветовой гамме к выбранному настроению, создавая уникальный визуальный опыт. Данные хранятся локально с возможностью экспорта.",
      features: ["Интерактивные графики настроений (Chart.js)", "Автоматическая цветовая тема под эмоцию", "Экспорт данных в PDF и CSV", "Напоминания о заполнении дневника"],
      difficulty: "Middle", time: "~3 недели",
      siteUrl: "https://mood-diary-ochre.vercel.app",
      githubUrl: "https://github.com/Cfvbhgc/mood-diary"
    },
    "Semiglobe Brasil": {
      desc: "Премиальный лендинг для запуска бразильского бренда на международном рынке. Сайт включает параллакс-эффекты, плавные анимации при скролле, мультиязычность (PT/EN/ES) и адаптивную вёрстку. Особое внимание уделено перфомансу — все анимации работают через GPU-ускорение с GSAP.",
      features: ["Многослойный параллакс на GSAP", "Мультиязычность без перезагрузки", "Анимированная галерея продуктов", "SEO-оптимизация и Open Graph теги"],
      difficulty: "Middle", time: "~2 недели",
      siteUrl: "https://semiglobe-brasil.vercel.app",
      githubUrl: "https://github.com/Cfvbhgc/semiglobe-brasil"
    },
    "Shemberg": {
      desc: "Каталог премиальных окон и фасадных систем Schuco с расширенной фильтрацией по характеристикам. Включает галерею готовых объектов с лайтбоксом, 3D-превью моделей через Three.js и калькулятор стоимости. Адаптивный дизайн с мобильным каталогом.",
      features: ["3D-визуализация оконных профилей (Three.js)", "Фильтрация по типу, размеру, цвету", "Интерактивный калькулятор стоимости", "Галерея реализованных проектов"],
      difficulty: "Senior", time: "~1 месяц",
      siteUrl: "https://shemberg-windows.vercel.app",
      githubUrl: "https://github.com/Cfvbhgc/shemberg-windows"
    },
    "Hero Design Portfolio": {
      desc: "Сайт-портфолио для дизайнера с акцентом на мощный hero-блок и storytelling через анимации. Каждая секция рассказывает историю проектов через последовательные анимации при скролле. Использует GSAP ScrollTrigger для кинематографичного эффекта.",
      features: ["Кинематографические scroll-анимации", "Кастомный курсор с hover-эффектами", "Плавные переходы между секциями", "Ленивая загрузка изображений"],
      difficulty: "Middle", time: "~2 недели",
      siteUrl: "https://hero-design-taupe.vercel.app",
      githubUrl: "https://github.com/Cfvbhgc/hero-design"
    },
    "SalesDash": {
      desc: "Дашборд аналитики продаж с real-time обновлением данных через REST API. Включает графики выручки, конверсии, топ-продуктов и географию клиентов. Фильтры по дате, категории и менеджеру. Экспорт отчётов в Excel и PDF.",
      features: ["Real-time обновление данных", "Множественные типы графиков", "Экспорт в Excel и PDF", "Фильтрация по 5+ параметрам"],
      difficulty: "Senior", time: "~1 месяц",
      siteUrl: "https://sales-dash-teal.vercel.app",
      githubUrl: "https://github.com/Cfvbhgc/sales-dash"
    },
    "DevConf Landing": {
      desc: "Лендинг IT-конференции с живым таймером обратного отсчёта до мероприятия. Содержит программу докладов с фильтрацией по трекам, профили спикеров, интерактивную карту площадки и форму регистрации с валидацией.",
      features: ["Таймер обратного отсчёта", "Фильтрация докладов по трекам", "Интерактивная карта площадки", "Форма регистрации с валидацией"],
      difficulty: "Junior", time: "~1 неделя",
      siteUrl: "https://cfvbhgc.github.io/devconf-landing/",
      githubUrl: "https://github.com/Cfvbhgc/devconf-landing"
    },
    // ---- Python ----
    "MarketAPI": {
      desc: "RESTful API для онлайн-маркетплейса с полным циклом покупки. Каталог товаров с пагинацией и фильтрацией, корзина с промокодами, интеграция с платёжными шлюзами и система отзывов с модерацией. Полная документация через Swagger.",
      features: ["CRUD каталога с пагинацией", "Система промокодов и скидок", "Интеграция платёжных шлюзов", "Swagger-документация API"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/market-api"
    },
    "PriceRadar": {
      desc: "Автоматизированная система мониторинга цен конкурентов. Парсит данные с множества сайтов по расписанию, строит графики изменения цен и отправляет алерты при значительных отклонениях. Celery для фоновых задач, Redis для кэширования.",
      features: ["Парсинг 10+ источников данных", "Графики динамики цен", "Email/Telegram алерты", "Планировщик задач (Celery)"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/price-radar"
    },
    "AuthMicro": {
      desc: "Микросервис авторизации с поддержкой JWT, refresh-токенов и двухфакторной аутентификации через TOTP. Готовое решение для интеграции в любую микросервисную архитектуру. Включает rate-limiting и логирование подозрительной активности.",
      features: ["JWT + refresh-токены", "2FA через TOTP (Google Authenticator)", "Rate-limiting и anti-bruteforce", "Аудит-логи авторизаций"],
      difficulty: "Senior", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/auth-micro"
    },
    "SheetSync": {
      desc: "Инструмент автоматизации отчётности для бизнеса. Собирает данные из Google Sheets, обрабатывает и агрегирует через pandas, формирует красивые отчёты и рассылает по расписанию ответственным сотрудникам через email.",
      features: ["Интеграция с Google Sheets API", "Обработка данных через pandas", "Автоматическая email-рассылка", "Планировщик отчётов (cron)"],
      difficulty: "Junior", time: "~1 неделя",
      githubUrl: "https://github.com/Cfvbhgc/sheet-sync"
    },
    "MiniCRM": {
      desc: "Лёгкая CRM-система для малого бизнеса. Управление клиентской базой, ведение сделок через воронку продаж, постановка задач сотрудникам и дашборд аналитики. REST API на Django с Celery для отложенных задач.",
      features: ["Воронка продаж с drag-and-drop", "Карточки клиентов с историей", "Задачи сотрудникам с дедлайнами", "Аналитический дашборд"],
      difficulty: "Senior", time: "~1.5 месяца",
      githubUrl: "https://github.com/Cfvbhgc/mini-crm"
    },
    // ---- Node.js ----
    "LiveChat": {
      desc: "Real-time мессенджер с поддержкой комнат, приватных сообщений и индикаторов онлайн/оффлайн. Построен на Socket.io для мгновенной доставки сообщений. История чатов хранится в MongoDB с пагинацией. Поддержка эмодзи и файлов.",
      features: ["Real-time сообщения через WebSocket", "Комнаты и приватные чаты", "Индикаторы «печатает» и онлайн-статус", "История сообщений с поиском"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/live-chat"
    },
    "FoodFlow API": {
      desc: "Бэкенд API для сервиса доставки еды. Полный цикл: от просмотра меню ресторана до оформления заказа и отслеживания курьера в реальном времени. Интеграция со Stripe для оплаты. Геолокация для поиска ближайших ресторанов.",
      features: ["Каталог ресторанов с геолокацией", "Real-time отслеживание курьера", "Интеграция Stripe для оплаты", "Push-уведомления о статусе заказа"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/foodflow-api"
    },
    "SnapLink": {
      desc: "Сервис сокращения ссылок с расширенной аналитикой. Кастомные алиасы, автоматическая генерация QR-кодов, детальная статистика переходов по странам, устройствам и времени. Redis для быстрого редиректа.",
      features: ["Кастомные и автоматические алиасы", "QR-коды для каждой ссылки", "Аналитика: география, устройства, время", "API для интеграции с другими сервисами"],
      difficulty: "Junior", time: "~1 неделя",
      githubUrl: "https://github.com/Cfvbhgc/snaplink"
    },
    "NotifyHub": {
      desc: "Универсальный хаб push-уведомлений для мультиканальной отправки (email, Telegram, SMS, WebPush). Шаблоны сообщений, очередь через RabbitMQ, группировка и планирование рассылок. Дашборд со статистикой доставки.",
      features: ["Мультиканальная отправка уведомлений", "Шаблоны сообщений с переменными", "Очередь сообщений (RabbitMQ)", "Статистика доставки и открытий"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/notify-hub"
    },
    "PDFForge": {
      desc: "Микросервис генерации PDF-отчётов из HTML-шаблонов с поддержкой графиков, таблиц и кастомных стилей. Headless Chrome через Puppeteer для идеального рендеринга. API принимает JSON-данные и возвращает готовый PDF.",
      features: ["HTML-шаблоны для отчётов", "Поддержка графиков и таблиц", "REST API для генерации", "Кэширование частых отчётов"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/pdf-forge"
    },
    // ---- Bots ----
    "ScheduleBot": {
      desc: "Telegram-бот для управления расписанием: клиенты записываются на удобное время, получают напоминания за час до визита. Синхронизация с Google Calendar, управление слотами и блокировка занятого времени. Админ-панель через inline-клавиатуру.",
      features: ["Онлайн-запись клиентов", "Синхронизация с Google Calendar", "Автоматические напоминания", "Админ-панель управления слотами"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/schedule-bot"
    },
    "FreelanceHelper": {
      desc: "Бот-ассистент фрилансера для отслеживания задач, учёта рабочего времени и контроля дедлайнов. Трекинг по проектам, генерация отчётов за период и напоминания о предстоящих дедлайнах. Хранение данных в SQLite.",
      features: ["Трекинг задач по проектам", "Таймер рабочего времени", "Напоминания о дедлайнах", "Генерация отчётов за период"],
      difficulty: "Junior", time: "~1.5 недели",
      githubUrl: "https://github.com/Cfvbhgc/freelance-helper"
    },
    "ShopBot": {
      desc: "Полноценный бот-магазин с каталогом товаров, корзиной, inline-оплатой через Telegram Payments и уведомлениями о статусе заказа. Админка для управления каталогом и просмотра заказов. Поддержка промокодов.",
      features: ["Каталог с категориями и поиском", "Корзина и inline-оплата", "Уведомления о статусе заказа", "Админка управления каталогом"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/shop-bot"
    },
    "AutoPoster": {
      desc: "Бот для автоматической публикации контента в несколько Telegram-каналов по расписанию. Планировщик публикаций, поддержка медиа-контента, аналитика охватов и вовлечённости. Celery для фоновых задач, Redis для очередей.",
      features: ["Мультиканальная публикация", "Планировщик с визуальным календарём", "Аналитика охватов и вовлечённости", "Поддержка текста, фото, видео"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/auto-poster"
    },
    "QuizMaster": {
      desc: "Образовательный бот-викторина с банком вопросов по категориям, рейтинговой системой и отслеживанием прогресса. Вопросы с вариантами ответов и пояснениями. Глобальный рейтинг игроков и персональная статистика.",
      features: ["Банк вопросов по категориям", "Глобальный рейтинг игроков", "Статистика прогресса и слабых мест", "Режим обучения с пояснениями"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/quiz-master"
    },
    "ServerWatch": {
      desc: "Бот мониторинга серверов: отслеживает CPU, RAM, диск и сеть в реальном времени. Отправляет алерты при превышении пороговых значений. Генерирует графики метрик через Matplotlib. Управление серверами через команды бота.",
      features: ["Мониторинг CPU, RAM, диска, сети", "Алерты при превышении порогов", "Графики метрик (Matplotlib)", "Удалённое управление через команды"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/server-watch"
    },
    // ---- C/C++ ----
    "FileNav": {
      desc: "Консольный двухпанельный файловый менеджер в стиле Midnight Commander. Навигация по файловой системе, копирование, перемещение, удаление файлов через горячие клавиши. Интерфейс на ncurses с цветовой подсветкой типов файлов.",
      features: ["Двухпанельный интерфейс (ncurses)", "Горячие клавиши для всех операций", "Цветовая подсветка типов файлов", "Встроенный просмотр текстовых файлов"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/file-nav"
    },
    "ChessEngine": {
      desc: "Шахматный движок с AI-оппонентом на алгоритме minimax с альфа-бета отсечением. Несколько уровней сложности, валидация ходов по правилам FIDE, поддержка рокировки и взятия на проходе. Консольный интерфейс с ASCII-доской.",
      features: ["AI на minimax + альфа-бета отсечение", "3 уровня сложности", "Полная валидация ходов FIDE", "Сохранение и загрузка партий"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/chess-engine"
    },
    "HuffCompress": {
      desc: "Утилита сжатия файлов на основе алгоритма Хаффмана. Поддержка сжатия и распаковки любых бинарных файлов. Визуализация дерева Хаффмана в консоли. Бенчмарки скорости и степени сжатия для разных типов данных.",
      features: ["Сжатие любых бинарных файлов", "Визуализация дерева Хаффмана", "Бенчмарки производительности", "Пакетная обработка файлов"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/huff-compress"
    },
    "ParticleSim": {
      desc: "Визуальный симулятор физики частиц с гравитацией, столкновениями и пружинными связями. Рендеринг через OpenGL, интерактивное управление параметрами: масса, гравитация, трение. Возможность добавлять частицы кликом мыши.",
      features: ["Физика: гравитация, столкновения, пружины", "Рендеринг на OpenGL + GLFW", "Интерактивное управление параметрами", "Добавление частиц кликом мыши"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/particle-sim"
    },
    "ThreadServ": {
      desc: "Многопоточный HTTP-сервер с пулом потоков для обработки параллельных запросов. Поддержка статических файлов, базовый роутинг, кэширование ответов и ротация логов. Написан на чистом C++ без сторонних фреймворков.",
      features: ["Пул потоков для параллельной обработки", "Раздача статических файлов", "Кэширование ответов в памяти", "Ротация логов и мониторинг"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/thread-serv"
    },
    // ---- C#/.NET ----
    "FinTracker": {
      desc: "Десктопное WPF-приложение для личного учёта финансов. Категоризация доходов и расходов, визуализация через графики, планирование бюджетов на месяц и экспорт данных. Архитектура MVVM для чистого разделения логики и UI.",
      features: ["Категоризация доходов/расходов", "Графики и статистика (LiveCharts)", "Планирование бюджетов", "Экспорт в Excel и CSV"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/fin-tracker"
    },
    "BookingAPI": {
      desc: "REST API для системы бронирования: управление залами, временными слотами, подтверждение и отмена бронирований. Email-уведомления о статусе. Защита от двойного бронирования через транзакции. Swagger-документация.",
      features: ["Управление залами и слотами", "Защита от двойного бронирования", "Email-уведомления", "Swagger-документация API"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/booking-api"
    },
    "StockManager": {
      desc: "Система управления складом на Blazor: приход и расход товаров, инвентаризация, формирование отчётов по остаткам. Сканирование штрих-кодов, уведомления о критических остатках. SPA на Blazor Server.",
      features: ["Приход/расход товаров", "Сканирование штрих-кодов", "Уведомления о критических остатках", "Формирование отчётов"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/stock-manager"
    },
    "PixelRunner": {
      desc: "2D-платформер на Unity с процедурной генерацией уровней. Физика прыжков и столкновений, система достижений, таблица рекордов. Пиксельная графика с плавными анимациями. Сборка под Windows и WebGL.",
      features: ["Процедурная генерация уровней", "Система достижений и рекордов", "Плавная физика прыжков", "Сборка под Windows и WebGL"],
      difficulty: "Middle", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/pixel-runner"
    },
    "ImgProcessor": {
      desc: "REST API сервис пакетной обработки изображений: ресайз, обрезка, наложение водяных знаков, конвертация форматов. Очередь задач для асинхронной обработки. Поддержка JPEG, PNG, WebP через ImageSharp.",
      features: ["Ресайз, обрезка, водяные знаки", "Конвертация форматов", "Асинхронная очередь задач", "REST API с документацией"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/img-processor"
    },
    // ---- Java ----
    "TaskFlow": {
      desc: "Корпоративный менеджер задач с канбан-доской на Spring Boot и Thymeleaf. Создание задач с приоритетами, назначение исполнителей, drag-and-drop по колонкам. Фильтрация, комментарии и уведомления по email.",
      features: ["Канбан-доска с drag-and-drop", "Приоритеты и дедлайны задач", "Назначение исполнителей", "Email-уведомления об изменениях"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/task-flow"
    },
    "LogAnalyzer": {
      desc: "Система анализа логов в реальном времени. Принимает потоки логов через Kafka, выявляет паттерны ошибок, строит статистику и отправляет алерты. Elasticsearch для хранения и полнотекстового поиска по логам.",
      features: ["Потоковая обработка через Kafka", "Выявление паттернов ошибок", "Полнотекстовый поиск (Elasticsearch)", "Алерты при аномалиях"],
      difficulty: "Senior", time: "~1.5 месяца",
      githubUrl: "https://github.com/Cfvbhgc/log-analyzer"
    },
    "NoteKeeper": {
      desc: "Android-приложение для ведения заметок с поддержкой тегов, полнотекстовым поиском и синхронизацией через облако. Тёмная тема, виджет для быстрого создания заметки. Архитектура MVVM с Room для локального хранения.",
      features: ["Теги и категории заметок", "Полнотекстовый поиск", "Облачная синхронизация", "Виджет быстрого создания"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/note-keeper"
    },
    "CurrencyX": {
      desc: "Микросервис конвертации валют с получением курсов от ЦБ. Кэширование актуальных курсов в Redis, историческая база курсов, REST и gRPC интерфейсы. Автоматическое обновление курсов по расписанию.",
      features: ["Курсы ЦБ в реальном времени", "Кэширование в Redis", "REST + gRPC интерфейсы", "Историческая база курсов"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/currency-x"
    },
    "MeetRoom": {
      desc: "Система бронирования переговорных комнат для офиса. Расписание по комнатам, проверка конфликтов, автоматические напоминания участникам. REST API на Spring Boot с аутентификацией через JWT.",
      features: ["Расписание по переговорным", "Проверка конфликтов бронирований", "Напоминания участникам", "JWT-аутентификация"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/meet-room"
    },
    // ---- PHP ----
    "ShopEngine": {
      desc: "Полноценный интернет-магазин на Laravel: каталог с фильтрацией, корзина, оплата через Stripe, личный кабинет покупателя, админ-панель для управления товарами, заказами и пользователями. Blade-шаблоны с адаптивным дизайном.",
      features: ["Каталог с фильтрацией и сортировкой", "Корзина и оплата Stripe", "Личный кабинет покупателя", "Админ-панель управления"],
      difficulty: "Senior", time: "~1.5 месяца",
      githubUrl: "https://github.com/Cfvbhgc/shop-engine"
    },
    "BlogCMS": {
      desc: "CMS для блога с визуальным WYSIWYG-редактором (TinyMCE), категориями, тегами и SEO-настройками для каждой статьи. Система комментариев с модерацией, RSS-лента и XML-карта сайта для поисковых роботов.",
      features: ["WYSIWYG-редактор (TinyMCE)", "SEO-настройки для каждой статьи", "Комментарии с модерацией", "RSS-лента и sitemap.xml"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/blog-cms"
    },
    "HelpDesk": {
      desc: "Система тикетов техподдержки на Laravel + Livewire. Приоритеты тикетов, SLA-таймеры, база знаний с поиском и аналитика производительности агентов. Real-time обновления через Livewire без перезагрузки страницы.",
      features: ["Тикеты с приоритетами и SLA", "База знаний с поиском", "Аналитика производительности", "Real-time через Livewire"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/helpdesk"
    },
    "NewsAggr": {
      desc: "API-агрегатор новостей: парсит RSS-ленты из множества источников, категоризирует через NLP, формирует персональную ленту для каждого пользователя. Slim Framework для лёгкого REST API, кэширование через Redis.",
      features: ["Парсинг RSS-лент", "Автоматическая категоризация", "Персональная лента новостей", "Кэширование через Redis"],
      difficulty: "Middle", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/news-aggr"
    },
    "AdminPro": {
      desc: "Универсальная админ-панель на Laravel + Vue.js с автоматической генерацией CRUD-интерфейсов. Ролевая модель доступа, логирование действий администраторов, аналитический дашборд. REST API для фронтенда на Vue.js.",
      features: ["Автоматическая генерация CRUD", "Ролевая модель доступа", "Логирование действий админов", "Аналитический дашборд"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/admin-pro"
    },
    // ---- Kotlin ----
    "HabitPulse": {
      desc: "Android-трекер привычек на Jetpack Compose. Отслеживание серий выполнения, подробная статистика, настраиваемые напоминания и виджеты на рабочий стол. Material 3 дизайн с анимациями. Room для локального хранения.",
      features: ["Отслеживание серий и streaks", "Детальная статистика прогресса", "Настраиваемые напоминания", "Виджеты на рабочий стол"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/habit-pulse"
    },
    "SplitPay": {
      desc: "Приложение для разделения расходов в группах: добавление трат, автоматический расчёт долгов и балансов. Синхронизация через Firebase, push-уведомления. Минималистичный Material 3 дизайн.",
      features: ["Автоматический расчёт долгов", "Синхронизация через Firebase", "Push-уведомления о долгах", "История всех операций"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/split-pay"
    },
    "WeatherNow": {
      desc: "Погодное приложение с прогнозом на неделю, геолокацией и красивыми анимациями погодных условий. Данные от OpenWeather API. Виджет с текущей температурой на рабочий стол. Compose для декларативного UI.",
      features: ["Прогноз на 7 дней", "Анимации погодных условий", "Геолокация и поиск городов", "Виджет на рабочий стол"],
      difficulty: "Junior", time: "~2 недели",
      githubUrl: "https://github.com/Cfvbhgc/weather-now"
    },
    "FitLog": {
      desc: "Фитнес-дневник для отслеживания тренировок и физического прогресса. Создание программ тренировок, графики прогресса по упражнениям, интеграция с HealthConnect для данных о здоровье. Jetpack Compose + Room.",
      features: ["Программы тренировок", "Графики прогресса по упражнениям", "Интеграция HealthConnect", "Таймер отдыха между подходами"],
      difficulty: "Middle", time: "~3 недели",
      githubUrl: "https://github.com/Cfvbhgc/fit-log"
    },
    "QuickChat": {
      desc: "Мессенджер на Kotlin с поддержкой текстовых сообщений, отправки фото и push-уведомлений. WebSocket для real-time обмена. Firebase для аутентификации и хранения медиа. Material 3 дизайн с тёмной темой.",
      features: ["Real-time сообщения (WebSocket)", "Отправка фото и медиа", "Push-уведомления", "Тёмная тема (Material 3)"],
      difficulty: "Senior", time: "~1 месяц",
      githubUrl: "https://github.com/Cfvbhgc/quick-chat"
    }
  };

  // Image URLs for projects (responsive: mobile gets smaller images)
  const projectImages = {
    // Frontend
    "Цифровой дневник настроений": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "Semiglobe Brasil": "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&h=400&fit=crop",
    "Shemberg": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop",
    "Hero Design Portfolio": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    "InvestCalc": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
    "SalesDash": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    "DevConf Landing": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    // Python
    "MarketAPI": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    "PriceRadar": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
    "AuthMicro": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop",
    "SheetSync": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    "MiniCRM": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    // Node.js
    "LiveChat": "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&h=400&fit=crop",
    "FoodFlow API": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    "SnapLink": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop",
    "NotifyHub": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    "PDFForge": "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=400&fit=crop",
    // Bots
    "ScheduleBot": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop",
    "FreelanceHelper": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    "ShopBot": "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=400&fit=crop",
    "AutoPoster": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop",
    "QuizMaster": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
    "ServerWatch": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
    // C/C++
    "FileNav": "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=400&fit=crop",
    "ChessEngine": "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&h=400&fit=crop",
    "HuffCompress": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
    "ParticleSim": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    "ThreadServ": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop",
    // C#/.NET
    "FinTracker": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    "BookingAPI": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    "StockManager": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop",
    "PixelRunner": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop",
    "ImgProcessor": "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=400&fit=crop",
    // Java
    "TaskFlow": "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    "LogAnalyzer": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
    "NoteKeeper": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
    "CurrencyX": "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&h=400&fit=crop",
    "MeetRoom": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    // PHP
    "ShopEngine": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    "BlogCMS": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop",
    "HelpDesk": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
    "NewsAggr": "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=600&h=400&fit=crop",
    "AdminPro": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    // Kotlin
    "HabitPulse": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
    "SplitPay": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    "WeatherNow": "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop",
    "FitLog": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    "QuickChat": "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&h=400&fit=crop"
  };

  // Responsive image URL helper
  function getImgUrl(url) {
    if (!url) return url;
    return isMobile ? url.replace('w=600', 'w=400').replace('h=400', 'h=300') : url;
  }

  // Apply background images to cards
  document.querySelectorAll('.project-card').forEach(card => {
    const h3 = card.querySelector('h3');
    if (!h3) return;
    const name = h3.textContent.trim();
    const imgUrl = getImgUrl(projectImages[name]);
    if (imgUrl) {
      const imageDiv = card.querySelector('.project-card-image');
      if (imageDiv) {
        const placeholder = imageDiv.querySelector('.gradient-placeholder');
        if (placeholder) placeholder.remove();
        const bg = document.createElement('div');
        bg.className = 'card-bg';
        bg.style.backgroundImage = `url(${imgUrl})`;
        imageDiv.appendChild(bg);
      }
    }
  });

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Закрыть">&times;</button>
      <div class="modal-scroll-content">
        <div class="modal-image"><div class="card-bg"></div></div>
        <h2 class="modal-title"></h2>
        <p class="modal-desc"></p>
        <div class="modal-tags"></div>
        <div class="modal-features">
          <h4>// Ключевые фичи</h4>
          <ul></ul>
        </div>
        <div class="modal-meta"></div>
        <div class="modal-links"></div>
        <button class="modal-close-bottom">Закрыть</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  const modal = modalOverlay.querySelector('.modal');
  const modalClose = modalOverlay.querySelector('.modal-close');
  const modalCloseBottom = modalOverlay.querySelector('.modal-close-bottom');
  const modalScrollContent = modalOverlay.querySelector('.modal-scroll-content');

  function openModal(projectName, cardEl) {
    const data = projectsData[projectName];
    if (!data) return;

    const imgUrl = getImgUrl(projectImages[projectName]) || '';

    modalScrollContent.querySelector('.modal-title').textContent = projectName;
    modalScrollContent.querySelector('.modal-desc').textContent = data.desc;

    const modalBg = modalScrollContent.querySelector('.modal-image .card-bg');
    modalBg.style.backgroundImage = imgUrl ? `url(${imgUrl})` : 'linear-gradient(135deg, #7c3aed, #2563eb)';

    const tagsContainer = modalScrollContent.querySelector('.modal-tags');
    const tags = cardEl.querySelectorAll('.project-tag');
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
      const t = document.createElement('span');
      t.className = 'project-tag';
      t.textContent = tag.textContent;
      tagsContainer.appendChild(t);
    });

    const featuresList = modalScrollContent.querySelector('.modal-features ul');
    featuresList.innerHTML = '';
    data.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      featuresList.appendChild(li);
    });

    const metaContainer = modalScrollContent.querySelector('.modal-meta');
    const diffClass = data.difficulty === 'Junior' ? 'junior' : data.difficulty === 'Middle' ? 'middle' : 'senior';
    const dots = [1, 2, 3].map((n) => {
      const active = (data.difficulty === 'Junior' && n <= 1) ||
                     (data.difficulty === 'Middle' && n <= 2) ||
                     (data.difficulty === 'Senior' && n <= 3);
      return `<span class="dot ${active ? 'active ' + diffClass : ''}"></span>`;
    }).join('');

    metaContainer.innerHTML = `
      <div class="modal-meta-item">
        <span class="modal-meta-label">Сложность</span>
        <div class="difficulty-dots">${dots}</div>
        <span class="difficulty-label">${data.difficulty}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-label">Время разработки</span>
        <span class="modal-time">${data.time}</span>
      </div>
    `;

    // Ссылки на сайт и GitHub
    const linksContainer = modalScrollContent.querySelector('.modal-links');
    linksContainer.innerHTML = '';
    if (data.siteUrl || data.githubUrl) {
      if (data.siteUrl) {
        linksContainer.innerHTML += `<a href="${data.siteUrl}" target="_blank" rel="noopener noreferrer" class="modal-link-primary">Открыть сайт →</a>`;
      }
      if (data.githubUrl) {
        linksContainer.innerHTML += `<a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="modal-link-ghost">GitHub</a>`;
      }
    }

    modalOverlay.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    // Reset scroll position for next open
    modal.scrollTop = 0;
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const name = card.querySelector('h3')?.textContent.trim();
      if (name) openModal(name, card);
    });
  });

  // Close modal — both click and touchstart for mobile
  function addCloseHandler(el, handler) {
    el.addEventListener('click', handler);
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handler(e);
    }, { passive: false });
  }

  addCloseHandler(modalClose, closeModal);
  addCloseHandler(modalCloseBottom, closeModal);

  // Backdrop close — click/touch on overlay (not on modal content)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalOverlay.addEventListener('touchstart', (e) => {
    if (e.target === modalOverlay) {
      e.preventDefault();
      closeModal();
    }
  }, { passive: false });

  // Prevent modal content touch from closing
  modal.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });

  // Esc for desktop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ==========================================================
     PAGE TRANSITIONS (all devices)
  ========================================================== */
  const pageTransition = document.querySelector('.page-transition');
  if (pageTransition) {
    window.addEventListener('load', () => {
      pageTransition.classList.remove('active');
    });

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        link.addEventListener('click', e => {
          e.preventDefault();
          pageTransition.classList.add('active');
          setTimeout(() => { window.location.href = href; }, 300);
        });
      }
    });
  }

  /* ==========================================================
     SMOOTH SCROLL (all devices)
  ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
