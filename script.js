// From Zero to Claude Code — Landing Page Scripts
// No dependencies. Vanilla JS.

(function () {
  'use strict';

  // ---- Theme Toggle ----
  var THEME_KEY = 'landing-theme';
  var themeToggles = document.querySelectorAll('.theme-toggle');

  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(getPreferredTheme());

  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  });

  // ---- Hamburger Menu ----
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');
  const mobileLinks = mobileNav.querySelectorAll('a');

  function openMenu() {
    mobileNav.classList.add('open');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileClose.focus();
  }

  function closeMenu() {
    mobileNav.classList.remove('open');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }

  hamburger.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', closeMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });

  // ---- Scroll-Triggered Animations ----
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    // Fallback: show everything
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ---- Active Nav Link Highlighting ----
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === '#' + id
              );
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  // ---- i18n Translation Engine ----
  var LANG_KEY = 'landing-lang';
  var AVAILABLE_LANGS = ['en', 'es', 'uk', 'he', 'ar', 'ja', 'de', 'pt', 'tr'];
  var RTL_LANGS = ['he', 'ar'];

  function getSavedLang() {
    // Priority: URL param > localStorage > navigator.language > 'en'
    var urlParams = new URLSearchParams(window.location.search);
    var urlLang = urlParams.get('lang');
    if (urlLang && AVAILABLE_LANGS.indexOf(urlLang) !== -1) {
      return urlLang;
    }

    var storedLang = localStorage.getItem(LANG_KEY);
    if (storedLang && AVAILABLE_LANGS.indexOf(storedLang) !== -1) {
      return storedLang;
    }

    var browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
    if (AVAILABLE_LANGS.indexOf(browserLang) !== -1) {
      return browserLang;
    }

    return 'en';
  }

  function applyTranslations(lang) {
    if (!window.I18N || !window.I18N[lang]) return;

    var translations = window.I18N[lang];

    // Set document lang and direction
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.indexOf(lang) !== -1 ? 'rtl' : 'ltr';

    // Translate [data-i18n] elements (textContent)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key] !== undefined) {
        el.textContent = translations[key];
      }
    });

    // Translate [data-i18n-html] elements (innerHTML for <br> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (translations[key] !== undefined) {
        el.innerHTML = translations[key];
      }
    });

    // Translate [data-i18n-aria] elements (aria-label)
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (translations[key] !== undefined) {
        el.setAttribute('aria-label', translations[key]);
      }
    });

    // Update document title
    if (translations['meta.title']) {
      document.title = translations['meta.title'];
    }

    // Update meta tags
    var metaMappings = [
      { selector: 'meta[name="description"]', key: 'meta.description' },
      { selector: 'meta[property="og:title"]', key: 'meta.og.title' },
      { selector: 'meta[property="og:description"]', key: 'meta.og.description' },
      { selector: 'meta[property="og:image:alt"]', key: 'meta.og.imageAlt' },
      { selector: 'meta[name="twitter:title"]', key: 'meta.twitter.title' },
      { selector: 'meta[name="twitter:description"]', key: 'meta.twitter.description' }
    ];

    metaMappings.forEach(function (mapping) {
      var metaEl = document.querySelector(mapping.selector);
      if (metaEl && translations[mapping.key]) {
        metaEl.setAttribute('content', translations[mapping.key]);
      }
    });

    // Save preference
    localStorage.setItem(LANG_KEY, lang);

    // Remove loading class
    document.body.classList.remove('i18n-loading');

    // Update language switcher UI
    updateLangSwitcherUI(lang);
  }

  function updateLangSwitcherUI(lang) {
    // Update desktop switcher
    var langCode = document.querySelector('.lang-code');
    if (langCode) {
      langCode.textContent = lang.toUpperCase();
    }

    // Update desktop dropdown options
    document.querySelectorAll('.lang-options [data-lang]').forEach(function (option) {
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });

    // Update mobile language buttons
    document.querySelectorAll('.mobile-lang-btn').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ---- Language Switcher Event Handlers ----
  var langSwitcher = document.querySelector('.lang-switcher');
  var langCurrentBtn = document.querySelector('.lang-current');

  if (langSwitcher && langCurrentBtn) {
    // Toggle dropdown on button click
    langCurrentBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      langSwitcher.classList.toggle('open');
    });

    // Desktop dropdown option clicks
    document.querySelectorAll('.lang-options [data-lang]').forEach(function (option) {
      option.addEventListener('click', function () {
        var selectedLang = option.getAttribute('data-lang');
        applyTranslations(selectedLang);
        langSwitcher.classList.remove('open');
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (!langSwitcher.contains(e.target)) {
        langSwitcher.classList.remove('open');
      }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && langSwitcher.classList.contains('open')) {
        langSwitcher.classList.remove('open');
        langCurrentBtn.focus();
      }
    });
  }

  // Mobile language button clicks
  document.querySelectorAll('.mobile-lang-btn[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var selectedLang = btn.getAttribute('data-lang');
      applyTranslations(selectedLang);
    });
  });

  // ---- Initialize i18n ----
  if (window.I18N) {
    applyTranslations(getSavedLang());
  }
})();
