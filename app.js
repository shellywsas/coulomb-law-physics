/**
 * Coulomb's Law Interactive Learning Website
 * Logic for Simulation, Live Calculator, Quiz Engine & A4 Printing
 */

// Global state
const state = {
  q1: 5,     // in micro-Coulombs (µC)
  q2: 5,     // in micro-Coulombs (µC)
  r: 0.10,   // in meters (m)
  k: 8.99e9  // N * m^2 / C^2
};

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const printBtn = document.getElementById('btn-print');

// Canvas Elements
const canvas = document.getElementById('coulombCanvas');
let ctx = null;
if (canvas) {
  ctx = canvas.getContext('2d');
}

// Sliders & Value Displays
const q1Slider = document.getElementById('q1-slider');
const q2Slider = document.getElementById('q2-slider');
const rSlider = document.getElementById('r-slider');

const q1ValDisplay = document.getElementById('q1-val-display');
const q2ValDisplay = document.getElementById('q2-val-display');
const rValDisplay = document.getElementById('r-val-display');

const canvasDistDisplay = document.getElementById('canvas-dist-display');
const canvasForceDisplay = document.getElementById('canvas-force-display');
const simForceTypeBadge = document.getElementById('sim-force-type-badge');

// Preset Buttons
const btnResetSim = document.getElementById('btn-reset-sim');
const btnOppositeCharges = document.getElementById('btn-opposite-charges');

// Calculator Displays
const calcQ1SI = document.getElementById('calc-q1-si');
const calcQ2SI = document.getElementById('calc-q2-si');
const calcRSI = document.getElementById('calc-r-si');
const calcFormulaSub = document.getElementById('calc-formula-sub');
const calcResultForce = document.getElementById('calc-result-force');
const calcResultNature = document.getElementById('calc-result-nature');

// Quiz Data
const quizQuestions = [
  {
    id: 1,
    title: 'שאלה 1: תלות במרחק (חוק ריבוע הפוך)',
    question: 'שני מטענים נקודתיים מפעילים זה על זה כוח חשמלי של 18 ניוטון. אם נגדיל את המרחק ביניהם פי 3, מה יהיה גודל הכוח החדש?',
    options: [
      '54 ניוטון (הכוח יגדל פי 3)',
      '6 ניוטון (הכוח יקטן פי 3)',
      '2 ניוטון (הכוח יקטן פי 9)',
      '0.67 ניוטון (הכוח יקטן פי 27)'
    ],
    correctIndex: 2,
    explanation: 'נכון מאוד! לפי חוק קולון הכוח תלוי ביחס הפוך לריבוע המרחק (1/r²). הגדלת המרחק פי 3 גורמת להקטנת הכוח פי 3² = 9. לכן: 18 חלקי 9 = 2 ניוטון.'
  },
  {
    id: 2,
    title: 'שאלה 2: החוק השלישי של ניוטון',
    question: 'מטען A של +100µC מונח ליד מטען B קטן של +1µC. איזה מהמשפטים הבאים נכון לגבי הכוחות ביניהם?',
    options: [
      'מטען A מפעיל על B כוח גדול פי 100 מהכוח ש-B מפעיל על A.',
      'שני המטענים מפעילים זה על זה כוחות שווים בדיוק בגודלם ומנוגדים בכיוונם.',
      'מטען B מרגיש כוח גדול יותר כי הוא קטן וקל יותר.',
      'מטען A כלל אינו מרגיש כוח כי מטענו חזק יותר.'
    ],
    correctIndex: 1,
    explanation: 'מצוין! לפי החוק השלישי של ניוטון, כל כוח בטבע מופיע בזוג פעולה ותגובה: הכוח שמטען A מפעיל על B שווה תמיד בגודלו ומנוגד בכיוונו לכוח ש-B מפעיל על A, ללא כל קשר לגודל המטענים!'
  },
  {
    id: 3,
    title: 'שאלה 3: יחידות מידה של קבוע קולון k',
    question: 'מהן יחידות המידה התקניות (SI) של קבוע קולון k?',
    options: [
      'ניוטון כפול קולון חלקי מטר (N · C / m)',
      'ניוטון כפול מטר בריבוע חלקי קולון בריבוע (N · m² / C²)',
      'קולון בריבוע חלקי ניוטון כפול מטר (C² / (N · m))',
      'ג׳אול כפול מטר (J · m)'
    ],
    correctIndex: 1,
    explanation: 'מדויק! מבידוד k בנוסחה F = k(q₁q₂/r²) מקבלים k = F·r² / (q₁q₂), ולכן היחידות הן N·m²/C².'
  },
  {
    id: 4,
    title: 'שאלה 4: איפוס כוח בין מטענים',
    question: 'שני מטענים חיוביים מקובעים בנקודות x = 0 ו-x = 10 ס״מ. היכן על ציר ה-X תיתכן נקודת שיווי משקל (איפוס כוח שקול) למטען שלישי חופשי?',
    options: [
      'אך ורק בקטע שבין המטענים (0 < x < 10 ס״מ)',
      'משמאל למטען הראשון (x < 0)',
      'מימין למטען השני (x > 10 ס״מ)',
      'בכל נקודה על ציר ה-X'
    ],
    correctIndex: 0,
    explanation: 'נכון! עבור שני מטענים שווי סימן, הכוחות על מטען ביניהם פועלים בכיוונים מנוגדים ויכולים לבטל זה את זה. מחוץ לקטע שביניהם שני הכוחות יפעלו באותו כיוון ולעולם לא יתאפסו.'
  },
  {
    id: 5,
    title: 'שאלה 5: שיתוף מטען במגע',
    question: 'שני כדורים מוליכים זהים טעונים ב-+6µC וב--2µC. נוגעים ביניהם ומפרידים אותם. מה המטען הסופי על כל כדור?',
    options: [
      '+4µC על כל אחד',
      '+2µC על כל אחד',
      '0 (הם מתפרקים לחלוטין)',
      '+3µC ו--1µC'
    ],
    correctIndex: 1,
    explanation: 'מעולה! סך המטען הכולל הוא (+6µC) + (-2µC) = +4µC. במגע בין כדורים זהים המטען מתחלק שווה בשווה: 4µC / 2 = +2µC על כל כדור.'
  }
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSliders();
  initPresetButtons();
  initExerciseAccordions();
  initQuiz();
  initPrint();
  updateCalculationsAndCanvas();
  renderLatexMath();
});

/**
 * Trigger KaTeX math render safely
 */
function renderLatexMath() {
  if (window.renderMathInElement) {
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn('KaTeX render error:', e);
    }
  } else {
    // Retry once KaTeX finishes loading from CDN
    setTimeout(() => {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }, 500);
  }
}

/**
 * Tabs System
 */
function initTabs() {
  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      navTabs.forEach(b => b.classList.toggle('active', b === btn));
      tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === `tab-${targetTab}`));

      // If switching to simulator tab, redraw canvas
      if (targetTab === 'simulator') {
        setTimeout(updateCalculationsAndCanvas, 50);
      }

      // Re-render math if needed
      renderLatexMath();
    });
  });
}

/**
 * Sliders & Controls
 */
function initSliders() {
  if (q1Slider) {
    q1Slider.addEventListener('input', e => {
      state.q1 = parseFloat(e.target.value);
      updateCalculationsAndCanvas();
    });
  }

  if (q2Slider) {
    q2Slider.addEventListener('input', e => {
      state.q2 = parseFloat(e.target.value);
      updateCalculationsAndCanvas();
    });
  }

  if (rSlider) {
    rSlider.addEventListener('input', e => {
      state.r = parseFloat(e.target.value);
      updateCalculationsAndCanvas();
    });
  }
}

/**
 * Preset Buttons
 */
function initPresetButtons() {
  if (btnResetSim) {
    btnResetSim.addEventListener('click', () => {
      state.q1 = 5;
      state.q2 = 5;
      state.r = 0.10;
      q1Slider.value = 5;
      q2Slider.value = 5;
      rSlider.value = 0.10;
      updateCalculationsAndCanvas();
    });
  }

  if (btnOppositeCharges) {
    btnOppositeCharges.addEventListener('click', () => {
      state.q1 = 8;
      state.q2 = -8;
      state.r = 0.12;
      q1Slider.value = 8;
      q2Slider.value = -8;
      rSlider.value = 0.12;
      updateCalculationsAndCanvas();
    });
  }
}

/**
 * Exercise Accordions Toggle
 */
function initExerciseAccordions() {
  document.querySelectorAll('.toggle-solution-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const solution = btn.nextElementSibling;
      const isHidden = solution.classList.contains('hidden');
      solution.classList.toggle('hidden', !isHidden);
      btn.textContent = isHidden ? '🙈 הסתר פתרון' : '🔍 הצג פתרון מלא מודרך';
      renderLatexMath();
    });
  });
}

/**
 * Print Trigger
 */
function initPrint() {
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * Core Physics Calculation and Canvas Drawing
 */
function updateCalculationsAndCanvas() {
  // Update Slider Label Displays
  if (q1ValDisplay) q1ValDisplay.textContent = `${state.q1 > 0 ? '+' : ''}${state.q1} µC`;
  if (q2ValDisplay) q2ValDisplay.textContent = `${state.q2 > 0 ? '+' : ''}${state.q2} µC`;
  if (rValDisplay) rValDisplay.textContent = `${state.r.toFixed(2)} מטר (${Math.round(state.r * 100)} ס״מ)`;

  // Convert to SI Units
  const q1SI = state.q1 * 1e-6; // Coulombs
  const q2SI = state.q2 * 1e-6; // Coulombs
  const rSI = state.r;          // Meters

  // Calculate Coulomb Force Magnitude
  let force = 0;
  if (rSI > 0) {
    force = state.k * (Math.abs(q1SI * q2SI) / (rSI * rSI));
  }

  // Determine Nature (Attraction vs Repulsion)
  const isRepulsion = (state.q1 * state.q2) > 0;
  const isNeutral = state.q1 === 0 || state.q2 === 0;

  let natureText = '';
  let badgeClass = 'badge-info';

  if (isNeutral) {
    natureText = 'אין כוח חשמלי (אחד המטענים ניטרלי = 0)';
    badgeClass = 'badge-warning';
  } else if (isRepulsion) {
    natureText = 'כוח דחייה הדדי (מטענים שווי סימן דוחים זה את זה)';
    badgeClass = 'badge-danger';
  } else {
    natureText = 'כוח משיכה הדדי (מטענים שוני סימן מושכים זה את זה)';
    badgeClass = 'badge-success';
  }

  if (simForceTypeBadge) {
    simForceTypeBadge.textContent = isNeutral ? 'ניטרלי' : (isRepulsion ? 'דחייה הדדית' : 'משיכה הדדית');
    simForceTypeBadge.className = `badge ${badgeClass}`;
  }

  // Update Calculator Elements with CLEAN text (no raw LaTeX gibberish)
  if (calcQ1SI) calcQ1SI.textContent = `${state.q1} × 10⁻⁶ C`;
  if (calcQ2SI) calcQ2SI.textContent = `${state.q2} × 10⁻⁶ C`;
  if (calcRSI) calcRSI.textContent = `${state.r.toFixed(2)} m`;

  if (calcFormulaSub) {
    const q1Abs = Math.abs(state.q1);
    const q2Abs = Math.abs(state.q2);
    calcFormulaSub.innerHTML = `
      <span>F = 8.99 × 10⁹ · </span>
      <div style="display:inline-flex; flex-direction:column; vertical-align:middle; text-align:center; padding:0 4px;">
        <span style="border-bottom:2px solid #1e40af; padding-bottom:2px;">| (${q1Abs} × 10⁻⁶) · (${q2Abs} × 10⁻⁶) |</span>
        <span style="padding-top:2px;">(${state.r.toFixed(2)})²</span>
      </div>
    `;
  }

  const forceFormatted = formatForce(force);
  if (calcResultForce) calcResultForce.textContent = `F = ${forceFormatted}`;
  if (calcResultNature) calcResultNature.textContent = natureText;

  if (canvasDistDisplay) canvasDistDisplay.textContent = `מרחק: ${(state.r * 100).toFixed(0)} ס״מ (${state.r.toFixed(2)} מטר)`;
  if (canvasForceDisplay) canvasForceDisplay.textContent = `כוח: ${forceFormatted}`;

  // Redraw Canvas Simulation
  drawSimulation(force, isRepulsion, isNeutral);
}

/**
 * Format force nicely (e.g. 23.45 N or 1.23 x 10^-4 N)
 */
function formatForce(f) {
  if (f === 0) return '0.00 N';
  if (f >= 0.01 && f < 10000) {
    return `${f.toFixed(2)} N`;
  }
  return `${f.toExponential(2)} N`;
}

/**
 * Draw Interactive Physics Simulation on Canvas
 */
function drawSimulation(force, isRepulsion, isNeutral) {
  if (!ctx || !canvas) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background grid lines (subtle)
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Positions on Canvas
  const minPixDist = 110;
  const maxPixDist = 440;
  const tDist = (state.r - 0.02) / (0.50 - 0.02);
  const pixelDist = minPixDist + tDist * (maxPixDist - minPixDist);

  const centerY = h / 2 + 15;
  const x1 = (w / 2) - (pixelDist / 2);
  const x2 = (w / 2) + (pixelDist / 2);

  // 1. Draw Distance Dimension Line (below charges)
  const dimY = centerY + 58;
  ctx.beginPath();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.moveTo(x1, dimY);
  ctx.lineTo(x2, dimY);
  ctx.stroke();
  ctx.setLineDash([]);

  // End ticks
  ctx.beginPath();
  ctx.moveTo(x1, dimY - 6); ctx.lineTo(x1, dimY + 6);
  ctx.moveTo(x2, dimY - 6); ctx.lineTo(x2, dimY + 6);
  ctx.stroke();

  // Dimension text
  ctx.fillStyle = '#475569';
  ctx.font = '600 13px Assistant, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`r = ${(state.r * 100).toFixed(0)} cm`, w / 2, dimY + 18);

  // 2. Vector Force Arrows
  if (!isNeutral && force > 0) {
    const maxArrowLen = 85;
    const minArrowLen = 25;
    const logF = Math.max(-2, Math.min(3, Math.log10(force)));
    const tF = (logF + 2) / 5;
    const arrowLen = minArrowLen + tF * (maxArrowLen - minArrowLen);

    let arrow1Dir = isRepulsion ? -1 : 1;
    let arrow2Dir = isRepulsion ? 1 : -1;

    drawVectorArrow(ctx, x1, centerY, x1 + arrow1Dir * arrowLen, centerY, '#0284c7', 'F₂₁');
    drawVectorArrow(ctx, x2, centerY, x2 + arrow2Dir * arrowLen, centerY, '#0284c7', 'F₁₂');
  }

  // 3. Draw Charges (Spheres with gradient and glow)
  drawChargeSphere(ctx, x1, centerY, state.q1, 'q₁');
  drawChargeSphere(ctx, x2, centerY, state.q2, 'q₂');
}

/**
 * Draw Single Charge Sphere
 */
function drawChargeSphere(ctx, x, y, qVal, label) {
  const radius = 24;

  let baseColor = '#94a3b8';
  let glowColor = 'rgba(148, 163, 184, 0.2)';
  let symbol = '0';

  if (qVal > 0) {
    baseColor = '#f43f5e';
    glowColor = 'rgba(244, 63, 94, 0.25)';
    symbol = '+';
  } else if (qVal < 0) {
    baseColor = '#3b82f6';
    glowColor = 'rgba(59, 130, 246, 0.25)';
    symbol = '-';
  }

  // Outer Glow
  ctx.beginPath();
  ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
  ctx.fillStyle = glowColor;
  ctx.fill();

  // Sphere Body
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, radius);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, baseColor);
  grad.addColorStop(1, shadeColor(baseColor, -25));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Plus / Minus Symbol in Center
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Assistant, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, x, y - 1);

  // Label below sphere
  ctx.font = '700 13px Assistant, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.textBaseline = 'top';
  ctx.fillText(`${label} = ${qVal > 0 ? '+' : ''}${qVal}µC`, x, y + radius + 6);
}

/**
 * Draw Vector Arrow
 */
function drawVectorArrow(ctx, fromX, fromY, toX, toY, color, labelText) {
  const headLen = 9;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  // Vector label
  ctx.font = 'bold 12px Assistant, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(labelText, toX, toY - 14);
}

/**
 * Color shading helper
 */
function shadeColor(color, percent) {
  let num = parseInt(color.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * Quiz Engine
 */
function initQuiz() {
  const container = document.getElementById('quiz-questions-container');
  if (!container) return;

  container.innerHTML = quizQuestions.map((q, qIndex) => `
    <div class="quiz-card" id="quiz-card-${qIndex}">
      <div class="quiz-q-title">${q.title}: ${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, optIndex) => `
          <label class="quiz-option" id="quiz-opt-${qIndex}-${optIndex}">
            <input type="radio" name="question_${qIndex}" value="${optIndex}">
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
      <div class="quiz-explanation" id="quiz-exp-${qIndex}">
        ${q.explanation}
      </div>
    </div>
  `).join('');

  // Option selection style
  document.querySelectorAll('.quiz-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const qIndex = e.target.name.split('_')[1];
      document.querySelectorAll(`input[name="question_${qIndex}"]`).forEach(r => {
        r.closest('.quiz-option').classList.toggle('selected', r.checked);
      });
    });
  });

  // Submit Quiz Button
  const btnSubmitQuiz = document.getElementById('btn-submit-quiz');
  if (btnSubmitQuiz) {
    btnSubmitQuiz.addEventListener('click', () => {
      let score = 0;

      quizQuestions.forEach((q, qIndex) => {
        const selectedRadio = document.querySelector(`input[name="question_${qIndex}"]:checked`);
        const card = document.getElementById(`quiz-card-${qIndex}`);

        if (!selectedRadio) {
          card.classList.remove('correct', 'wrong');
        } else {
          const selectedVal = parseInt(selectedRadio.value, 10);
          const isCorrect = selectedVal === q.correctIndex;
          if (isCorrect) score++;

          card.classList.toggle('correct', isCorrect);
          card.classList.toggle('wrong', !isCorrect);
        }
      });

      const scoreBanner = document.getElementById('quiz-score-banner');
      const scoreNum = document.getElementById('quiz-score-num');
      const totalNum = document.getElementById('quiz-total-num');
      const feedbackText = document.getElementById('quiz-feedback-text');

      if (scoreBanner) {
        scoreBanner.style.display = 'block';
        scoreNum.textContent = score;
        totalNum.textContent = quizQuestions.length;

        if (score === quizQuestions.length) {
          feedbackText.textContent = '🌟 מושלם! שליטה מוחלטת בחוק קולון לקראת הבגרות!';
        } else if (score >= 3) {
          feedbackText.textContent = '👏 עבודה יפה! עיינו בהסברים לשאלות שטעיתם בהן כדי לסגור פערים.';
        } else {
          feedbackText.textContent = '💡 כדאי לחזור על לשונית התיאוריה והנוסחאות ולנסות שוב.';
        }

        scoreBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Reset Quiz Button
  const btnResetQuiz = document.getElementById('btn-reset-quiz');
  if (btnResetQuiz) {
    btnResetQuiz.addEventListener('click', () => {
      document.querySelectorAll('.quiz-option input[type="radio"]').forEach(r => r.checked = false);
      document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
      document.querySelectorAll('.quiz-card').forEach(c => c.classList.remove('correct', 'wrong'));
      const scoreBanner = document.getElementById('quiz-score-banner');
      if (scoreBanner) scoreBanner.style.display = 'none';
    });
  }
}
