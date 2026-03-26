// command-constellation.js — Interactive constellation of terminal commands for hero section
// Pure canvas 2D, no dependencies. Progressive enhancement.

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroSection = document.getElementById('hero');
  if (!heroSection) return;

  var IS_MOBILE = window.innerWidth < 768;
  var PARTICLE_COUNT = IS_MOBILE ? 35 : 70;
  var CONNECTION_DIST = IS_MOBILE ? 100 : 150;
  var FONT = 'Monaco, Menlo, "JetBrains Mono", monospace';

  var COMMANDS = [
    // Level 1: Computers Are Not Magic
    { text: 'ls', level: 1 },
    { text: 'cd', level: 1 },
    { text: 'pwd', level: 1 },
    { text: 'mkdir', level: 1 },
    // Level 2: Your First 30 Minutes
    { text: 'touch', level: 2 },
    { text: 'cat', level: 2 },
    { text: 'cp', level: 2 },
    { text: 'mv', level: 2 },
    { text: 'rm', level: 2 },
    // Level 3-4: Reading & Writing / Git
    { text: 'grep', level: 3 },
    { text: 'head', level: 3 },
    { text: 'pipe |', level: 3 },
    { text: 'git init', level: 4 },
    { text: 'git add', level: 4 },
    { text: 'git commit', level: 4 },
    { text: 'git push', level: 4 },
    // Level 5-6: Software / Internet
    { text: 'curl', level: 5 },
    { text: 'npm install', level: 5 },
    { text: 'node', level: 6 },
    { text: 'npm start', level: 6 },
    // Level 7: Building With Tools
    { text: 'npm run', level: 7 },
    { text: 'express', level: 7 },
    // Level 8-10: Claude Code / Skills / MCP
    { text: 'claude', level: 8 },
    { text: 'claude fix', level: 8 },
    { text: 'SKILL.md', level: 9 },
    { text: '/skill', level: 9 },
    { text: 'MCP', level: 10 },
    // Level 11-14: Advanced
    { text: 'CLAUDE.md', level: 11 },
    { text: 'subagent', level: 12 },
    { text: 'deploy', level: 13 },
    { text: 'ship it', level: 14 }
  ];

  // Theme-aware colors
  function getTheme() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      isLight: isLight,
      bg: isLight ? 'rgba(250, 250, 248, 1)' : 'rgba(9, 9, 11, 1)',
      text: isLight ? 'rgba(60, 60, 70,' : 'rgba(255, 255, 255,',
      line: isLight ? '200, 80, 20' : '255, 107, 53',
      claude: isLight ? 'rgba(210, 70, 10,' : 'rgba(255, 107, 53,',
      canvasOpacity: isLight ? 0.3 : 0.5
    };
  }

  // Create canvas
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  heroSection.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var width = 0;
  var height = 0;
  var mouse = { x: -9999, y: -9999 };
  var particles = [];
  var animId = null;
  var paused = false;

  function Particle() {
    var data = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
    this.text = data.text;
    this.level = data.level;
    this.isClaude = data.level >= 8;
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.opacity = 0.3 + Math.random() * 0.5;
    this.size = IS_MOBILE ? 10 : 12;
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
  }

  function draw() {
    if (paused) { animId = null; return; }

    var theme = getTheme();
    canvas.style.opacity = String(theme.canvasOpacity);

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Update particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx * 0.5;
      p.y += p.vy * 0.5;

      // Gravity: level 1 drifts to bottom, level 14 to top
      var targetY = height * (0.9 - (p.level - 1) / 13 * 0.75);
      p.y += (targetY - p.y) * 0.003;

      // Wrap
      if (p.x < -80) p.x = width + 80;
      if (p.x > width + 80) p.x = -80;
      if (p.y < -40) p.y = height + 40;
      if (p.y > height + 40) p.y = -40;
    }

    // Draw constellation lines (near mouse)
    if (!IS_MOBILE) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var a = 0; a < particles.length; a++) {
        var p1 = particles[a];
        var dMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);

        if (dMouse < CONNECTION_DIST) {
          for (var b = a + 1; b < particles.length; b++) {
            var p2 = particles[b];
            var dPart = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (dPart < CONNECTION_DIST * 0.8) {
              var alpha = (1 - dPart / (CONNECTION_DIST * 0.8)) * (1 - dMouse / CONNECTION_DIST);
              ctx.strokeStyle = 'rgba(' + theme.line + ',' + (alpha * 0.8) + ')';
              ctx.shadowBlur = 6;
              ctx.shadowColor = 'rgba(' + theme.line + ',0.4)';
              ctx.lineWidth = alpha * 1.5;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      ctx.restore();
    }

    // Draw particles (text)
    for (var k = 0; k < particles.length; k++) {
      var pt = particles[k];
      ctx.font = pt.size + 'px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (pt.isClaude) {
        ctx.fillStyle = theme.claude + pt.opacity + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = theme.claude + '0.4)';
      } else {
        ctx.fillStyle = theme.text + pt.opacity + ')';
        ctx.shadowBlur = 0;
      }

      ctx.fillText(pt.text, pt.x, pt.y);
      ctx.shadowBlur = 0;
    }

    animId = requestAnimationFrame(draw);
  }

  // Track mouse relative to hero section
  function onMouseMove(e) {
    var rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  heroSection.addEventListener('mousemove', onMouseMove);
  heroSection.addEventListener('mouseleave', onMouseLeave);

  // Pause when hero is not visible
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

  // Resize handling
  window.addEventListener('resize', function () {
    resize();
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      resize();
    }).observe(heroSection);
  }

  // Init
  resize();
  animId = requestAnimationFrame(draw);
})();
