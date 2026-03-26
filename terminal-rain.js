// terminal-rain.js — Terminal Rain background effect for hero section
// Requires p5.js loaded before this script (progressive enhancement)

(function () {
  'use strict';

  function init() {
    if (typeof p5 === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var heroSection = document.getElementById('hero');
    if (!heroSection) return;

    var IS_MOBILE = window.innerWidth < 768;
    var MAX_COMMANDS = IS_MOBILE ? 25 : 50;
    var TARGET_FPS = IS_MOBILE ? 24 : 30;

    var COMMANDS = [
      { text: 'cd ~/projects', type: 'terminal' },
      { text: 'ls -la', type: 'terminal' },
      { text: 'git commit', type: 'terminal' },
      { text: 'git push', type: 'terminal' },
      { text: 'echo $PATH', type: 'terminal' },
      { text: 'mkdir src', type: 'terminal' },
      { text: 'cat README.md', type: 'terminal' },
      { text: 'npm install', type: 'terminal' },
      { text: 'node server.js', type: 'terminal' },
      { text: 'curl api.dev', type: 'terminal' },
      { text: 'grep -r "TODO"', type: 'terminal' },
      { text: 'ssh deploy@prod', type: 'terminal' },
      { text: 'python3 app.py', type: 'terminal' },
      { text: 'chmod +x run.sh', type: 'terminal' },
      { text: 'claude "build it"', type: 'claude' },
      { text: 'claude "fix bug"', type: 'claude' },
      { text: 'claude "add tests"', type: 'claude' },
      { text: 'claude "explain"', type: 'claude' },
      { text: 'whoami', type: 'other' },
      { text: 'pwd', type: 'other' },
      { text: 'clear', type: 'other' },
      { text: 'exit', type: 'other' }
    ];

    function getThemeColors() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      return {
        isLight: isLight,
        trailBg: isLight ? [250, 250, 248, 50] : [9, 9, 11, 40],
        claude: isLight ? [210, 70, 10] : [255, 107, 53],
        terminal: isLight ? [18, 140, 50] : [34, 197, 94],
        other: isLight ? [140, 140, 155] : [100, 100, 120],
        canvasOpacity: isLight ? 0.35 : 0.55
      };
    }

    // p5 instance mode sketch
    new p5(function (p) {
      var commands = [];
      var colors;

      function Command(x, y) {
        var cmd = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
        this.text = cmd.text;
        this.type = cmd.type;
        this.x = x;
        this.y = y;
        this.speed = p.random(0.8, 2.5);
        this.alpha = p.random(80, 200);
        this.size = p.random(10, 14);
        this.noiseOffset = p.random(1000);
      }

      function spawnCommand(randomY) {
        var x = p.random(p.width);
        var y = randomY ? p.random(-p.height, p.height) : p.random(-100, -20);
        commands.push(new Command(x, y));
      }

      p.setup = function () {
        var canvas = p.createCanvas(heroSection.offsetWidth, heroSection.offsetHeight);
        canvas.parent(heroSection);
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '0');
        canvas.style('pointer-events', 'none');
        p.frameRate(TARGET_FPS);

        colors = getThemeColors();
        canvas.style('opacity', String(colors.canvasOpacity));

        // Solid first frame to avoid transparency flash
        if (colors.isLight) {
          p.background(250, 250, 248);
        } else {
          p.background(9, 9, 11);
        }

        for (var i = 0; i < MAX_COMMANDS; i++) {
          spawnCommand(true);
        }
      };

      p.draw = function () {
        colors = getThemeColors();
        p.canvas.style.opacity = String(colors.canvasOpacity);

        // Trail effect
        p.background(colors.trailBg[0], colors.trailBg[1], colors.trailBg[2], colors.trailBg[3]);

        // Global wind via Perlin noise
        var wind = p.map(p.noise(p.frameCount * 0.005), 0, 1, -0.5, 0.5);

        for (var i = commands.length - 1; i >= 0; i--) {
          var c = commands[i];

          // Movement
          c.y += c.speed;
          c.x += wind + p.map(p.noise(c.noiseOffset + p.frameCount * 0.01), 0, 1, -0.3, 0.3);

          // Mouse repulsion (desktop only)
          if (!IS_MOBILE) {
            var d = p.dist(c.x, c.y, p.mouseX, p.mouseY);
            if (d < 80) {
              var angle = p.atan2(c.y - p.mouseY, c.x - p.mouseX);
              var force = p.map(d, 0, 80, 3, 0);
              c.x += p.cos(angle) * force;
              c.y += p.sin(angle) * force;
            }
          }

          // Color by type
          var col;
          if (c.type === 'claude') col = colors.claude;
          else if (c.type === 'terminal') col = colors.terminal;
          else col = colors.other;

          // Glow for claude commands
          if (c.type === 'claude') {
            p.drawingContext.shadowBlur = 12;
            p.drawingContext.shadowColor = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.5)';
          } else {
            p.drawingContext.shadowBlur = 0;
          }

          p.fill(col[0], col[1], col[2], c.alpha);
          p.noStroke();
          p.textSize(c.size);
          p.textFont('Monaco, Menlo, monospace');
          p.text(c.text, c.x, c.y);
          p.drawingContext.shadowBlur = 0;

          // Respawn if off-screen
          if (c.y > p.height + 30) {
            commands.splice(i, 1);
            spawnCommand(false);
          }
          if (c.x < -120) c.x = p.width + 50;
          if (c.x > p.width + 120) c.x = -50;
        }
      };

      p.windowResized = function () {
        p.resizeCanvas(heroSection.offsetWidth, heroSection.offsetHeight);
      };

      // Pause when hero is not visible (save CPU)
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              p.loop();
            } else {
              p.noLoop();
            }
          });
        }, { threshold: 0.05 }).observe(heroSection);
      }

      // Also handle ResizeObserver for layout changes (e.g., i18n text length)
      if ('ResizeObserver' in window) {
        new ResizeObserver(function () {
          p.resizeCanvas(heroSection.offsetWidth, heroSection.offsetHeight);
        }).observe(heroSection);
      }
    });
  }

  // Ensure p5 (deferred) and DOM are both ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
