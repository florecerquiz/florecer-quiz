/* =========================================================
   FLORECER – Quiz Funnel Logic v2
   ========================================================= */

// All screen IDs in order
const SCREENS = [
  's0',        // gender
  's1',        // age
  's2',        // q1: morning energy
  'sInt1',     // intermediate: social proof
  's3',        // q2: anxiety
  's4',        // q3: daytime energy
  's5',        // q4: sleep hours
  's6',        // q5: sleep quality
  's7',        // q6: emotional exhaustion
  'sIdent1',   // identification question 1
  'sIdent2',   // identification question 2
  'sInt2',     // intermediate: science/expert
  's8',        // q7: relationships
  's9',        // q8: exercise
  's10',       // q9: focus
  's11',       // q10: symptoms (multi)
  'sAnxSymptoms', // NEW: síntomas físicos de ansiedad
  'sIdent3b',  // NEW: identificación emocional
  's12',       // q11: origen del estrés
  's13',       // q12: main goal
  'sPrevAttempt', // NEW: intentos previos fallidos
  'sInt3',     // intermediate: results preview
  'sCommit',   // NEW: pantalla de compromiso
  'sLoading',
  'sEmail',
  'sName',
  'sChart',
  'sSales',
  'sUpsell'
];

// Map screen IDs to question numbers (for progress bar)
const SCREEN_QNUM = {
  's2': 1, 's3': 2, 's4': 3, 's5': 4, 's6': 5, 's7': 6,
  's8': 7, 's9': 8, 's10': 9, 's11': 10, 'sAnxSymptoms': 11, 's12': 12, 's13': 13
};
const TOTAL_Q = 13;

// Intermediate screens (no progress bump, auto-show continue)
const INTERMEDIATE = new Set(['sInt1', 'sInt2', 'sInt3']);

// State
let currentIdx = 0;
let selectedGender = null;
const answers = {};
const multiAnswers = {};

// Loading messages — se generan dinámicamente en startLoading()
let LOAD_MSGS = [];

// Gender-specific images
const IMAGES = {
  male: {
    before: 'https://imagedelivery.net/yV7GQhi_zl7Pdn3EJrn61Q/b7144fbb-f7e4-405f-b2ff-56f312e87800/public',
    after:  'https://imagedelivery.net/yV7GQhi_zl7Pdn3EJrn61Q/34715913-470e-4bee-6ab0-dc684a50d000/public'
  },
  female: {
    before: 'https://imagedelivery.net/yV7GQhi_zl7Pdn3EJrn61Q/5f782e13-3d7f-466c-e702-ed3c2acb4500/public',
    after:  'https://imagedelivery.net/yV7GQhi_zl7Pdn3EJrn61Q/f54122bc-b4d4-4cd1-c48e-8d566ca56300/public'
  }
};

// =========================================================
// INIT
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  goTo(0);
  setupObservers();
  setupRipple();
  setupCounters();
});

// =========================================================
// NAVIGATION
// =========================================================
function goTo(idx) {
  // Bounds check
  if (idx < 0 || idx >= SCREENS.length) return;

  // Hide all
  SCREENS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const id = SCREENS[idx];
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  currentIdx = idx;
  updateHeader(id);

  // Personalizar pantalla sistema nervioso con los síntomas reales del usuario
  if (id === 'sIdent3b') setTimeout(personalizeIdent3b, 50);

  // Clear any pending auto-advance when navigating away manually
  if (_autoAdvTimer) clearTimeout(_autoAdvTimer);
}

function nextScreen() {
  const nextIdx = currentIdx + 1;
  goTo(nextIdx);

  // Start loading when we hit loading screen
  if (SCREENS[nextIdx] === 'sLoading') {
    setTimeout(startLoading, 300);
  }
}

function prevScreen() {
  if (currentIdx > 0) goTo(currentIdx - 1);
}

// =========================================================
// HEADER + PROGRESS
// =========================================================
function updateHeader(screenId) {
  const header = document.getElementById('quizHeader');
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');

  // Show header only on quiz question screens
  const hideOn = new Set(['s0', 'sInt1', 'sInt2', 'sInt3', 'sIdent1', 'sIdent2', 'sIdent3b', 'sLoading', 'sEmail', 'sName', 'sChart', 'sSales', 'sCommit', 'sPrevAttempt']);
  if (hideOn.has(screenId)) {
    header.classList.remove('visible');
    return;
  }
  header.classList.add('visible');

  const qNum = SCREEN_QNUM[screenId];
  if (qNum !== undefined) {
    const pct = Math.round((qNum / TOTAL_Q) * 100);
    fill.style.width = pct + '%';
    label.textContent = qNum + ' de ' + TOTAL_Q;
  }
}

// =========================================================
// GENDER SELECTION
// =========================================================
function selectGender(gender) {
  selectedGender = gender;
  sessionStorage.setItem('flGender', gender);

  document.getElementById('cardMale').classList.toggle('selected', gender === 'male');
  document.getElementById('cardFemale').classList.toggle('selected', gender === 'female');

  setTimeout(() => nextScreen(), 300);
}

// =========================================================
// SINGLE SELECT OPTION
// =========================================================
let _autoAdvTimer = null;

function pickOpt(el, qId) {
  const parent = el.closest('.options-grid');
  parent.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers[qId] = el.dataset.val;

  // Si había campo "Otro" abierto, ocultarlo al elegir otra opción
  const otherWrap = document.getElementById('otherGoalWrap');
  if (otherWrap) otherWrap.style.display = 'none';

  // Single-select: auto-advance, no button needed
  clearTimeout(_autoAdvTimer);
  _autoAdvTimer = setTimeout(() => nextScreen(), 700);
}

// Opción "Otro" — muestra campo de texto libre
function pickOptOther(el, qId) {
  clearTimeout(_autoAdvTimer);
  const parent = el.closest('.options-grid');
  parent.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers[qId] = 'other';

  const wrap = document.getElementById('otherGoalWrap');
  if (wrap) {
    wrap.style.display = 'block';
    const inp = document.getElementById('otherGoalInput');
    if (inp) setTimeout(() => inp.focus(), 100);
  }
}

function submitOtherGoal() {
  const input = document.getElementById('otherGoalInput');
  const val = input ? input.value.trim() : '';
  if (!val) {
    if (input) {
      input.classList.add('input-error');
      input.placeholder = 'Contanos algo para continuar';
      setTimeout(() => input.classList.remove('input-error'), 1500);
    }
    return;
  }
  answers[13] = 'other';
  sessionStorage.setItem('flOtherGoal', val);
  nextScreen();
}

// =========================================================
// IDENTIFICATION SCALE
// =========================================================
function pickIdent(el, qId) {
  const parent = el.closest('.ident-scale');
  parent.querySelectorAll('.ident-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers[qId] = el.dataset.val;

  clearTimeout(_autoAdvTimer);
  _autoAdvTimer = setTimeout(() => nextScreen(), 600);
}

// =========================================================
// MULTI SELECT OPTION
// =========================================================
function toggleOpt(el, qId) {
  el.classList.toggle('selected');
  if (!multiAnswers[qId]) multiAnswers[qId] = [];

  const val = el.dataset.val;
  if (el.classList.contains('selected')) {
    if (!multiAnswers[qId].includes(val)) multiAnswers[qId].push(val);
  } else {
    multiAnswers[qId] = multiAnswers[qId].filter(v => v !== val);
  }

  // Para sAnxSymptoms usamos un wrapper fijo
  if (qId === 'anx') {
    const wrap = document.getElementById('anxBtnWrap');
    if (wrap) wrap.style.display = multiAnswers[qId].length > 0 ? 'block' : 'none';
    return;
  }

  const btn = document.getElementById('cont' + qId);
  if (btn) {
    btn.classList.toggle('hidden', multiAnswers[qId].length === 0);
  }
}

// =========================================================
// ANALYSIS QUESTIONS + LOADING
// =========================================================
// =========================================================
// ANALYSIS SCREEN — 3 bars + 3 interleaved questions
// =========================================================
const ANALYSIS_QUESTIONS = [
  '¿Sentís que tu nivel de energía no está donde debería estar y que eso te limita en el día a día?',
  '¿El estrés, la ansiedad o el agotamiento emocional interfieren con tu bienestar general?',
  '¿Te cuesta priorizarte y cuidarte a vos mismo/a como realmente merecés?'
];

// Each bar animates to 50%, then a question pops up,
// then on answer it completes to 100% and the next bar starts.
const AG_BAR_IDS    = ['agEnergy', 'agWellness', 'agSelfEsteem'];
const AG_VAL_IDS    = ['agEnergyVal', 'agWellnessVal', 'agSelfEsteemVal'];
const AG_TYPES      = ['energy', 'wellness', 'self'];

let _analysisCallback = null;
let _scores = null;
let _problemScores = null;

function startLoading() {
  _scores = calcScores();
  _problemScores = calcProblemScores();
  updateCompareChart(_scores);

  // Mensajes personalizados según perfil
  const get = (k) => parseInt(answers[k]) || 3;
  const sleepBad  = get(5) <= 2 || get(6) <= 2;
  const stressBad = get(3) <= 2;
  const energyBad = get(2) <= 2 || get(4) <= 2;
  if (sleepBad && stressBad) {
    LOAD_MSGS = [
      'Detectamos estrés acumulado y sueño irregular...',
      'Analizando cómo se afectan entre sí...',
      'Buscando el patrón en tus respuestas...',
      'Comparando con perfiles similares...',
      'Armando tu protocolo personalizado...',
      '¡Tu plan está listo!'
    ];
  } else if (stressBad) {
    LOAD_MSGS = [
      'Detectamos un nivel elevado de estrés...',
      'Analizando tu carga emocional...',
      'Buscando el patrón en tus respuestas...',
      'Comparando con perfiles similares...',
      'Armando tu protocolo personalizado...',
      '¡Tu plan está listo!'
    ];
  } else if (sleepBad) {
    LOAD_MSGS = [
      'Detectamos problemas en tu descanso...',
      'Analizando tus ciclos de sueño...',
      'Buscando el patrón en tus respuestas...',
      'Comparando con perfiles similares...',
      'Armando tu protocolo personalizado...',
      '¡Tu plan está listo!'
    ];
  } else if (energyBad) {
    LOAD_MSGS = [
      'Detectamos bajo nivel de energía...',
      'Analizando tus hábitos diarios...',
      'Buscando el patrón en tus respuestas...',
      'Comparando con perfiles similares...',
      'Armando tu protocolo personalizado...',
      '¡Tu plan está listo!'
    ];
  } else {
    LOAD_MSGS = [
      'Analizando tus respuestas...',
      'Evaluando tu perfil de bienestar...',
      'Buscando el patrón en tus datos...',
      'Comparando con perfiles similares...',
      'Armando tu protocolo personalizado...',
      '¡Tu plan está listo!'
    ];
  }

  // Animar steps estilo Liven
  _runStepPhase(0);
}

/// Anima cada step: 0→50% → pregunta → respuesta → 50→100% → tick → siguiente
function _runStepPhase(idx) {
  if (idx >= 3) { _finishAnalysis(); return; }

  const step    = document.getElementById('astep' + idx);
  const pctEl   = document.getElementById('astepPct' + idx);
  const checkEl = document.getElementById('astepCheck' + idx);
  const barWrap = document.getElementById('analysisBarWrap');
  const bar     = document.getElementById('loadBar');
  const loadPct = document.getElementById('loadPct');

  if (!step) { _finishAnalysis(); return; }

  // Activar step
  step.classList.remove('astep-locked');
  step.classList.add('astep-active');
  if (barWrap) barWrap.style.opacity = '1';

  // Barra principal: step 0→33%, 1→66%, 2→100%
  const mainFrom = [0, 33, 66][idx];
  const mainMid  = [16, 50, 83][idx];   // punto medio (antes de la pregunta)
  const mainTo   = [33, 66, 100][idx];

  // FASE 1: animar 0→50% del step (2s) luego mostrar pregunta
  _animateStepSegment(pctEl, bar, loadPct, 0, 50, mainFrom, mainMid, 2000, () => {
    // Pausa dramática antes de la pregunta
    setTimeout(() => {
      _showOverlayQuestion(idx, () => {
        // FASE 2: post-respuesta, completar 50→100% (1.5s)
        _animateStepSegment(pctEl, bar, loadPct, 50, 100, mainMid, mainTo, 1500, () => {
          // Step completado — mostrar tick
          if (pctEl) pctEl.textContent = '';
          if (checkEl) { checkEl.textContent = '✓'; checkEl.style.opacity = '1'; }
          step.classList.remove('astep-active');
          step.classList.add('astep-done');
          setTimeout(() => _runStepPhase(idx + 1), 500);
        });
      });
    }, 300);
  });
}

// Anima el porcentaje del step y la barra principal en paralelo
function _animateStepSegment(pctEl, bar, loadPct, fromPct, toPct, fromMain, toMain, duration, done) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    if (pctEl) pctEl.textContent = Math.round(fromPct + ease * (toPct - fromPct)) + '%';
    const mainPct = Math.round(fromMain + ease * (toMain - fromMain));
    if (bar) bar.style.width = mainPct + '%';
    if (loadPct) loadPct.textContent = mainPct + '%';
    if (t < 1) requestAnimationFrame(tick);
    else if (done) done();
  }
  requestAnimationFrame(tick);
}

// Animate the top progress bar from current to target %
function _animateMainBar(from, to, done) {
  const bar = document.getElementById('loadBar');
  const pct = document.getElementById('loadPct');
  let cur = from;
  const step = (to - from) / 60;
  const t = setInterval(() => {
    cur = Math.min(to, cur + step);
    bar.style.width = cur + '%';
    pct.textContent = Math.round(cur) + '%';
    if (cur >= to) { clearInterval(t); if (done) done(); }
  }, 30);
}

// Animate an ag-bar from 0 to mid (50% of real score), then pause for question
function _runBarPhase(idx) {
  if (idx >= AG_BAR_IDS.length) {
    _finishAnalysis();
    return;
  }

  const barEl  = document.getElementById(AG_BAR_IDS[idx]);
  // Usar scores REALES pero bajos — barras cortas muestran lejos del objetivo
  const s = _scores || calcScores();
  const raw = [s.energy, s.wellness, s.selfEsteem][idx];
  // Cap en 38% máximo para que siempre se vea bajo
  const target = Math.min(raw, 38);
  const mid    = Math.round(target * 0.5);
  const mainBarTargets = [33, 66, 95];

  // Animate ag-bar to mid
  _animateAgBarTo(barEl, 0, mid, 900, () => {
    // Also move main bar forward
    const prevMain = [8, 36, 64][idx];
    _animateMainBar(prevMain, mainBarTargets[idx] - 4, () => {
      // Show question
      _showOverlayQuestion(idx, () => {
        // Answer given — complete the bar to full
        _animateAgBarTo(barEl, mid, target, 700, () => {
          const valEl = document.getElementById(AG_VAL_IDS[idx]);
          if (valEl) valEl.textContent = scoreLabel(target, AG_TYPES[idx]);
          _animateMainBar(mainBarTargets[idx] - 4, mainBarTargets[idx], () => {
            setTimeout(() => _runBarPhase(idx + 1), 400);
          });
        });
      });
    });
  });
}

function _animateAgBarTo(el, from, to, duration, done) {
  if (!el) { if (done) done(); return; }
  let cur = from;
  const steps = 40;
  const inc = (to - from) / steps;
  const interval = duration / steps;
  const t = setInterval(() => {
    cur = Math.min(to, cur + inc);
    el.style.width = cur + '%';
    if (cur >= to) { clearInterval(t); if (done) done(); }
  }, interval);
}

function _showOverlayQuestion(idx, done) {
  const overlay = document.getElementById('aqOverlay');
  const textEl  = document.getElementById('aqOverlayText');
  if (!overlay || !textEl) { if (done) done(); return; }

  textEl.textContent = ANALYSIS_QUESTIONS[idx];
  overlay.classList.remove('aq-overlay-hidden');
  overlay.classList.add('aq-overlay-show');

  _analysisCallback = () => {
    overlay.classList.remove('aq-overlay-show');
    overlay.classList.add('aq-overlay-hide');
    setTimeout(() => {
      overlay.classList.add('aq-overlay-hidden');
      overlay.classList.remove('aq-overlay-hide');
      if (done) done();
    }, 380);
  };
}

function selectNoneAnx(el) {
  // Deseleccionar todas las otras opciones
  document.querySelectorAll('#optsAnx .opt:not(.opt-none)').forEach(o => o.classList.remove('selected'));
  el.classList.toggle('selected');
  multiAnswers['anx'] = el.classList.contains('selected') ? ['none'] : [];
  const wrap = document.getElementById('anxBtnWrap');
  if (wrap) wrap.style.display = multiAnswers['anx'].length > 0 ? 'block' : 'none';
}

function answerAnalysis(btn) {
  if (!_analysisCallback) return;
  btn.closest('.aq-btns').querySelectorAll('.aq-btn').forEach(b => b.classList.remove('aq-sel'));
  btn.classList.add('aq-sel');
  const cb = _analysisCallback;
  _analysisCallback = null;
  setTimeout(() => cb(), 300);
}

function _finishAnalysis() {
  // Meta Pixel — CompleteRegistration (terminó el quiz)
  if (typeof fbq !== 'undefined') fbq('track', 'CompleteRegistration', { content_name: 'Florecer Quiz Completado' });
  setTimeout(() => goTo(SCREENS.indexOf('sEmail')), 1200);
}

// =========================================================
// PERSONALIZAR PANTALLA SISTEMA NERVIOSO (sIdent3b)
// =========================================================
function personalizeIdent3b() {
  const selected = (multiAnswers['anx'] || []).filter(v => v !== 'none');
  const bodyEl = document.getElementById('anxIntBody');
  if (!bodyEl || selected.length === 0) return;

  const labels = {
    nails:     'morderte las uñas o la piel sin querer',
    eat:       'comer por nervios aunque no tengas hambre',
    phone:     'revisar el celular compulsivamente',
    jaw:       'apretar la mandíbula sin darte cuenta',
    stomach:   'el estómago revuelto cuando hay tensión',
    sigh:      'suspirar seguido o sentir que falta el aire',
    control:   'necesitar tener todo bajo control',
    irritable: 'irritarte por cosas pequeñas que antes no te molestaban'
  };

  const items = selected.slice(0, 2).map(v => labels[v]).filter(Boolean);
  if (items.length === 0) return;

  const listed = items.length === 2 ? `${items[0]} y ${items[1]}` : items[0];
  const capitalized = listed.charAt(0).toUpperCase() + listed.slice(1);
  bodyEl.textContent = `${capitalized} — eso no son "manías" ni debilidad. Son señales físicas de que tu cuerpo lleva demasiado tiempo en modo alerta. Y eso tiene solución.`;
}

// =========================================================
// SCORES: calculate from answers
// =========================================================
function calcScores() {
  const a = answers;
  const get = (k) => parseInt(a[k]) || 2;
  // energy: morning (q2) + daytime (q4). 1=bad, 4=good → invertimos para mostrar el PROBLEMA
  const energy     = Math.round(((get(2) + get(4)) / 8) * 100);
  const wellness   = Math.round(((get(6) + get(7)) / 8) * 100);
  const selfEsteem = Math.round(((get(8) + get(10)) / 8) * 100);
  return { energy, wellness, selfEsteem };
}

// Versión invertida para mostrar el NIVEL DE PROBLEMA (alto = peor situación)
function calcProblemScores() {
  const s = calcScores();
  // Invertir: si energía es 75% (buena), el problema es 25% (bajo)
  // Si energía es 25% (mala), el problema es 75% (alto → rojo → urge comprar)
  return {
    energy:     Math.max(15, 100 - s.energy),
    wellness:   Math.max(15, 100 - s.wellness),
    selfEsteem: Math.max(15, 100 - s.selfEsteem)
  };
}

// scoreLabel — muestra el % actual (bajo para generar urgencia)
function scoreLabel(score, type) {
  return score + '%';
}

// currentLabel — para columna "Ahora" (varía entre Bajo y Moderado)
function currentLabel(score) {
  const penalized = score - 25;
  const r = Math.random();
  if (penalized <= 20) return r < 0.8 ? 'Bajo' : 'Moderado';
  if (penalized <= 40) return r < 0.5 ? 'Bajo' : 'Moderado';
  return r < 0.4 ? 'Bajo' : 'Moderado';
}

function animateAgBar(id, pct, labelEl, label) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(pct, cur + 1.5);
    el.style.width = cur + '%';
    if (cur >= pct) {
      clearInterval(t);
      if (labelEl) labelEl.textContent = label;
    }
  }, 18);
}

function updateCompareChart(scores) {
  // Calcular 5 dimensiones y mostrar las 3 peores del usuario
  const get2 = (k) => parseInt(answers[k]) || 2;
  const dims = [
    { score: (get2(2)+get2(4))/8*100, nameBef:'Nivel de energía',      nameAft:'Energía y vitalidad',    lblLow:'Bajo',     lblHigh:'Alto' },
    { score: (get2(5)+get2(6))/8*100, nameBef:'Calidad del sueño',     nameAft:'Descanso reparador',     lblLow:'Mala',     lblHigh:'Profundo' },
    { score: (get2(3)+get2(7))/8*100, nameBef:'Estrés y ansiedad',     nameAft:'Calma interior',         lblLow:'Alto',     lblHigh:'Bajo' },
    { score: get2(10)/4*100,           nameBef:'Foco y concentración',  nameAft:'Claridad mental',        lblLow:'Difuso',   lblHigh:'Enfocado' },
    { score: get2(8)/4*100,            nameBef:'Relaciones personales', nameAft:'Vínculos equilibrados',  lblLow:'Afectado', lblHigh:'Fluido' }
  ];
  dims.sort((a, b) => a.score - b.score);
  const worst3 = dims.slice(0, 3);

  // Actualizar nombres y labels de las 3 filas con las peores dimensiones del usuario
  const metCards = document.querySelectorAll('#sSales .cmp-metric-card');
  if (metCards.length >= 2) {
    const befMetrics = metCards[0].querySelectorAll('.cmp-metric');
    const aftMetrics = metCards[1].querySelectorAll('.cmp-metric');
    worst3.forEach((d, i) => {
      if (befMetrics[i]) {
        const nm = befMetrics[i].querySelector('.cmp-metric-name');
        const sb = befMetrics[i].querySelector('.cmp-metric-sub');
        if (nm) nm.textContent = d.nameBef;
        if (sb) { sb.textContent = d.lblLow; sb.className = 'cmp-metric-sub low-text'; }
      }
      if (aftMetrics[i]) {
        const nm = aftMetrics[i].querySelector('.cmp-metric-name');
        const sb = aftMetrics[i].querySelector('.cmp-metric-sub');
        if (nm) nm.textContent = d.nameAft;
        if (sb) { sb.textContent = d.lblHigh; sb.className = 'cmp-metric-sub high-text'; }
      }
    });
  }

  // Segs "Ahora": siempre 1 de 3 llenado (visualmente malo)
  const segs = document.querySelectorAll('#sSales .cmp-metric-card:first-child .cmp-segs .cmp-seg');
  segs.forEach((seg, i) => seg.classList.toggle('filled', i < 1));

  // Slider "Ahora": cap en 22% para que siempre se vea bajo
  const nowSliderPct = Math.min(22, Math.round(scores.selfEsteem * 0.25));
  const fill  = document.querySelector('#sSales .cmp-metric-card:first-child .cmp-slider-fill');
  const thumb = document.querySelector('#sSales .cmp-metric-card:first-child .cmp-slider-thumb');
  if (fill)  { fill.style.transition  = 'width 1.2s cubic-bezier(.4,0,.2,1)';  fill.style.width = nowSliderPct + '%'; }
  if (thumb) { thumb.style.transition = 'left 1.2s cubic-bezier(.4,0,.2,1)';   thumb.style.left = nowSliderPct + '%'; }
}

// =========================================================
// SHOW SALES + PERSONALIZE
// =========================================================
function showSales() {
  // Meta Pixel — ViewContent (ve la página de venta)
  if (typeof fbq !== 'undefined') fbq('track', 'ViewContent', { content_name: 'Florecer Sales Page' });
  goTo(SCREENS.indexOf('sSales'));

  // Resultado personalizado por perfil dominante
  const get = (k) => parseInt(answers[k]) || 3;
  const name = sessionStorage.getItem('flName') || '';
  const prevAttempt = answers['prev'];

  // Determinar perfil dominante
  const sleepBad    = get(5) <= 2 || get(6) <= 2;
  const stressBad   = get(3) <= 2;
  const energyBad   = get(2) <= 2 || get(4) <= 2;
  const emotionBad  = get(7) <= 2 || get(8) <= 2;

  let profile = 'general';
  if (sleepBad && stressBad) profile = 'stress_sleep';
  else if (stressBad || emotionBad) profile = 'stress';
  else if (sleepBad) profile = 'sleep';
  else if (energyBad) profile = 'energy';

  const profiles = {
    stress_sleep: {
      title: name ? `¡Tu plan está listo, ${name}!` : '¡Tu plan está listo!',
      subtitle: `Detectamos estrés acumulado y sueño irregular — están conectados. El 81% de personas con tu perfil mejora significativamente en la semana 2.`
    },
    stress: {
      title: name ? `¡Tu plan está listo, ${name}!` : '¡Tu plan está listo!',
      subtitle: `Detectamos un nivel elevado de estrés y agotamiento emocional. Tiene una causa concreta — y tu guía está diseñada para resolverla.`
    },
    sleep: {
      title: name ? `¡Tu plan está listo, ${name}!` : '¡Tu plan está listo!',
      subtitle: `Tu descanso está afectando tu energía y humor diario. El 74% de personas con tu perfil duerme mejor en los primeros 7 días.`
    },
    energy: {
      title: name ? `¡Tu plan está listo, ${name}!` : '¡Tu plan está listo!',
      subtitle: `Detectamos baja energía crónica. No es falta de voluntad — tu sistema nervioso está sobreexigido. Tu guía empieza a revertir esto desde el día 1.`
    },
    general: {
      title: name ? `¡Tu plan está listo, ${name}!` : '¡Tu plan está listo!',
      subtitle: `Armamos tu guía diaria personalizada según tus respuestas. Personas con tu perfil reportan mejoras en energía, sueño y bienestar desde la semana 2.`
    }
  };

  const prevNote = (prevAttempt === 'tried_failed' || prevAttempt === 'tried_partial')
    ? ' Esta vez está adaptado exactamente a vos.'
    : '';

  const p = profiles[profile];
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.textContent = p.title;
  const subtitle = document.getElementById('resultSubtitle');

  // Personalizar con origen del estrés (q12) y objetivo (q13)
  const stressLabels = {
    work:     'el trabajo y las responsabilidades laborales',
    family:   'las relaciones familiares o de pareja',
    money:    'la incertidumbre económica',
    overload: 'tener demasiado para hacer y poco tiempo',
    unknown:  'un agotamiento sin una causa clara'
  };
  const goalLabels = {
    energy:  'recuperar energía y vitalidad',
    calm:    'encontrar calma y reducir el estrés',
    emotion: 'mejorar tu estado emocional',
    relations: 'mejorar tus vínculos y relaciones personales',
    sleep:   'mejorar la calidad de tu sueño',
    focus:   'aumentar tu foco y productividad',
    all:     'lograr una transformación completa'
  };
  const stressStr = stressLabels[answers[12]];
  const goalStr   = goalLabels[answers[13]];
  let extraLine = '';
  if (stressStr && goalStr) {
    extraLine = ` Lo que más te pesa es ${stressStr}, y tu objetivo es ${goalStr}.`;
  } else if (goalStr) {
    extraLine = ` Tu objetivo principal es ${goalStr}.`;
  }
  if (subtitle) subtitle.textContent = p.subtitle + prevNote + extraLine;

  // Scarcity counter — semi-random between 118 and 147
  const sc = document.getElementById('scarcityCount');
  if (sc) sc.textContent = Math.floor(118 + Math.random() * 30);

  // Countdown timer
  startCountdown();

  // Animate compare chart with real scores
  setTimeout(() => {
    const scores = calcScores();
    updateCompareChart(scores);
    // Animate the sales-page chart bars
    document.querySelectorAll('.chart-bar').forEach((bar, i) => {
      setTimeout(() => bar.classList.add('animated'), i * 80);
    });
  }, 400);

  const gender = sessionStorage.getItem('flGender') || selectedGender || 'female';
  const imgs = IMAGES[gender] || IMAGES.female;

  const imgBefore = document.getElementById('imgBefore');
  const imgAfter  = document.getElementById('imgAfter');

  if (imgBefore) { imgBefore.src = imgs.before; imgBefore.classList.remove('cmp-visible'); }
  if (imgAfter)  { imgAfter.src  = imgs.after;  imgAfter.classList.remove('cmp-visible'); }

  // Animate comparison images in after load
  setTimeout(() => {
    if (imgBefore) imgBefore.classList.add('cmp-visible');
    if (imgAfter)  imgAfter.classList.add('cmp-visible');
  }, 350);

  // Re-run observers for sales page
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      revealObs.observe(el);
    });
    const chartEl = document.getElementById('chartBars');
    if (chartEl) chartObs.observe(chartEl);
  }, 200);
}

// =========================================================
// COMMIT SCREEN
// =========================================================
function submitCommit() {
  const input = document.getElementById('commitNameInput');
  const val = input ? input.value.trim() : '';
  if (!val) {
    input.classList.add('input-error');
    input.placeholder = 'Escribí tu nombre para continuar';
    setTimeout(() => input.classList.remove('input-error'), 1500);
    return;
  }
  sessionStorage.setItem('flName', val);
  const box = document.getElementById('commitBox');
  if (box) box.style.display = 'block';
  const btn = document.getElementById('commitBtn');
  if (btn) { btn.textContent = '✓ ¡Listo! Preparando tu plan...'; btn.disabled = true; }
  setTimeout(() => nextScreen(), 900);
}

// Mostrar box de intención al escribir nombre
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('commitNameInput');
  if (!inp) return;
  inp.addEventListener('input', () => {
    const box = document.getElementById('commitBox');
    const promise = document.getElementById('commitPromiseText');
    if (!box) return;
    if (inp.value.trim().length > 1) {
      box.style.display = 'block';
      const nameDisplay = document.getElementById('commitNameDisplay');
      if (nameDisplay) nameDisplay.textContent = inp.value.trim();
    } else {
      box.style.display = 'none';
    }
  });
});

// =========================================================
// EMAIL + NAME CAPTURE
// =========================================================
function submitEmail() {
  const input = document.getElementById('emailInput');
  const val = input ? input.value.trim() : '';
  if (!val || !val.includes('@')) {
    input.classList.add('input-error');
    input.placeholder = 'Ingresá un email válido';
    setTimeout(() => input.classList.remove('input-error'), 1500);
    return;
  }
  sessionStorage.setItem('flEmail', val);

  // Meta Pixel — Lead
  if (typeof fbq !== 'undefined') fbq('track', 'Lead', { content_name: 'Florecer Quiz' });

  // Enviar a Formspree (silencioso, no bloquea el flujo)
  fetch('https://formspree.io/f/mreonoqk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email: val,
      nombre: sessionStorage.getItem('flName') || '',
      genero: answers['gender'] || ''
    })
  }).catch(() => {});

  // Enviar a Brevo para email marketing
  fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: val, nombre: sessionStorage.getItem('flName') || '' })
  }).catch(() => {});

  // Si ya capturamos el nombre en sCommit, saltear sName
  const savedName = sessionStorage.getItem('flName');
  if (savedName) {
    goTo(SCREENS.indexOf('sChart'));
    setTimeout(() => initWellnessChart(savedName), 400);
  } else {
    goTo(SCREENS.indexOf('sName'));
  }
}

function submitName() {
  const input = document.getElementById('nameInput');
  const val = input ? input.value.trim() : '';
  if (!val) {
    input.classList.add('input-error');
    input.placeholder = 'Ingresá tu nombre';
    setTimeout(() => input.classList.remove('input-error'), 1500);
    return;
  }
  sessionStorage.setItem('flName', val);
  goTo(SCREENS.indexOf('sChart'));
  setTimeout(() => initWellnessChart(val), 400);
}

// =========================================================
// WELLNESS CHART (sChart)
// =========================================================
function initWellnessChart(name) {
  const nameEl = document.getElementById('wchartName');
  if (nameEl) nameEl.textContent = name ? name + ',' : '';

  const clipRect = document.getElementById('wcClipRect');
  const tipToday = document.getElementById('wcTipToday');
  const tipGoal  = document.getElementById('wcTipGoal');
  const dotToday = document.getElementById('wcDotToday');
  const dotGoal  = document.getElementById('wcDotGoal');

  // Curva dinámica según el score total del usuario
  // avgScore bajo → curva arranca muy abajo (gran caída → gran mejora visual)
  // avgScore alto → curva arranca más arriba (mejora moderada)
  const sc = calcScores();
  const avgScore = (sc.energy + sc.wellness + sc.selfEsteem) / 3;
  const startY   = Math.round(178 - (avgScore / 100) * 60); // rango 118–178
  const cp1y     = startY - 6;
  const cp2y     = Math.round(28 + (startY - 28) * 0.35);
  const wcLine   = document.querySelector('#sChart .wc-line-solid');
  const wcFill   = document.querySelector('#sChart .wc-fill-solid');
  if (wcLine) wcLine.setAttribute('d', `M 38 ${startY} C 120 ${cp1y}, 200 ${cp2y}, 322 28`);
  if (wcFill) wcFill.setAttribute('d', `M 38 ${startY} C 120 ${cp1y}, 200 ${cp2y}, 322 28 L 322 198 L 38 198 Z`);
  if (dotToday) dotToday.setAttribute('cy', startY);

  // Reset
  if (clipRect) clipRect.setAttribute('width', '0');
  if (tipToday) tipToday.classList.remove('wc-tip-visible');
  if (tipGoal)  tipGoal.classList.remove('wc-tip-visible');
  if (dotToday) dotToday.style.opacity = '0';
  if (dotGoal)  dotGoal.style.opacity  = '0';

  // Animate clip rect from 0 → 360 over 1400ms using rAF
  const duration = 1400;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease in-out quad
    const w = Math.round(ease * 360);
    if (clipRect) clipRect.setAttribute('width', w);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Done — show dots and tooltips
      if (dotToday) dotToday.style.cssText = 'opacity:1;transition:opacity .3s ease';
      setTimeout(() => {
        if (dotGoal)  dotGoal.style.cssText  = 'opacity:1;transition:opacity .3s ease';
        if (tipToday) tipToday.classList.add('wc-tip-visible');
        setTimeout(() => { if (tipGoal) tipGoal.classList.add('wc-tip-visible'); }, 400);
      }, 200);
    }
  }
  requestAnimationFrame(step);
}

// =========================================================
// COUNTDOWN TIMER — 37 minutos
// =========================================================
function startCountdown() {
  const stored = localStorage.getItem('flCountdownEnd');
  let endTime;
  if (stored) {
    endTime = parseInt(stored);
  } else {
    endTime = Date.now() + 37 * 60 * 1000; // 37 minutos
    localStorage.setItem('flCountdownEnd', endTime);
  }

  function update() {
    const remaining = Math.max(0, endTime - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    const fmt = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    ['countdownTimer', 'countdownTimer2', 'stickyTimer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = fmt;
    });

    if (remaining > 0) setTimeout(update, 1000);
  }
  update();
}

// =========================================================
// PLAN SELECTION
// =========================================================
let _selectedPlan = null;

// Config dinámica de upsell según el plan elegido
const UPSELL_CONFIG = {
  trial: {
    planName:   'Plan de 3 Meses',
    sub:        'Como acabás de unirte, podés pasar al <strong>Plan de 3 Meses</strong> pagando solo la diferencia — una sola vez.',
    original:   '$59.990',
    price:      '$14.990',
    saving:     'Ahorrás $45.000 — solo disponible ahora',
    btnText:    'SÍ, QUIERO EL PLAN DE 3 MESES →',
    bullets:    ['✓ 3 meses de guía completa', '✓ Técnicas de manejo del estrés', '✓ Rutinas de sueño y energía', '✓ Acceso inmediato'],
    upsellPlan: '4weeks-upsell'
  },
  '4weeks': {
    planName:   'Plan de 6 Meses',
    sub:        'Como acabás de unirte, podés acceder al <strong>Plan de 6 Meses</strong> por solo la diferencia — una sola vez.',
    original:   '$99.990',
    price:      '$29.990',
    saving:     'Ahorrás $70.000 — solo disponible ahora',
    btnText:    'SÍ, QUIERO EL PLAN DE 6 MESES →',
    bullets:    ['✓ Transformación completa de 6 meses', '✓ Sistema de hábitos avanzados', '✓ Técnicas de neuroplasticidad', '✓ Acceso inmediato'],
    upsellPlan: '12weeks-upsell'
  }
};

function selectPlan(plan) {
  // Meta Pixel — AddToCart + InitiateCheckout
  const planNames = { trial: 'Plan 1 Mes', '4weeks': 'Plan 3 Meses', '12weeks': 'Plan 6 Meses' };
  const planPrices = { trial: 9990, '4weeks': 24990, '12weeks': 54990 };
  if (typeof fbq !== 'undefined') fbq('track', 'AddToCart', {
    content_name: planNames[plan] || plan,
    value: planPrices[plan] || 0,
    currency: 'ARS'
  });
  if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout', {
    content_name: planNames[plan] || plan,
    value: planPrices[plan] || 0,
    currency: 'ARS'
  });

  if (plan === '12weeks') {
    _goToTN('12weeks');
    return;
  }
  _selectedPlan = plan;
  _populateUpsell(plan);
  goTo(SCREENS.indexOf('sUpsell'));
}

function _populateUpsell(plan) {
  const cfg = UPSELL_CONFIG[plan];
  if (!cfg) return;
  document.getElementById('upsellSub').innerHTML       = cfg.sub;
  document.getElementById('upsellPlanName').textContent = cfg.planName;
  document.getElementById('upsellOriginal').textContent = cfg.original;
  document.getElementById('upsellPrice').textContent    = cfg.price;
  document.getElementById('upsellSaving').textContent   = cfg.saving;
  document.getElementById('upsellBtn').textContent      = cfg.btnText;
  const ul = document.getElementById('upsellBullets');
  ul.innerHTML = cfg.bullets.map(b => `<li>${b}</li>`).join('');
}

function acceptUpsell() {
  // Meta Pixel — AddToCart + InitiateCheckout (acepta el upsell)
  const upsellPrices = { trial: 14990, '4weeks': 29990 };
  if (typeof fbq !== 'undefined') fbq('track', 'AddToCart', { content_name: 'Upsell Aceptado', value: upsellPrices[_selectedPlan] || 0, currency: 'ARS' });
  if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout', { content_name: 'Upsell Aceptado', value: upsellPrices[_selectedPlan] || 0, currency: 'ARS' });
  const cfg = UPSELL_CONFIG[_selectedPlan];
  _goToTN(cfg ? cfg.upsellPlan : '12weeks-upsell');
}

function skipUpsell() {
  _goToTN(_selectedPlan || 'trial');
}

function _goToTN(plan) {

  const productIds = {
    trial:           '335417321',
    '4weeks':        '335421128',
    '12weeks':       '335424119',
    '4weeks-upsell': '336768704',   // plan 4 semanas a $14.990 (precio upsell)
    '12weeks-upsell':'336752767'
  };
  const id = productIds[plan];
  if (!id) return;

  // POST con buy_now en el body — Tienda Nube requiere POST para checkout directo
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://florecer60.mitiendanube.com/comprar/';
  form.style.display = 'none';

  const fields = { add_to_cart: id, quantity: '1', buy_now: '1' };
  for (const [k, v] of Object.entries(fields)) {
    const inp = document.createElement('input');
    inp.type = 'hidden'; inp.name = k; inp.value = v;
    form.appendChild(inp);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// =========================================================
// FAQ
// =========================================================
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  document.querySelectorAll('.faq-q.open').forEach(q => {
    q.classList.remove('open');
    if (q.nextElementSibling) q.nextElementSibling.classList.remove('open');
  });

  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

// =========================================================
// SCROLL OBSERVERS
// =========================================================
let revealObs, chartObs;

function setupObservers() {
  // Reveal on scroll
  revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Chart bars
  chartObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.chart-bar');
        bars.forEach((bar, i) => {
          setTimeout(() => bar.classList.add('animated'), i * 80);
        });
        chartObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  // Observe existing
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  const chartEl = document.getElementById('chartBars');
  if (chartEl) chartObs.observe(chartEl);

  // Watch for sales page activation
  const salesEl = document.getElementById('sSales');
  if (salesEl) {
    new MutationObserver(() => {
      if (salesEl.classList.contains('active')) {
        setTimeout(() => {
          document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObs.observe(el));
          const cb = document.getElementById('chartBars');
          if (cb) chartObs.observe(cb);
        }, 300);
      }
    }).observe(salesEl, { attributes: true, attributeFilter: ['class'] });
  }
}

// =========================================================
// STAIRCASE ANIMATION
// =========================================================
function animateStairs() {
  const bars = document.querySelectorAll('.stair-bar');
  bars.forEach((bar, i) => {
    setTimeout(() => bar.classList.add('animated'), i * 140);
  });
}

// =========================================================
// RIPPLE EFFECT ON BUTTONS
// =========================================================
function setupRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-capture, .btn-continue, .btn-cta-main');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// =========================================================
// COUNTER ANIMATION FOR STATS
// =========================================================
function setupCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isFloat = String(target).includes('.');
      const duration = 1400;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = target * eased;
        el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('es-AR');
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}
