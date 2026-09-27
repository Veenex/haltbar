/* Haltbar – App-Logik.
 * Alle Daten bleiben im Speicher dieses Browsers (localStorage) – kein Server, kein Konto.
 */
(function () {
  'use strict';

  const STORE_KEY = 'haltbar.v1';
  const UI_KEY = 'haltbar.ui';
  const RECENT_MAX = 12;
  const SOON_DAYS = 3;
  const $ = (id) => document.getElementById(id);

  // ---------- Zoom verhindern (iOS ignoriert user-scalable=no) ----------

  ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
    document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
  });
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // ---------- Daten ----------

  const state = { items: [], recent: [], learned: {} };
  let ui = { installDismissed: false, swiped: false, persisted: false };

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function cleanItem(it) {
    if (!it || typeof it !== 'object') return null;
    const name = String(it.name || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!name || !validDate(it.date)) return null;
    return {
      id: typeof it.id === 'string' && it.id ? it.id : uid(),
      name,
      date: it.date,
      icon: typeof it.icon === 'string' && Foods.byKey[it.icon] ? it.icon : null,
      created: Number(it.created) || Date.now(),
    };
  }

  function cleanLearned(obj) {
    const out = {};
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((k) => { if (Foods.byKey[obj[k]]) out[k] = obj[k]; });
    }
    return out;
  }

  function cleanRecent(list) {
    return (Array.isArray(list) ? list : [])
      .filter((r) => r && typeof r.name === 'string' && r.name.trim())
      .map((r) => ({ name: r.name.trim().slice(0, 60), icon: Foods.byKey[r.icon] ? r.icon : null }));
  }

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (s) {
        state.items = (Array.isArray(s.items) ? s.items : []).map(cleanItem).filter(Boolean);
        state.recent = cleanRecent(s.recent).slice(0, RECENT_MAX);
        state.learned = cleanLearned(s.learned);
      }
    } catch (e) { /* unlesbare Daten: leer starten */ }
    try { ui = Object.assign(ui, JSON.parse(localStorage.getItem(UI_KEY) || '{}')); } catch (e) { /* egal */ }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      toast('Speichern hat nicht geklappt – ist der Speicher voll?');
    }
    // Browser bitten, die Daten nicht automatisch zu löschen
    if (!ui.persisted && navigator.storage && navigator.storage.persist) {
      ui.persisted = true;
      saveUi();
      navigator.storage.persist().catch(() => {});
    }
  }

  function saveUi() {
    try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) { /* egal */ }
  }

  // ---------- Datum ----------

  const pad = (n) => String(n).padStart(2, '0');
  const isoOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const todayIso = () => isoOf(new Date());

  function parseIso(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
  }

  function validDate(s) {
    return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && isoOf(parseIso(s)) === s;
  }

  function dayNum(s) {
    const [y, m, d] = s.split('-').map(Number);
    return Math.round(Date.UTC(y, m - 1, d) / 864e5);
  }

  const daysLeft = (s) => dayNum(s) - dayNum(todayIso());

  function addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return isoOf(d);
  }

  function addMonths(n) {
    const d = new Date();
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return isoOf(d);
  }

  const fmt = (o) => new Intl.DateTimeFormat('de-DE', o);
  const F_TODAY = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
  const F_SHORT = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
  const F_SHORT_YEAR = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
  const F_LONG = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
  const F_LONG_YEAR = fmt({ weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  function shortDate(s) {
    const d = parseIso(s);
    return (d.getFullYear() === new Date().getFullYear() ? F_SHORT : F_SHORT_YEAR).format(d);
  }

  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

  function level(d) {
    if (d < 0) return 'exp';
    if (d <= 1) return 'urgent';
    if (d <= SOON_DAYS) return 'soon';
    if (d <= 7) return 'week';
    return 'ok';
  }

  function pillText(d) {
    if (d < 0) return 'Abgelaufen';
    if (d === 0) return 'Noch heute';
    if (d < 60) return 'Noch ' + plural(d, 'Tag', 'Tage');
    if (d < 730) return 'Noch ' + plural(Math.round(d / 30.44), 'Monat', 'Monate');
    return 'Noch ' + plural(Math.round(d / 365.25), 'Jahr', 'Jahre');
  }

  function subText(d, s) {
    if (d < -1) return 'seit ' + -d + ' Tagen';
    if (d === -1) return 'seit gestern';
    if (d === 0) return 'läuft heute ab';
    if (d === 1) return 'bis morgen';
    return 'bis ' + shortDate(s);
  }

  function relText(d) {
    if (d < -1) return 'vor ' + -d + ' Tagen';
    if (d === -1) return 'gestern';
    if (d === 0) return 'heute';
    if (d === 1) return 'morgen';
    return 'in ' + d + ' Tagen';
  }

  // ---------- Hilfen ----------

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const iconFor = (it) => it.icon || Foods.match(it.name, state.learned) || Foods.FALLBACK;

  function restartAnimation(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  const SVG = {
    check: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    alert: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 2.5 20h19L12 3.5z"/><path d="M12 10v4.5M12 17.4v.1"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    ok: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.7 2.7L16 9.6"/></svg>',
    tick: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/></svg>',
  };

  // ---------- Liste ----------

  const GROUPS = [
    ['exp', 'Abgelaufen', (d) => d < 0],
    ['soon', 'Läuft bald ab', (d) => d >= 0 && d <= SOON_DAYS],
    ['ok', 'Noch haltbar', (d) => d > SOON_DAYS],
  ];

  function render() {
    $('today').textContent = F_TODAY.format(new Date());

    const rows = state.items
      .map((it) => ({ it, d: daysLeft(it.date) }))
      .sort((a, b) => a.d - b.d || a.it.name.localeCompare(b.it.name, 'de'));

    let html = '';
    GROUPS.forEach(([key, title, test]) => {
      const group = rows.filter((r) => test(r.d));
      if (!group.length) return;
      html += '<section class="group" data-group="' + key + '">' +
        '<h2 class="group-title"><span class="dot"></span>' + title + '<span class="count">' + group.length + '</span></h2>' +
        '<ul class="items">';
      group.forEach(({ it, d }) => {
        const lv = level(d);
        const pill = pillText(d);
        html += '<li class="item lvl-' + lv + '" data-id="' + esc(it.id) + '">' +
          '<div class="item-action" aria-hidden="true">' + SVG.check + '<span>Erledigt</span></div>' +
          '<div class="item-card" role="button" tabindex="0" aria-label="' + esc(it.name + ', ' + pill) + '">' +
            '<span class="thumb"><img src="' + Foods.src(iconFor(it)) + '" alt="" width="40" height="40" decoding="async"></span>' +
            '<span class="info"><span class="name">' + esc(it.name) + '</span><span class="sub">' + esc(subText(d, it.date)) + '</span></span>' +
            '<span class="pill ' + lv + '">' + esc(pill) + '</span>' +
          '</div></li>';
      });
      html += '</ul></section>';
    });
    if (rows.length && !ui.swiped) {
      html += '<p class="hint">Tipp: Wisch einen Eintrag nach links, wenn er aufgebraucht ist.</p>';
    }

    $('list').innerHTML = html;
    $('empty').hidden = rows.length > 0;
    renderStatus(rows);
    renderTeaser();
    renderInstall();
  }

  function renderStatus(rows) {
    const el = $('status');
    if (!rows.length) { el.hidden = true; return; }
    const exp = rows.filter((r) => r.d < 0).length;
    const soon = rows.filter((r) => r.d >= 0 && r.d <= SOON_DAYS).length;
    let cls, icon, text;
    if (exp) {
      cls = 'exp';
      icon = SVG.alert;
      text = plural(exp, 'Lebensmittel ist', 'Lebensmittel sind') + ' abgelaufen';
      if (soon) text += ', ' + soon + (soon === 1 ? ' läuft' : ' laufen') + ' bald ab';
    } else if (soon) {
      cls = 'soon';
      icon = SVG.clock;
      text = plural(soon, 'Lebensmittel läuft', 'Lebensmittel laufen') + ' in den nächsten ' + SOON_DAYS + ' Tagen ab';
    } else {
      cls = 'ok';
      icon = SVG.ok;
      text = 'Alles frisch – in den nächsten ' + SOON_DAYS + ' Tagen läuft nichts ab';
    }
    el.className = 'status ' + cls;
    el.innerHTML = icon + '<span>' + esc(text) + '</span>';
    el.hidden = false;
  }

  function flash(id) {
    const li = document.querySelector('.item[data-id="' + CSS.escape(id) + '"]');
    if (!li) return;
    restartAnimation(li, 'flash');
    li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ---------- Entfernen mit Rückgängig ----------

  function removeItem(id) {
    const i = state.items.findIndex((x) => x.id === id);
    if (i < 0) return;
    const [it] = state.items.splice(i, 1);
    save();
    render();
    toast('„' + it.name + '“ entfernt', 'Rückgängig', () => {
      state.items.push(it);
      save();
      render();
      flash(it.id);
    });
  }

  function swipeAway(li) {
    li.style.height = li.offsetHeight + 'px';
    li.classList.add('removing');
    requestAnimationFrame(() => {
      li.style.height = '0px';
      li.style.marginTop = '0px';
    });
    setTimeout(() => removeItem(li.dataset.id), 230);
    if (!ui.swiped) { ui.swiped = true; saveUi(); }
  }

  // ---------- Wischen & Tippen in der Liste ----------

  const list = $('list');
  let drag = null;
  let suppressClick = false;
  const threshold = () => Math.min(120, list.clientWidth * 0.3);

  list.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.item-card');
    if (!card || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { card, li: card.parentElement, x0: e.clientX, y0: e.clientY, dx: 0, active: false, armed: false, pid: e.pointerId };
  });

  list.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        drag.active = true;
        drag.li.classList.add('dragging');
        try { drag.card.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
      } else if (Math.abs(dy) > 10) {
        drag = null;
        return;
      } else {
        return;
      }
    }
    drag.dx = Math.min(0, dx);
    drag.card.style.transform = 'translateX(' + drag.dx + 'px)';
    const armed = drag.dx < -threshold();
    if (armed !== drag.armed) {
      drag.armed = armed;
      drag.li.classList.toggle('armed', armed);
      if (armed && navigator.vibrate) navigator.vibrate(8);
    }
  });

  function endDrag() {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 60);
    d.li.classList.remove('dragging', 'armed');
    if (d.armed) {
      swipeAway(d.li);
    } else {
      d.card.style.transform = '';
    }
  }
  list.addEventListener('pointerup', endDrag);
  list.addEventListener('pointercancel', endDrag);

  list.addEventListener('click', (e) => {
    if (suppressClick) return;
    const card = e.target.closest('.item-card');
    if (card) openEdit(card.parentElement.dataset.id);
  });
  list.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('item-card')) {
      e.preventDefault();
      openEdit(e.target.parentElement.dataset.id);
    }
  });

  // ---------- Blätter (mit Zurück-Taste auf Android schließbar) ----------

  const stack = [];

  function openSheet(id) {
    const el = $(id);
    if (stack.indexOf(el) >= 0) return;
    el.hidden = false;
    el.style.zIndex = String(100 + stack.length * 2);
    stack.push(el);
    document.body.classList.add('locked');
    void el.offsetWidth;
    el.classList.add('open');
    history.pushState({ sheet: id }, '');
  }

  function closeSheet() {
    if (stack.length) history.back();
  }

  function hideTopSheet() {
    const el = stack.pop();
    if (!el) return;
    el.classList.remove('open');
    if (el.contains(document.activeElement)) document.activeElement.blur();
    setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 320);
    if (!stack.length) document.body.classList.remove('locked');
  }

  window.addEventListener('popstate', hideTopSheet);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeSheet();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && stack.length) closeSheet();
  });
  if (history.state && history.state.sheet) history.replaceState(null, '');

  // ---------- Formular ----------

  const form = $('form-item');
  const fName = $('f-name');
  const fDate = $('f-date');
  let editing = null;          // id beim Bearbeiten, sonst null
  let formIcon = null;         // selbst gewähltes Bild, null = automatisch
  let resetLearned = false;    // Nutzer hat wieder „Automatisch“ gewählt
  let chipData = [];

  function openAdd() {
    editing = null;
    prepareForm('Neuer Eintrag', '', '', null);
    openSheet('sheet-item');
    fName.focus({ preventScroll: true });
  }

  function openEdit(id) {
    const it = state.items.find((x) => x.id === id);
    if (!it) return;
    editing = id;
    prepareForm('Bearbeiten', it.name, it.date, it.icon);
    openSheet('sheet-item');
  }

  function prepareForm(title, name, date, icon) {
    $('form-title').textContent = title;
    $('btn-delete').hidden = !editing;
    fName.value = name;
    fDate.value = date;
    formIcon = icon;
    resetLearned = false;
    clearError();
    updateFormIcon(false);
    renderDate();
    if (editing) $('f-chips').hidden = true;   // Vorschläge erst, wenn der Name geändert wird
    else renderChips();
    // Beim Bearbeiten: passende Rezepte für genau dieses Lebensmittel anbieten
    const recBtn = $('btn-item-recipes');
    const count = editing && daysLeft(date) >= 0 ? Recipes.suggest(fridgeRows(), editing).length : 0;
    recBtn.hidden = !count;
    if (count) recBtn.textContent = plural(count, 'Rezeptidee', 'Rezeptideen') + ' mit „' + name + '“';
    form.querySelector('.sheet-body').scrollTop = 0;
  }

  function updateFormIcon(animate) {
    const key = formIcon || Foods.match(fName.value, resetLearned ? null : state.learned) || Foods.FALLBACK;
    const img = $('f-icon');
    const src = Foods.src(key);
    if (img.getAttribute('src') !== src) {
      img.src = src;
      if (animate) restartAnimation(img, 'pop');
    }
    $('btn-pick').setAttribute('aria-label', 'Bild ändern, aktuell: ' + Foods.byKey[key].label);
  }

  function renderDate() {
    const iso = fDate.value;
    const field = $('f-datefield');
    if (validDate(iso)) {
      const d = parseIso(iso);
      $('f-date-main').textContent = (d.getFullYear() === new Date().getFullYear() ? F_LONG : F_LONG_YEAR).format(d);
      $('f-date-rel').textContent = relText(daysLeft(iso));
      field.classList.remove('empty');
    } else {
      $('f-date-main').textContent = 'Datum wählen';
      $('f-date-rel').textContent = '';
      field.classList.add('empty');
    }
    $('f-quick').querySelectorAll('button').forEach((b) => {
      const target = b.dataset.months ? addMonths(+b.dataset.months) : addDays(+b.dataset.days);
      b.classList.toggle('on', target === iso);
    });
  }

  function renderChips() {
    const box = $('f-chips');
    const q = fName.value.trim();
    const n = Foods.norm(q);
    let label = '';
    chipData = [];
    if (!q) {
      if (!editing && state.recent.length) {
        label = 'Zuletzt';
        chipData = state.recent.slice(0, 8);
      }
    } else if (n.length >= 2) {
      const seen = new Set([n]);
      const add = (name, icon) => {
        const k = Foods.norm(name);
        if (seen.has(k)) return;
        seen.add(k);
        chipData.push({ name, icon });
      };
      state.recent.forEach((r) => { if (Foods.norm(r.name).indexOf(n) === 0) add(r.name, r.icon); });
      Foods.suggest(q, 8).forEach((s) => add(s.name, null));
      chipData = chipData.slice(0, 6);
    }
    if (!chipData.length) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    box.innerHTML = (label ? '<span class="chips-label">' + label + '</span>' : '') +
      chipData.map((c, i) => {
        const key = c.icon || Foods.match(c.name, state.learned) || Foods.FALLBACK;
        return '<button type="button" class="chip" data-i="' + i + '"><img src="' + Foods.src(key) + '" alt="">' + esc(c.name) + '</button>';
      }).join('');
    box.hidden = false;
    box.scrollLeft = 0;
  }

  $('f-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const c = chipData[+chip.dataset.i];
    if (!c) return;
    fName.value = c.name;
    if (c.icon) formIcon = c.icon;
    clearError();
    updateFormIcon(true);
    $('f-chips').hidden = true;
    fName.blur();
  });

  fName.addEventListener('input', () => {
    clearError();
    updateFormIcon(true);
    renderChips();
  });

  fName.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (validDate(fDate.value)) submitForm();
    else fName.blur();
  });

  fDate.addEventListener('input', () => { clearError(); renderDate(); });
  fDate.addEventListener('change', () => { clearError(); renderDate(); });
  fDate.addEventListener('click', () => {
    // Am PC öffnet der unsichtbare Datums-Knopf sonst keinen Kalender
    if (fDate.showPicker && matchMedia('(pointer: fine)').matches) {
      try { fDate.showPicker(); } catch (e) { /* egal */ }
    }
  });

  $('f-quick').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    fDate.value = b.dataset.months ? addMonths(+b.dataset.months) : addDays(+b.dataset.days);
    clearError();
    renderDate();
  });

  function formError(msg, el) {
    const p = $('f-error');
    p.textContent = msg;
    p.hidden = false;
    el.classList.add('invalid');
    restartAnimation(el, 'shake');
  }

  function clearError() {
    $('f-error').hidden = true;
    fName.classList.remove('invalid');
    $('f-datefield').classList.remove('invalid');
  }

  function submitForm(e) {
    if (e) e.preventDefault();
    const name = fName.value.trim().replace(/\s+/g, ' ');
    const date = fDate.value;
    if (!name) {
      formError('Bitte gib ein, was es ist.', fName);
      fName.focus();
      return;
    }
    if (!validDate(date)) {
      formError('Bitte wähle aus, bis wann es haltbar ist.', $('f-datefield'));
      fName.blur();
      return;
    }

    const n = Foods.norm(name);
    if (formIcon) state.learned[n] = formIcon;
    else if (resetLearned) delete state.learned[n];

    let id = editing;
    const existing = editing && state.items.find((x) => x.id === editing);
    if (existing) {
      existing.name = name;
      existing.date = date;
      existing.icon = formIcon;
    } else {
      id = uid();
      state.items.push({ id, name, date, icon: formIcon, created: Date.now() });
    }
    state.recent = [{ name, icon: formIcon }]
      .concat(state.recent.filter((r) => Foods.norm(r.name) !== n))
      .slice(0, RECENT_MAX);

    save();
    closeSheet();
    render();
    flash(id);
  }

  form.addEventListener('submit', submitForm);

  $('btn-delete').addEventListener('click', () => {
    const id = editing;
    closeSheet();
    removeItem(id);
  });

  $('btn-pick').addEventListener('click', openPicker);
  $('btn-add').addEventListener('click', openAdd);

  // ---------- Bildauswahl ----------

  function tile(key, label, cls) {
    return '<button type="button" class="tile' + (cls || '') + '" data-key="' + key + '">' +
      '<img src="' + Foods.src(key === '__auto' ? autoKey() : key) + '" alt="" width="44" height="44" loading="lazy" decoding="async">' +
      '<span>' + esc(label) + '</span></button>';
  }

  const autoKey = () => Foods.match(fName.value, null) || Foods.FALLBACK;

  function openPicker() {
    $('pick-search').value = '';
    renderPicker();
    openSheet('sheet-pick');
    $('pick-body').scrollTop = 0;
  }

  function renderPicker() {
    const q = $('pick-search').value.trim();
    let html = '';
    if (!q) {
      html += '<div class="grid">' + tile('__auto', 'Automatisch', ' auto' + (formIcon ? '' : ' on')) + '</div>';
      Foods.CATEGORIES.forEach(([cat, title]) => {
        const icons = Foods.list.filter((ic) => ic.cat === cat);
        html += '<h3 class="cat-title">' + esc(title) + '</h3><div class="grid">' +
          icons.map((ic) => tile(ic.key, ic.label, ic.key === formIcon ? ' on' : '')).join('') + '</div>';
      });
    } else {
      const hits = Foods.search(q);
      html = hits.length
        ? '<div class="grid">' + hits.map((ic) => tile(ic.key, ic.label, ic.key === formIcon ? ' on' : '')).join('') + '</div>'
        : '<p class="no-hits">Kein passendes Bild gefunden. Versuch ein anderes Wort – oder nimm „Mahlzeit“.</p>';
    }
    $('pick-body').innerHTML = html;
  }

  $('pick-search').addEventListener('input', renderPicker);
  $('pick-search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
  });

  $('pick-body').addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (!t) return;
    if (t.dataset.key === '__auto') {
      formIcon = null;
      resetLearned = true;
    } else {
      formIcon = t.dataset.key;
      resetLearned = false;
    }
    updateFormIcon(true);
    closeSheet();
  });

  // ---------- Rezeptideen ----------

  let recFocus = null;          // nur Rezepte mit diesem Lebensmittel (id)
  let recShown = [];
  const recOpen = new Set();    // aufgeklappte Rezepte

  // Was im Kühlschrank ist und noch nicht abgelaufen
  function fridgeRows() {
    return state.items
      .map((it) => ({ id: it.id, name: it.name, n: Foods.norm(it.name), key: iconFor(it), d: daysLeft(it.date) }))
      .filter((x) => x.d >= 0);
  }

  const dayShort = (d) => (d === 0 ? 'heute' : d === 1 ? 'morgen' : 'noch ' + d + ' T.');

  function renderTeaser() {
    const res = Recipes.suggest(fridgeRows());
    $('recipes-teaser').hidden = !res.length;
    if (res.length) {
      $('teaser-sub').textContent = 'z. B. ' + res[0].r.title + ' · ' + plural(res.length, 'Idee', 'Ideen') + ' mit deinen Sachen';
    }
  }

  function openRecipes(focusId) {
    recFocus = focusId || null;
    recOpen.clear();
    renderRecipes();
    openSheet('sheet-recipes');
    $('rec-body').scrollTop = 0;
    const on = $('rec-filter').querySelector('.on');
    if (on && on.dataset.id) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function renderRecipes() {
    const fridge = fridgeRows();
    const all = Recipes.suggest(fridge);
    const used = new Set();
    all.forEach((x) => x.have.forEach((h) => used.add(h.item.id)));
    if (recFocus && !fridge.some((it) => it.id === recFocus)) recFocus = null;
    if (recFocus) used.add(recFocus);
    const choices = fridge.filter((it) => used.has(it.id)).sort((a, b) => a.d - b.d || a.name.localeCompare(b.name, 'de'));
    const focusItem = recFocus && fridge.find((it) => it.id === recFocus);

    // Filter: Alle + jedes verwendbare Lebensmittel, Dringendes zuerst
    const chip = (id, label, it) => '<button type="button" class="chip' + ((id || null) === recFocus ? ' on' : '') + '" data-id="' + esc(id) + '">' +
      (it ? '<img src="' + Foods.src(it.key) + '" alt="">' : '') + esc(label) +
      (it && it.d <= 3 ? '<span class="chip-days ' + level(it.d) + '">' + dayShort(it.d) + '</span>' : '') + '</button>';
    $('rec-filter').innerHTML = choices.length ? chip('', 'Alle', null) + choices.map((it) => chip(it.id, it.name, it)).join('') : '';
    $('rec-filter').hidden = !choices.length;

    recShown = (focusItem ? Recipes.suggest(fridge, recFocus) : all).slice(0, 40);
    let html = '';
    if (!fridge.length) {
      html = '<p class="rec-empty">Trag zuerst ein paar Lebensmittel ein – dann schlage ich passende Rezepte vor.</p>';
    } else if (!recShown.length) {
      html = '<p class="rec-empty">Für deine Lebensmittel habe ich noch kein passendes Rezept. Im Internet findest du bestimmt etwas:</p>';
    } else {
      html = '<p class="rec-intro">' + (focusItem
        ? 'Rezepte mit „' + esc(focusItem.name) + '“ – tippe auf ein Rezept für Zutaten und Zubereitung.'
        : 'Zuerst die Rezepte, die verbrauchen, was bald abläuft. Tippe auf ein Rezept für Zutaten und Zubereitung.') + '</p>';
      html += recShown.map(recipeCard).join('');
    }
    const query = focusItem ? focusItem.name : choices.length ? choices[0].name : '';
    if (query) {
      html += '<a class="rec-more" href="' + esc(Recipes.chefkoch(query)) + '" target="_blank" rel="noopener">' +
        '<span>Mehr Ideen im Internet</span><strong>„' + esc(query) + '“ bei Chefkoch suchen</strong>' + SVG.ext + '</a>';
    }
    if (state.items.some((it) => daysLeft(it.date) < 0)) {
      html += '<p class="rec-note">Abgelaufenes ist hier nicht dabei. Vieles mit Mindesthaltbarkeitsdatum wie Joghurt oder Käse ist oft noch gut – prüf es mit Augen, Nase und Zunge. Fleisch und Fisch mit „zu verbrauchen bis“ nach dem Datum nicht mehr essen.</p>';
    }
    $('rec-body').innerHTML = html;
  }

  function recipeCard(x) {
    const r = x.r;
    const open = recOpen.has(r.id);
    const tags = x.have.filter((h) => h.g.flag !== 'g').map((h) =>
      '<span class="rtag ' + level(h.item.d) + '">' + esc(h.item.name) + (h.item.d <= 3 ? ' · ' + dayShort(h.item.d) : '') + '</span>').join('');
    const need = x.missing.length
      ? '<p class="rneed">Dazu brauchst du: ' + esc(x.missing.map((g) => g.name).join(', ')) + '</p>'
      : '<p class="rneed ok">' + SVG.tick + 'Alles Wichtige ist da</p>';
    return '<article class="rcard' + (open ? ' open' : '') + '" data-rid="' + r.id + '">' +
      '<button type="button" class="rhead" aria-expanded="' + open + '">' +
        '<span class="thumb"><img src="' + Foods.src(r.icon) + '" alt="" width="40" height="40" loading="lazy" decoding="async"></span>' +
        '<span class="rinfo"><span class="rtitle">' + esc(r.title) + '</span><span class="rmeta">' + r.min + ' Min. · für 2 Personen</span></span>' +
        SVG.chev +
      '</button>' +
      '<div class="rtags">' + tags + '</div>' + need +
      (open ? recipeDetail(x) : '') +
      '</article>';
  }

  function recipeDetail(x) {
    const owned = new Map(x.have.map((h) => [h.g, h.item]));
    const ing = x.r.ing.map((g) => {
      const it = owned.get(g);
      // Zeigen, womit die Zutat erfüllt ist, wenn der Name anders lautet („Parmesan“ → „Gouda“)
      const via = it && Foods.norm(g.full).indexOf(it.n) < 0 ? ' <em>· ' + esc(it.name) + '</em>' : '';
      const opt = g.flag === 'o' ? ' <em>(optional)</em>' : '';
      return '<li class="' + (it ? 'have' : g.flag === 'g' ? 'basic' : '') + '">' +
        (it ? SVG.tick : '<span class="bullet"></span>') + '<span>' + esc(g.full) + opt + via + '</span></li>';
    }).join('');
    const steps = x.r.steps.map((s) => '<li>' + esc(s) + '</li>').join('');
    return '<div class="rdetail">' +
      '<h4>Zutaten</h4><ul class="ring">' + ing + '</ul>' +
      '<h4>So geht\'s</h4><ol class="rsteps">' + steps + '</ol>' +
      '<a class="rlink" href="' + esc(Recipes.chefkoch(x.r.title)) + '" target="_blank" rel="noopener">Mehr Varianten bei Chefkoch' + SVG.ext + '</a>' +
      '</div>';
  }

  $('recipes-teaser').addEventListener('click', () => openRecipes(null));
  $('btn-item-recipes').addEventListener('click', () => openRecipes(editing));

  $('rec-filter').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    recFocus = c.dataset.id || null;
    recOpen.clear();
    const scroll = $('rec-filter').scrollLeft;
    renderRecipes();
    $('rec-filter').scrollLeft = scroll;   // Leiste nicht an den Anfang springen lassen
    $('rec-body').scrollTop = 0;
  });

  $('rec-body').addEventListener('click', (e) => {
    const head = e.target.closest('.rhead');
    if (!head) return;
    const card = head.parentElement;
    const id = +card.dataset.rid;
    const x = recShown.find((v) => v.r.id === id);
    if (!x) return;
    if (recOpen.has(id)) recOpen.delete(id);
    else recOpen.add(id);
    card.outerHTML = recipeCard(x);
  });

  // ---------- Meldungen ----------

  let toastTimer = null;
  let toastAction = null;

  function toast(msg, actionLabel, action) {
    const el = $('toast');
    $('toast-text').textContent = msg;
    const btn = $('toast-btn');
    btn.hidden = !action;
    btn.textContent = actionLabel || '';
    toastAction = action || null;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? 6000 : 3000);
  }

  function hideToast() {
    const el = $('toast');
    el.classList.remove('show');
    toastAction = null;
    setTimeout(() => { if (!el.classList.contains('show')) el.hidden = true; }, 250);
  }

  $('toast-btn').addEventListener('click', () => {
    const action = toastAction;
    clearTimeout(toastTimer);
    hideToast();
    if (action) action();
  });

  // ---------- Hilfe, Sicherung, Installieren ----------

  $('btn-info').addEventListener('click', () => {
    openSheet('sheet-info');
    $('sheet-info').querySelector('.sheet-body').scrollTop = 0;
  });

  $('btn-export').addEventListener('click', () => {
    const data = { app: 'haltbar', version: 1, exported: new Date().toISOString(), items: state.items, learned: state.learned, recent: state.recent };
    const name = 'haltbar-sicherung-' + todayIso() + '.json';
    const file = new File([JSON.stringify(data, null, 2)], name, { type: 'application/json' });
    const touch = matchMedia('(pointer: coarse)').matches;
    if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Haltbar-Sicherung' }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Sicherung gespeichert');
  });

  $('btn-import').addEventListener('click', () => $('file-import').click());

  $('file-import').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const items = (Array.isArray(data) ? data : data.items || []).map(cleanItem).filter(Boolean);
      if (!items.length) throw new Error('leer');
      let added = 0;
      items.forEach((it) => {
        const i = state.items.findIndex((x) => x.id === it.id);
        if (i >= 0) state.items[i] = it;
        else { state.items.push(it); added++; }
      });
      Object.assign(state.learned, cleanLearned(data.learned));
      const names = new Set(state.recent.map((r) => Foods.norm(r.name)));
      cleanRecent(data.recent).forEach((r) => {
        if (!names.has(Foods.norm(r.name))) state.recent.push(r);
      });
      state.recent = state.recent.slice(0, RECENT_MAX);
      save();
      render();
      closeSheet();
      toast(added ? plural(added, 'Eintrag', 'Einträge') + ' hinzugefügt' : 'Sicherung geladen – alles war schon da');
    } catch (err) {
      toast('Das ist keine Haltbar-Sicherung.');
    }
  });

  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let installPrompt = null;

  function renderInstall() {
    $('install').hidden = isStandalone() || ui.installDismissed;
    $('install-sub').textContent = installPrompt
      ? 'Startet dann wie eine echte App – auch offline. Hier tippen zum Installieren.'
      : 'Startet dann wie eine echte App – auch offline. Tippen für die Anleitung.';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    renderInstall();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    ui.installDismissed = true;
    saveUi();
    renderInstall();
  });

  $('btn-install').addEventListener('click', async () => {
    if (installPrompt) {
      const p = installPrompt;
      installPrompt = null;
      p.prompt();
      try { await p.userChoice; } catch (e) { /* egal */ }
      renderInstall();
      return;
    }
    openSheet('sheet-info');
    $('info-install').scrollIntoView({ block: 'start' });
  });

  $('btn-install-close').addEventListener('click', () => {
    ui.installDismissed = true;
    saveUi();
    renderInstall();
  });

  // ---------- Start ----------

  load();
  render();

  // Tageswechsel: Anzeige aktualisieren (um Mitternacht und beim Zurückkehren in die App)
  (function scheduleMidnight() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    setTimeout(() => { render(); scheduleMidnight(); }, next - now);
  })();

  let swReg = null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    render();
    if (swReg) swReg.update().catch(() => {});
  });

  // Offline-Fähigkeit. Lokal nur mit ?sw=1, damit beim Entwickeln nichts Altes hängen bleibt.
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || local) && (!local || /[?&]sw=1/.test(location.search))) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => { swReg = reg; }).catch(() => {});
    });
  }
})();
