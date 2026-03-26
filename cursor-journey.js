// cursor-journey.js — Cursor Journey background effect for hero section
// A blinking cursor traces a path upward through the curriculum levels.
// Pure vanilla canvas, zero dependencies. Progressive enhancement.

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroSection = document.getElementById('hero');
  if (!heroSection) return;

  var IS_MOBILE = window.innerWidth < 768;
  var PARTICLE_COUNT = IS_MOBILE ? 60 : 150;
  var FONT = 'Monaco, Menlo, "JetBrains Mono", monospace';

  // Inline simplex noise (2D only, minimal implementation)
  var SimplexNoise = (function () {
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;
    var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];

    function SN(seed) {
      var p = new Uint8Array(256);
      var s = seed || Math.random() * 65536;
      for (var i = 0; i < 256; i++) {
        s = (s * 16807 + 0) % 2147483647;
        p[i] = s % 256;
      }
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      for (var j = 0; j < 512; j++) {
        this.perm[j] = p[j & 255];
        this.permMod12[j] = this.perm[j] % 12;
      }
    }

    SN.prototype.noise2D = function (xin, yin) {
      var s = (xin + yin) * F2;
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t, Y0 = j - t;
      var x0 = xin - X0, y0 = yin - Y0;
      var i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
      var x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      var ii = i & 255, jj = j & 255;
      var n0 = 0, n1 = 0, n2 = 0;
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) { t0 *= t0; var gi0 = this.permMod12[ii + this.perm[jj]]; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0); }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) { t1 *= t1; var gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]]; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1); }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) { t2 *= t2; var gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]]; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2); }
      return 70 * (n0 + n1 + n2);
    };

    return SN;
  })();

  var LEVELS = [
    { emoji: '\u{1F4BB}', name: 'Computers Are Not Magic' },
    { emoji: '\u{1F4DF}', name: 'Your First 30 Minutes' },
    { emoji: '\u{1F4D6}', name: 'Reading & Writing Files' },
    { emoji: '\u{1F500}', name: 'Your Code Has a History' },
    { emoji: '\u2601\uFE0F', name: 'How Software Works' },
    { emoji: '\u{1F4E1}', name: 'Talk to the Internet' },
    { emoji: '\u{1F528}', name: 'Building With Real Tools' },
    { emoji: '\u{1F916}', name: 'Claude Code' },
    { emoji: '\u2699\uFE0F', name: 'Claude Skills' },
    { emoji: '\u{1F50C}', name: 'MCP — Connect Everything' },
    { emoji: '\u{1F4CB}', name: 'Context Is Everything' },
    { emoji: '\u26A1', name: 'Claude Code Advanced' },
    { emoji: '\u{1F680}', name: 'Junior Developer Patterns' },
    { emoji: '\u{1F3AE}', name: 'The Project' }
  ];

  function getTheme() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      isLight: isLight,
      bg: isLight ? 'rgba(250, 250, 248, 1)' : 'rgba(9, 9, 11, 1)',
      text: isLight ? 'rgba(30, 30, 40,' : 'rgba(255, 255, 255,',
      particle: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)',
      pillBg: isLight ? 'rgba(250, 250, 248, 0.75)' : 'rgba(9, 9, 11, 0.65)',
      canvasOpacity: isLight ? 0.35 : 0.5
    };
  }

  function lerpColor(a, b, t) {
    var ah = parseInt(a.replace('#', ''), 16);
    var ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    var bh = parseInt(b.replace('#', ''), 16);
    var br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    var rr = Math.round(ar + t * (br - ar));
    var rg = Math.round(ag + t * (bg - ag));
    var rb = Math.round(ab + t * (bb - ab));
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
  }

  function trailColor(y, h) {
    var t = 1 - (y / h);
    if (t < 0.5) return lerpColor('#22C55E', '#3B82F6', t * 2);
    return lerpColor('#3B82F6', '#FF6B35', (t - 0.5) * 2);
  }

  // Create canvas
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  heroSection.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var width = 0, height = 0;
  var mouse = { x: -9999, y: -9999 };
  var simplex = new SimplexNoise();
  var particles = [];
  var animId = null;
  var paused = false;

  // Journey state
  var journey = {
    points: [],
    head: { x: 0, y: 0 },
    milestones: [],
    levelIndex: 0,
    finished: false,
    time: 0
  };

  function resetJourney() {
    journey.points = [];
    journey.head = { x: width * 0.2 + Math.random() * 50, y: height * 0.95 };
    journey.points.push({ x: journey.head.x, y: journey.head.y });
    journey.milestones = [];
    journey.levelIndex = 0;
    journey.finished = false;
    journey.time = 0;
  }

  function Particle() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2;
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function resize() {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (particles.length === 0) initParticles();
    if (journey.points.length === 0) resetJourney();
  }

  function draw() {
    if (paused) { animId = null; return; }

    var theme = getTheme();
    canvas.style.opacity = String(theme.canvasOpacity);

    // Clear
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Particles
    ctx.fillStyle = theme.particle;
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.x < 0 || pt.x > width || pt.y < 0 || pt.y > height) {
        pt.x = Math.random() * width;
        pt.y = Math.random() * height;
      }
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update journey
    if (!journey.finished) {
      journey.time += 0.016;
      var speed = IS_MOBILE ? 1.5 : 2;
      var noiseScale = 0.005;

      var noiseVal = simplex.noise2D(journey.head.x * noiseScale, journey.head.y * noiseScale);
      var angle = (noiseVal * 0.5 - 0.5) * Math.PI;

      var vx = Math.cos(angle) * speed;
      var vy = Math.sin(angle) * speed;

      // Center pull
      var centerX = width / 2;
      var distFromCenter = (journey.head.x - centerX) / (width / 2);
      vx -= distFromCenter * speed * 0.5;

      // Mouse warp (desktop only)
      if (!IS_MOBILE) {
        var dx = mouse.x - journey.head.x;
        var dy = mouse.y - journey.head.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          var force = (1 - dist / 200) * 6;
          vx += (dx / dist) * force;
          vy += (dy / dist) * force;
        }
      }

      journey.head.x += vx;
      journey.head.y += vy;

      // Bounds
      if (journey.head.x < 10) journey.head.x = 10;
      if (journey.head.x > width - 10) journey.head.x = width - 10;

      journey.points.push({ x: journey.head.x, y: journey.head.y });

      // Milestones
      var progress = 1 - (journey.head.y / height);
      var targetLevel = Math.floor(progress * LEVELS.length);
      if (targetLevel > journey.levelIndex && journey.levelIndex < LEVELS.length) {
        journey.milestones.push({
          emoji: LEVELS[journey.levelIndex].emoji,
          name: LEVELS[journey.levelIndex].name,
          num: journey.levelIndex + 1,
          x: journey.head.x,
          y: journey.head.y,
          opacity: 0
        });
        journey.levelIndex++;
      }

      if (journey.head.y < 20) {
        journey.finished = true;
        // Restart after a pause
        setTimeout(function () { resetJourney(); }, 3000);
      }
    }

    // Draw trail
    if (journey.points.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = IS_MOBILE ? 2 : 3;

      var grad = ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, '#22C55E');
      grad.addColorStop(0.5, '#3B82F6');
      grad.addColorStop(1, '#FF6B35');
      ctx.strokeStyle = grad;

      ctx.shadowBlur = 12;
      ctx.shadowColor = trailColor(journey.head.y, height);

      ctx.beginPath();
      ctx.moveTo(journey.points[0].x, journey.points[0].y);
      for (var j = 1; j < journey.points.length; j++) {
        ctx.lineTo(journey.points[j].x, journey.points[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw milestones
    ctx.shadowBlur = 0;
    var fontSize = IS_MOBILE ? 11 : 13;
    ctx.font = fontSize + 'px ' + FONT;
    ctx.textAlign = 'left';

    for (var m = 0; m < journey.milestones.length; m++) {
      var ms = journey.milestones[m];
      if (ms.opacity < 1) ms.opacity += 0.02;

      var label = ms.emoji + ' Level ' + ms.num + ': ' + ms.name;
      var tw = ctx.measureText(label).width;

      // Flip label to left side if too close to right edge
      var labelX = ms.x + 12;
      if (labelX + tw + 10 > width) {
        ctx.textAlign = 'right';
        labelX = ms.x - 12;
      }

      // Background pill
      ctx.fillStyle = theme.pillBg;
      var pillX = ctx.textAlign === 'right' ? labelX - tw - 8 : labelX - 4;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(pillX, ms.y - 10, tw + 12, fontSize + 8, 4);
        ctx.fill();
      } else {
        ctx.fillRect(pillX, ms.y - 10, tw + 12, fontSize + 8);
      }

      // Text
      ctx.fillStyle = theme.text + ms.opacity + ')';
      ctx.fillText(label, labelX, ms.y + 4);
      ctx.textAlign = 'left';
    }

    // Draw blinking cursor at head
    var blink = Math.floor(Date.now() / 250) % 2 === 0;
    if (blink || journey.finished) {
      var cursorColor = trailColor(journey.head.y, height);
      ctx.fillStyle = cursorColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = cursorColor;
      ctx.font = 'bold 20px ' + FONT;
      ctx.fillText('_', journey.head.x - 5, journey.head.y + 5);
      ctx.shadowBlur = 0;
    }

    animId = requestAnimationFrame(draw);
  }

  // Mouse tracking on hero (works with pointer-events: none on canvas)
  heroSection.addEventListener('mousemove', function (e) {
    var rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  heroSection.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Pause off-screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          paused = false;
          if (!animId) animId = requestAnimationFrame(draw);
        } else {
          paused = true;
        }
      });
    }, { threshold: 0.05 }).observe(heroSection);
  }

  // Resize
  window.addEventListener('resize', function () { resize(); });
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { resize(); }).observe(heroSection);
  }

  // Init
  resize();
  animId = requestAnimationFrame(draw);
})();
