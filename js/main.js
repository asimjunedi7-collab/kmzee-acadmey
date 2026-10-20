/*
 * KMZee IAMAcademy â€” interactive layer
 * Dependencies: spring.js (KM object)
 */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var skillsData = [
    'Business Analysis', 'Excel', 'Tableau', 'Power BI', 'Python', 'SQL',
    'Digital Marketing', 'SEO', 'ReactJS', 'Web Design', 'Figma', 'Graphic Design',
    'Linux', 'Networking', 'Customer Service', 'Communication'
  ];

  function renderSkills(container) {
    container.innerHTML = '';
    skillsData.forEach(function (name, i) {
      var b = document.createElement('button');
      b.className = 'skill';
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-skill', name);
      b.setAttribute('data-index', i);
      b.textContent = name;
      b.style.transitionDelay = (0.03 * i) + 's';
      container.appendChild(b);
    });
  }

  function selectedSkills() {
    var out = [];
    $$('.skill[aria-pressed="true"]').forEach(function (s) { out.push(s.dataset.skill); });
    return out;
  }

  // â”€â”€ Skills / Path builder â”€â”€
  $$('.skills[data-skills]').forEach(function (root) {
    renderSkills(root);
    root.addEventListener('click', function (e) {
      var b = e.target.closest('.skill');
      if (!b) return;
      var pressed = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    });
  });

  var pathMap = {
    'Business Analysis': ['Requirements gathering', 'Stakeholder interviews', 'Process mapping'],
    'Excel': ['Formulas & functions', 'Pivot tables', 'Dashboards'],
    'Tableau': ['Data visualization', 'Dashboard design', 'Data blending'],
    'Power BI': ['Report building', 'DAX basics', 'Data modeling'],
    'Python': ['Syntax & data types', 'Automation scripts', 'Working with APIs'],
    'SQL': ['Queries & joins', 'Aggregations', 'Database design'],
    'Digital Marketing': ['Campaign strategy', 'Analytics', 'Content planning'],
    'SEO': ['Keyword research', 'On-page optimization', 'Link building'],
    'ReactJS': ['Components & props', 'State management', 'Hooks'],
    'Web Design': ['Layout principles', 'Typography', 'Color theory'],
    'Figma': ['Prototyping', 'Components & auto-layout', 'Design systems'],
    'Graphic Design': ['Composition', 'Branding basics', 'Mockups'],
    'Linux': ['Filesystem & navigation', 'Permissions', 'Bash scripting'],
    'Networking': ['IP addressing', 'DNS & HTTP', 'Network troubleshooting'],
    'Customer Service': ['Communication skills', 'Conflict resolution', 'CRM tools'],
    'Communication': ['Public speaking', 'Email etiquette', 'Presentations']
  };

  var routeEl = document.querySelector('section#path [data-route]');
  if (routeEl) {
    routeEl.addEventListener('click', function (e) {
      var step = e.target.closest('[data-step]');
      if (!step) return;
      $$('.step').forEach(function (s) { s.classList.remove('is-on'); });
      step.classList.add('is-on');
      var n = step.dataset.step;
      var fill = n / 3;
      var line = routeEl.querySelector('[data-route-fill]');
      if (line) line.style.setProperty('--fill', fill);
      var tags = step.querySelector('[data-path-tags]');
      if (tags && n === '2') {
        tags.innerHTML = '';
        var skill = selectedSkills()[0];
        var list = skill ? pathMap[skill] : ['Pick a skill above'];
        list.forEach(function (item, i) {
          var t = document.createElement('span');
          t.className = 'tag';
          t.textContent = item;
          t.style.transitionDelay = (0.04 * i) + 's';
          tags.appendChild(t);
        });
      }
    });
    // click anywhere on route to advance; reset on path change
    routeEl.addEventListener('mouseleave', function () {
      $$('.step').forEach(function (s) { s.classList.remove('is-on'); });
      var first = routeEl.querySelector('.step'); if(first) first.classList.add('is-on');
    });
  }

  // ── Sync skill buttons across both lists + auto-advance route to Step 2 ──
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.skill[data-skill]');
    if (!btn) return;
    var skillName = btn.dataset.skill;
    var newState = btn.getAttribute('aria-pressed');
    // Sync all buttons with the same skill name
    $$('.skill[data-skill="' + skillName + '"]').forEach(function (s) {
      s.setAttribute('aria-pressed', newState);
    });
    // Auto-advance the route to Step 2 when any skill is selected
    if (routeEl && newState === 'true') {
      $$('.step').forEach(function (s) { s.classList.remove('is-on'); });
      var step2 = routeEl.querySelector('[data-step="2"]');
      if (step2) {
        step2.classList.add('is-on');
        var line = routeEl.querySelector('[data-route-fill]');
        if (line) line.style.setProperty('--fill', '0.67');
        var tags = step2.querySelector('[data-path-tags]');
        if (tags) {
          tags.innerHTML = '';
          var skill = selectedSkills()[0];
          var list = skill ? pathMap[skill] : [];
          list.forEach(function (item, i) {
            var t = document.createElement('span');
            t.className = 'tag';
            t.textContent = item;
            t.style.animationDelay = (0.06 * i) + 's';
            tags.appendChild(t);
          });
        }
      }
    }
  }, true);

  // â”€â”€ Navigation (scroll spy, mobile menu, pressed state) â”€â”€
  var nav = $('header[data-nav]');
  var menu = $('#menu');
  var links = $$('.nav__links a');
  var pill = $('.nav__pill');
  var toggle = $('.nav__toggle');

  function updateNav() {
    var y = window.scrollY;
    if (nav) {
      if (y > 10) nav.setAttribute('data-scrolled', '');
      else nav.removeAttribute('data-scrolled');
    }
    var now = '';
    $$('.sec').forEach(function (s) {
      var rect = s.getBoundingClientRect();
      if (rect.top <= 160 && rect.bottom >= 160) now = '#' + s.id;
    });
    links.forEach(function (a) {
      a.removeAttribute('aria-current');
      if (a.getAttribute('href') === now) a.setAttribute('aria-current', 'true');
    });
    if (pill) pill.classList.toggle('is-on', !!now);
  }

  if (nav) window.addEventListener('scroll', function () { updateNav(); }, { passive: true });
  updateNav();

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', !open);
      toggle.setAttribute('aria-expanded', String(!open));
      menu.style.display = open ? 'none' : '';
      setTimeout(function () { menu.style.display = open ? '' : 'grid'; }, 0);
    });
    $$('.menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.removeAttribute('data-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // â”€â”€ Reveal on scroll â”€â”€
  function reveal(entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        if (e.target.classList.contains('stat')) e.target.classList.add('stats-visible');
      }
    });
  }
  var rh = new IntersectionObserver(reveal, { rootMargin: '0px 0px -10% 0px' });
  $$('.is-ready [data-reveal], [data-reveal]').forEach(function (el) { rh.observe(el); });

  // ready state + display word animation
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.add('is-ready');
    document.documentElement.style.scrollBehavior = 'auto';
  });

  // â”€â”€ Number counters â”€â”€
  var counted = new Set();
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var target = e.target;
      if (counted.has(target.id)) return;
      counted.add(target.id);
      var el = target.querySelector('.stat__n');
      if (!el) return;
      var end = parseFloat(el.dataset.count);
      var dur = 1600;
      var start = performance.now();
      var origin = 0;
      function frame(t) {
        var p = Math.min((t - start) / dur, 1);
        var v = origin + (end - origin) * (1 - Math.pow(1 - p, 3));
        el.textContent = end % 1 === 0 ? Math.round(v) : v.toFixed(1);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = end % 1 === 0 ? end : end.toFixed(1);
      }
      requestAnimationFrame(frame);
    });
  });

  // â”€â”€ Statement word scrub â”€â”€
  var scrub = $('.statement[data-scrub]');
  if (scrub) {
    var text = scrub.textContent;
    scrub.textContent = '';
    var words = text.split(' ');
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'sw';
      span.textContent = w + ' ';
      span.style.setProperty('--o', String(0.16 + (i % 4 === 0 ? 0.84 : 0)));
      var em = w.indexOf('\u200e') === -1 && (i === words.length - 1);
      if (i === words.length - 2) {
        var emTag = document.createElement('em');
        emTag.style.fontStyle = 'normal';
        emTag.appendChild(span);
        scrub.appendChild(emTag);
      } else {
        scrub.appendChild(span);
      }
    });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        $$('.sw', e.target).forEach(function (s) {
          s.style.opacity = e.isIntersecting ? '1' : '0.16';
        });
      });
    }, { threshold: 0.25 });
    so.observe(scrub);
  }

  // â”€â”€ Accordion (FAQ) â”€â”€
  $$('.acc').forEach(function (acc) {
    acc.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc__btn');
      if (!btn) return;
      var panelId = btn.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      if (!panel) return;
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      $$('.acc__btn', acc).forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.style.gridTemplateRows = expanded ? '0fr' : '1fr';
      acc.querySelectorAll('.acc__item').forEach(function (item) {
        item.classList.remove('is-open');
      });
      if (!expanded) btn.closest('.acc__item').classList.add('is-open');
    });
  });

  // â”€â”€ Carousel (knowledge) â”€â”€
  var carousel = $('[data-carousel]');
  if (carousel) {
    var track = $('.cx__track', carousel);
    var viewport = $('.cx__viewport', carousel);
    var prev = $('[data-cx-prev]');
    var next = $('[data-cx-next]');
    var springX, dragging, startX, lastX, vTrack;

    function moveBy(x) {
      var max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      var pos = Math.min(Math.max(0, springX.value + x), max);
      springX.to(pos, { response: 0.09, damping: 0.75 });
    }

    function onPrev() { moveBy(-viewport.clientWidth * 0.7); }
    function onNext() { moveBy(viewport.clientWidth * 0.7); }

    if (prev) prev.addEventListener('click', onPrev);
    if (next) next.addEventListener('click', onNext);

    KM.spring(0, { response: 0.09, damping: 0.75 });
    springX = KM.spring(0, { response: 0.09, damping: 0.75 });

    var sX = 0, sT = 0;
    function sample(x, t) { sX = x; sT = t; }

    var tracking = false;
    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      tracking = true;
      dragging = true;
      viewport.classList.add('is-dragging');
      startX = e.clientX;
      lastX = e.clientX;
      springX.stop();
      e.preventDefault();
    });

    window.addEventListener('pointermove', function (e) {
      if (!tracking) return;
      var x = e.clientX;
      var dx = x - lastX;
      lastX = x;
      sample(x, performance.now());
      springX.value += dx;
      track.style.translate = springX.value + 'px 0';
    });

    window.addEventListener('pointerup', function () {
      if (!tracking) return;
      tracking = false;
      dragging = false;
      viewport.classList.remove('is-dragging');
      var v = KM.velocityTracker();
      v.get();
      var dist = KM.project(v.get().x);
      var max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      var target = Math.min(Math.max(0, springX.value), max);
      springX.to(target, { velocity: v.get().x, response: 0.09, damping: 0.75 });
    });

    window.addEventListener('resize', function () {
      var max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      springX.to(Math.min(springX.value, max));
    });

    function updateButtons() {
      var max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      prev.setAttribute('aria-disabled', springX.value <= 1 ? 'true' : 'false');
      next.setAttribute('aria-disabled', springX.value >= max - 1 ? 'true' : 'false');
    }
    var co = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) updateButtons();
    });
    co.observe(carousel);

    setInterval(function () {
      if (!dragging) updateButtons();
    }, 250);
  }

  // â”€â”€ Hero stats observer â”€â”€
  var stats = $('.hero__stats');
  if (stats) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$('.stat__n', e.target).forEach(function (n) {
            var id = n.id || ('stat-' + Math.random().toString(16).slice(2));
            n.id = id;
            co.observe(n);
          });
        }
      });
    }, { threshold: 0.5 });
    co.observe(stats);
  }

  // â”€â”€ Button pressed feedback â”€â”€
  document.addEventListener('pointerdown', function (e) {
    if (!e.target.hasAttribute('data-press')) return;
    var t = e.target.closest('[data-press]');
    t.classList.add('is-pressed');
  });
  document.addEventListener('pointerup', function (e) {
    var t = e.target.closest('[data-press]');
    if (t) t.classList.remove('is-pressed');
  });
  document.addEventListener('pointerleave', function (e) {
    var t = e.target.closest('[data-press]');
    if (t && !t.matches(':active')) t.classList.remove('is-pressed');
  });

  // â”€â”€ Spotlight on hover (desktop) â”€â”€
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function (e) {
      $$('.spot').forEach(function (s) {
        var r = s.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width) * 100;
        var my = ((e.clientY - r.top) / r.height) * 100;
        s.style.setProperty('--mx', mx + '%');
        s.style.setProperty('--my', my + '%');
      });
    });
  }

  // â”€â”€ Booking form â”€â”€
  var form = $('#bookForm');
  if (form) {
    var phone = '918977912857';
    var mailtoHref = function (data) {
      var body =
        'Hello KMZee IAMAcademy,\n\n' +
        'I\'m interested in: ' + (data.service || 'Not sure yet') + '\n' +
        (data.skills.length ? 'Skills: ' + data.skills.join(', ') + '\n' : '') +
        (data.message ? 'Message: ' + data.message + '\n' : '') +
        '\nMy name is ' + data.name + ' and you can reach me at ' + data.contact + '.\n';
      return 'mailto:support@kmzee.academy?subject=Inquiry from ' + encodeURIComponent(data.name) + '&body=' + encodeURIComponent(body);
    };

    var whatsappHref = function (data) {
      var text =
        '*New inquiry â€” KMZee IAMAcademy*\n\n' +
        'Name: ' + data.name + '\n' +
        'Contact: ' + data.contact + '\n' +
        'Interested in: ' + (data.service || 'Not sure yet') + '\n' +
        (data.skills.length ? 'Skills: ' + data.skills.join(', ') : 'Skills: (none selected)') + '\n' +
        (data.message ? 'Message: ' + data.message : '') + '\n\n';
      return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    };

    var validate = function () {
      var ok = true;
      var data = {};
      var name = $('#f-name');
      var contact = $('#f-contact');
      var service = $('#f-service');
      var msg = $('#f-msg');
      data.name = name.value.trim();
      data.contact = contact.value.trim();
      data.service = service.value;
      data.skills = selectedSkills();
      data.message = msg.value.trim();
      $$('.field').forEach(function (f) {
        var label = f.querySelector('label');
        var inp = $('input, select, textarea', f);
        var required = inp.hasAttribute('required');
        if (required && !inp.value.trim()) {
          f.classList.add('has-error');
          ok = false;
        } else {
          f.classList.remove('has-error');
        }
      });
      return { ok: ok, data: data };
    };

    var doneEl = $('.form__done', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = validate();
      if (!v.ok) return;
      form.classList.add('is-done');
      window.open(whatsappHref(v.data), '_blank');
      doneEl.hidden = false;
    });

    $('[data-reset]', form).addEventListener('click', function () {
      form.classList.remove('is-done');
      doneEl.hidden = true;
      form.reset();
      $$('.skill').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
      var sel = $('#f-service');
      if (sel) sel.classList.remove('is-selected--edu', 'is-selected--skill', 'is-selected--career');
    });

    $$('.form__note a[data-mailto], .form__done a[data-mailto]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = mailtoHref(validate().data);
      });
    });

    $('[data-wa-again]', form).addEventListener('click', function (e) {
      e.preventDefault();
      var v = validate();
      window.open(whatsappHref(v.data), '_blank');
    });

    ['input', 'change'].forEach(function (ev) {
      form.addEventListener(ev, function () {
        $$('.field').forEach(function (f) { f.classList.remove('has-error'); });
      });
    });

    $$('.form__body [data-service]').forEach(function (a) {
      a.addEventListener('click', function () {
        var sel = $('#f-service');
        sel.value = a.dataset.service;
        sel.dispatchEvent(new Event('change'));
      });
    });

    // ── Colorful select ──
    var serviceSelect = $('#f-service');
    function updateSelectColor() {
      serviceSelect.classList.remove('is-selected--edu', 'is-selected--skill', 'is-selected--career');
      var v = serviceSelect.value;
      if (v === 'Educational Consultation') serviceSelect.classList.add('is-selected--edu');
      else if (v === 'Skill Enhancement') serviceSelect.classList.add('is-selected--skill');
      else if (v === 'Career Consultation') serviceSelect.classList.add('is-selected--career');
    }
    serviceSelect.addEventListener('change', updateSelectColor);

    $('[data-to-book]').addEventListener('click', function () {
      var v = validate();
      if (!v.ok) return;
      window.location.href = whatsappHref(v.data);
    });
  }

  // â”€â”€ Year in footer â”€â”€
  $('[data-year]').textContent = new Date().getFullYear();

  // â”€â”€ Mobile chip drag (pointer) â”€â”€
  $$('.chip:not(.chip--desk)').forEach(function (chip) {
    var float = $('.chip__float', chip);
    var drag = KM && KM.spring ? [KM.spring(0), KM.spring(0)] : [
      { value: 0, target: 0, stop: function () {} },
      { value: 0, target: 0, stop: function () {} }
    ];
    var isDrag = false;
    chip.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      isDrag = true;
      chip.classList.add('is-dragging');
      var x = e.clientX, y = e.clientY;
      drag[0].stop(); drag[1].stop();
      function move(ev) {
        var dx = ev.clientX - x; var dy = ev.clientY - y; x = ev.clientX; y = ev.clientY;
        var d = KM ? KM : {};
        drag[0].value += dx * 0.35; drag[1].value += dy * 0.35;
        float.style.translate = drag[0].value + 'px ' + drag[1].value + 'px';
      }
      function up(ev) {
        isDrag = false;
        chip.classList.remove('is-dragging');
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    chip.addEventListener('pointerenter', function (e) {
      if (!isDrag && KM) {
        drag[0].to(e.clientX, { velocity: 0 });
        drag[1].to(e.clientY, { velocity: 0 });
      }
    });
  });

})();


