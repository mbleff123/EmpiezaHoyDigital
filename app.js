(() => {
  "use strict";

  const config = window.SITE_CONFIG;
  const content = window.SITE_CONTENT;
  const app = document.querySelector("#app");
  const progressShell = document.querySelector("#progressShell");
  const progressText = document.querySelector("#progressText");
  const progressPercent = document.querySelector("#progressPercent");
  const progressFill = document.querySelector("#progressFill");
  const stickyCta = document.querySelector("#stickyCta");
  const toast = document.querySelector("#toast");
  const fallback = document.querySelector("#fallback");
  const STORAGE_KEY = "tpnd-diagnostico-v1";
  const debug = new URLSearchParams(location.search).get("debug") === "1";
  let transitionTimer;
  let answerTimer;
  let lastWhatsAppMessage = "";
  let abandonTracked = false;

  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);

  const fill = (template, data = {}) => Object.entries(data).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value ?? ""), template
  );

  const randomCode = (size) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return [...bytes].map(byte => alphabet[byte % alphabet.length]).join("");
  };

  const getUtm = () => {
    const params = new URLSearchParams(location.search);
    return ["utm_source", "utm_medium", "utm_campaign", "utm_content", "v"].reduce((all, key) => {
      all[key] = params.get(key) || "";
      return all;
    }, {});
  };

  const freshState = () => ({
    sessionId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${randomCode(8)}`,
    codigo: randomCode(5),
    utm: getUtm(),
    answers: {},
    screen: "landing",
    currentId: "nombre",
    started: false,
    complete: false,
    lastScreen: "landing",
    events: { offer: false, scroll50: false, scroll100: false }
  });

  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.sessionId && saved?.codigo && saved?.answers) {
        return { ...freshState(), ...saved, events: { ...freshState().events, ...(saved.events || {}) } };
      }
    } catch (error) {
      if (debug) console.warn("No se pudo recuperar el progreso", error);
    }
    return freshState();
  };

  let state = loadState();

  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {
      if (debug) console.warn("No se pudo guardar el progreso", error);
    }
  };

  const setColors = () => {
    const root = document.documentElement;
    Object.entries(config.colors).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
  };

  function trackEvent(evento, datos = {}) {
    const payload = {
      sessionId: state.sessionId,
      codigo: state.codigo,
      evento,
      datos,
      respuestas: state.answers,
      timestamp: new Date().toISOString(),
      utm: state.utm
    };
    if (debug) console.info("[TPND event]", payload);
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: evento, ...datos });
    if (window.ttq?.track) window.ttq.track(evento, datos);
    if (typeof window.fbq === "function") window.fbq("trackCustom", evento, datos);
    if (!config.webhookUrl) return;
    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(config.webhookUrl, new Blob([body], { type: "application/json" }));
      } else {
        fetch(config.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    } catch (error) {
      if (debug) console.warn("Webhook no disponible", error);
    }
  }

  window.trackEvent = trackEvent;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  };

  const visibleQuestions = () => content.questions.filter(question => !question.conditional || state.answers.experiencia === "intento_fallido");

  const optionFor = (id, value) => content.questions.find(question => question.id === id)?.options?.find(option => option.value === value);

  const objectiveText = (answers = state.answers) => optionFor("objetivo", answers.objetivo)?.result || "definir qué quieres lograr";
  const doubtText = (answers = state.answers) => optionFor("dudas", (answers.dudas || [])[0])?.natural || "ninguna por ahora";

  const levelFor = (score) => score >= 70 ? { key: "ready", className: "ready" } : score >= 40 ? { key: "building", className: "building" } : { key: "reinforce", className: "reinforce" };

  function computeDiagnosis(answers) {
    const resourceValues = { celular: 30, internet: 30, tiktok: 15, whatsapp: 15, computadora: 10 };
    const timeValues = { menos30: 25, "30a60": 60, "1a2h": 90, mas2h: 100 };
    const learnValues = { muy: 100, guiado: 75, inseguro: 40, hecho: 10 };
    const sellValues = { gusta: 100, verguenza: 70, cuesta: 50, evito: 20 };
    const commitmentValues = { diario: 100, varias: 80, cuando_pueda: 50, mirando: 20 };
    const startValues = { nunca: 30, intento_fallido: 50, vendio: 80, experiencia: 100 };
    const scores = {
      herramientas: (answers.recursos || []).reduce((sum, item) => sum + (resourceValues[item] || 0), 0),
      tiempo: timeValues[answers.tiempo] || 0,
      actitud: Math.round(((learnValues[answers.aprender] || 0) + (sellValues[answers.vender] || 0) + (commitmentValues[answers.compromiso] || 0)) / 3),
      punto: startValues[answers.experiencia] || 0
    };
    const strengthOrder = ["actitud", "herramientas", "tiempo", "punto"];
    const challengeOrder = ["punto", "tiempo", "herramientas", "actitud"];
    const strength = strengthOrder.reduce((best, key) => scores[key] > scores[best] ? key : best, strengthOrder[0]);
    const challenge = challengeOrder.reduce((best, key) => scores[key] < scores[best] ? key : best, challengeOrder[0]);
    let area = "practica";
    if (["cuesta", "evito"].includes(answers.vender) || answers.experiencia === "nunca") area = "ventas";
    else if (["cuando_pueda", "mirando"].includes(answers.compromiso)) area = "constancia";
    else if (answers.tiempo === "menos30") area = "tiempo";
    const resources = answers.recursos || [];
    const frenos = answers.frenos || [];
    const dudas = answers.dudas || [];
    const conditions = [
      ["sin_base", !resources.includes("celular") || !resources.includes("internet")],
      ["desconfiado", frenos.some(value => ["perdio_dinero", "promesas"].includes(value)) || dudas.includes("estafa")],
      ["explorador", answers.objetivo === "sin_claro" || answers.compromiso === "mirando"],
      ["poco_tiempo", answers.tiempo === "menos30"],
      ["con_experiencia", ["vendio", "experiencia"].includes(answers.experiencia)],
      ["decidido", answers.experiencia === "nunca" && ["muy", "guiado"].includes(answers.aprender) && ["diario", "varias"].includes(answers.compromiso)]
    ];
    const matched = conditions.filter(([, matches]) => matches).map(([name]) => name);
    const segment = matched[0] || "inseguro";
    const secondarySignals = matched.slice(1);
    return {
      scores,
      levels: Object.fromEntries(Object.entries(scores).map(([key, value]) => [key, levelFor(value)])),
      strength,
      challenge,
      area,
      segment,
      secondarySignals
    };
  }

  window.FunnelLogic = { computeDiagnosis, levelFor };

  const brandMark = () => `<div class="brand"><img src="./assets/brand-logo.png" alt="${escapeHTML(config.brandName)}"></div>`;

  const screen = (body, className = "") => {
    clearTimeout(answerTimer);
    app.innerHTML = `<section class="screen ${className}">${body}</section>`;
    requestAnimationFrame(() => app.querySelector(".screen")?.classList.add("is-visible"));
    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const hideTestChrome = () => {
    progressShell.hidden = true;
    stickyCta.hidden = true;
    stickyCta.classList.remove("visible");
  };

  function renderLanding() {
    state.lastScreen = "landing";
    hideTestChrome();
    const canResume = state.started && !state.complete && Object.keys(state.answers).length;
    const resume = canResume ? `
      <div class="resume-card">
        <div><strong>${content.ui.resumeTitle}</strong><p>${content.ui.resumeText}</p></div>
        <button class="button secondary" id="resumeBtn">${content.ui.resume}</button>
        <button class="text-button" id="restartBtn">${content.ui.startOver}</button>
      </div>` : "";
    screen(`
      <div class="landing-grid">
        <div class="hero-copy">
          ${brandMark()}
          <p class="eyebrow">${content.landing.eyebrow}</p>
          <h1>${content.landing.title}</h1>
          <p class="lead">${content.landing.subtitle}</p>
          <button class="button primary big" id="startBtn">${content.landing.cta}<span aria-hidden="true">→</span></button>
          <p class="disclaimer-line">${content.landing.disclaimer}</p>
          <p class="trust-line">${content.landing.trustLine.join(" · ")}</p>
          ${resume}
        </div>
      </div>
    `, "landing-screen");
    document.querySelector("#startBtn").addEventListener("click", startTest);
    document.querySelector("#resumeBtn")?.addEventListener("click", resumeTest);
    document.querySelector("#restartBtn")?.addEventListener("click", restartTest);
  }

  function startTest() {
    if (state.started && !state.complete && Object.keys(state.answers).length) return resumeTest();
    if (state.complete) {
      const retainedUtm = state.utm;
      state = freshState();
      state.utm = retainedUtm;
    }
    state.started = true;
    state.screen = "question";
    state.currentId = "nombre";
    saveState();
    trackEvent("test_start");
    renderQuestion("nombre");
  }

  function resumeTest() {
    if (state.screen === "micro") return renderInterlude();
    if (state.screen === "analysis") return renderAnalysis();
    if (state.screen === "result") return renderResult();
    renderQuestion(state.currentId || "nombre");
  }

  function restartTest() {
    const retainedUtm = getUtm();
    state = freshState();
    state.utm = retainedUtm;
    saveState();
    renderLanding();
  }

  function updateProgress(questionId) {
    const questions = visibleQuestions();
    const current = Math.max(0, questions.findIndex(item => item.id === questionId));
    const percent = Math.round(((current + 1) / questions.length) * 100);
    progressText.textContent = fill(content.ui.questionProgress, { current: current + 1, total: questions.length });
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    progressShell.hidden = false;
  }

  function renderQuestion(id) {
    const question = visibleQuestions().find(item => item.id === id) || visibleQuestions()[0];
    state.screen = "question";
    state.currentId = question.id;
    state.lastScreen = `question:${question.id}`;
    saveState();
    updateProgress(question.id);
    stickyCta.hidden = true;
    const answer = state.answers[question.id];
    const title = fill(question.question, { nombre: escapeHTML(state.answers.nombre || "") });
    let field = "";
    if (question.type === "text") {
      field = `<label class="name-field"><span class="sr-only">${question.placeholder}</span><input id="nameInput" autocomplete="given-name" inputmode="text" maxlength="${question.maxLength}" placeholder="${question.placeholder}" value="${escapeHTML(answer || "")}"></label>`;
    } else {
      const selected = Array.isArray(answer) ? answer : [answer];
      field = `<div class="options" role="${question.type === "single" ? "radiogroup" : "group"}" aria-label="${escapeHTML(title)}">
        ${question.options.map((option, index) => {
          const isSelected = selected.includes(option.value);
          return `<button class="option ${isSelected ? "selected" : ""}" data-value="${option.value}" role="${question.type === "single" ? "radio" : "checkbox"}" aria-checked="${isSelected}">
            <span class="option-index">${String(index + 1).padStart(2, "0")}</span><span>${option.label}</span><b aria-hidden="true">✓</b>
          </button>`;
        }).join("")}
      </div>`;
    }
    const needsButton = question.type !== "single";
    const answerCount = Array.isArray(answer) ? answer.length : answer ? 1 : 0;
    const disabled = question.type === "text" ? !String(answer || "").trim() : (!question.optional && answerCount === 0);
    screen(`
      <div class="question-wrap">
        <button class="back-button" id="backBtn"><span aria-hidden="true">←</span>${content.ui.back}</button>
        <p class="question-kicker">${fill(content.ui.questionProgress, { current: visibleQuestions().findIndex(item => item.id === question.id) + 1, total: visibleQuestions().length })}</p>
        <h1>${title}</h1>
        ${question.max ? `<p class="selection-hint">${content.ui.maxTwo}</p>` : ""}
        ${field}
        ${question.microcopy ? `<p class="microcopy">${fill(question.microcopy, { nombre: escapeHTML(state.answers.nombre || "") })}</p>` : ""}
        ${needsButton ? `<button class="button primary continue-button" id="continueBtn" ${disabled ? "disabled" : ""}>${content.ui.continue}<span aria-hidden="true">→</span></button>` : ""}
      </div>
    `, "question-screen");
    document.querySelector("#backBtn").addEventListener("click", goBack);
    if (question.type === "text") {
      const input = document.querySelector("#nameInput");
      const continueBtn = document.querySelector("#continueBtn");
      input.focus({ preventScroll: true });
      input.addEventListener("input", () => {
        state.answers.nombre = input.value.slice(0, question.maxLength);
        continueBtn.disabled = !input.value.trim();
        saveState();
      });
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); continueText(question); }
      });
      continueBtn.addEventListener("click", () => continueText(question));
    } else {
      document.querySelectorAll(".option").forEach(button => button.addEventListener("click", () => selectOption(question, button.dataset.value)));
      document.querySelector("#continueBtn")?.addEventListener("click", () => continueMulti(question));
    }
    trackEvent("question_view", { id: question.id });
  }

  function continueText(question) {
    const value = String(state.answers[question.id] || "").trim();
    if (!value) return;
    state.answers[question.id] = value;
    saveState();
    trackEvent("question_answered", { id: question.id, valor: value });
    showToast(fill(question.microcopy, { nombre: value }));
    answerTimer = setTimeout(goNext, 350);
  }

  function selectOption(question, value) {
    if (question.type === "single") {
      state.answers[question.id] = value;
      if (question.id === "experiencia" && value !== "intento_fallido") delete state.answers.frenos;
      saveState();
      renderQuestion(question.id);
      trackEvent("question_answered", { id: question.id, valor: value });
      answerTimer = setTimeout(goNext, 250);
      return;
    }
    const selected = [...(state.answers[question.id] || [])];
    const at = selected.indexOf(value);
    if (at >= 0) selected.splice(at, 1);
    else if (question.max && selected.length >= question.max) return showToast(content.ui.maxTwo);
    else selected.push(value);
    state.answers[question.id] = selected;
    saveState();
    renderQuestion(question.id);
  }

  function continueMulti(question) {
    const values = state.answers[question.id] || [];
    if (!question.optional && !values.length) return showToast(content.ui.chooseOne);
    trackEvent("question_answered", { id: question.id, valor: values });
    goNext();
  }

  function goNext() {
    const currentId = state.currentId;
    if (currentId === "tiempo") return renderInterlude();
    const questions = visibleQuestions();
    const index = questions.findIndex(item => item.id === currentId);
    const next = questions[index + 1];
    if (next) renderQuestion(next.id);
    else renderAnalysis();
  }

  function goBack() {
    const questions = visibleQuestions();
    const index = questions.findIndex(item => item.id === state.currentId);
    if (index <= 0) {
      state.screen = "landing";
      saveState();
      return renderLanding();
    }
    renderQuestion(questions[index - 1].id);
  }

  function renderInterlude() {
    state.screen = "micro";
    state.lastScreen = "microexplicacion";
    saveState();
    progressShell.hidden = true;
    screen(`
      <div class="interlude-wrap">
        <div class="orbit" aria-hidden="true"><span>1</span><span>2</span><span>3</span></div>
        <p class="eyebrow">${content.interlude.eyebrow}</p>
        <h1>${fill(content.interlude.title, { nombre: escapeHTML(state.answers.nombre) })}</h1>
        <p class="lead">${content.interlude.text}</p>
        <button class="button primary big" id="interludeBtn">${content.interlude.cta}<span aria-hidden="true">→</span></button>
      </div>
    `, "interlude-screen");
    document.querySelector("#interludeBtn").addEventListener("click", () => renderQuestion("recursos"));
    trackEvent("microexplicacion_view");
  }

  function renderAnalysis() {
    state.screen = "analysis";
    state.lastScreen = "analysis";
    saveState();
    hideTestChrome();
    screen(`
      <div class="analysis-wrap">
        <div class="analysis-symbol" aria-hidden="true"><i></i><i></i><i></i></div>
        <h1>${fill(content.analysis, { nombre: escapeHTML(state.answers.nombre) })}</h1>
        <div class="analysis-lines" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      </div>
    `, "analysis-screen");
    trackEvent("test_complete");
    setTimeout(renderResult, 1500);
  }

  const dimensionBar = (key, diagnosis) => {
    const level = diagnosis.levels[key];
    return `<div class="dimension-row">
      <div><span>${content.result.dimensions[key]}</span><strong class="level ${level.className}">${content.result.levels[level.key]}</strong></div>
      <div class="dimension-track" aria-label="${content.result.dimensions[key]}: ${content.result.levels[level.key]}"><i class="${level.className}" style="--fill:${diagnosis.scores[key]}%"></i></div>
    </div>`;
  };

  function renderResult() {
    state.screen = "result";
    state.complete = true;
    state.lastScreen = "result";
    const diagnosis = computeDiagnosis(state.answers);
    state.diagnosis = diagnosis;
    saveState();
    hideTestChrome();
    const segmentCopy = content.segments[diagnosis.segment];
    const area = content.result.areas[diagnosis.area];
    const resultAction = diagnosis.segment === "sin_base" ? renderNoBaseActions() : `<button class="button ${diagnosis.segment === "desconfiado" ? "secondary accent-outline" : "primary"} result-action" id="resultAction">${segmentCopy.cta}<span aria-hidden="true">→</span></button>`;
    const explorer = diagnosis.segment === "explorador" ? `<div class="explorer-steps">${content.offer.explorerSteps.map((step, index) => `<div><span>0${index + 1}</span><p>${step}</p></div>`).join("")}</div>${renderSampleButton("result")}` : "";
    const offer = diagnosis.segment === "sin_base" ? "" : renderOffer(diagnosis);
    screen(`
      <div class="result-page">
        <section class="result-hero">
          ${brandMark()}
          <p class="eyebrow">${content.result.eyebrow}</p>
          <h1>${fill(content.result.title, { nombre: escapeHTML(state.answers.nombre) })}</h1>
          <div class="diagnosis-card">
            ${["herramientas", "tiempo", "actitud", "punto"].map(key => dimensionBar(key, diagnosis)).join("")}
          </div>
          <div class="result-facts">
            <div><span>${content.result.objective}</span><strong>${objectiveText()}</strong></div>
            <div><span>${content.result.strength}</span><strong>${content.result.strengths[diagnosis.strength]}</strong></div>
            <div><span>${content.result.challenge}</span><strong>${content.result.challenges[diagnosis.challenge]}</strong></div>
            <div><span>${content.result.area}</span><strong>${area.label}</strong></div>
          </div>
          <div class="route-card">
            <p class="section-label">${content.result.routeTitle}</p>
            <div class="route-flow">${content.result.route.map((item, index) => `<span>${item}${index < content.result.route.length - 1 ? "<b>→</b>" : ""}</span>`).join("")}</div>
            <p>${area.line}</p>
          </div>
          <div class="segment-note ${diagnosis.segment}"><span aria-hidden="true">✦</span><p>${fill(segmentCopy.text, { nombre: escapeHTML(state.answers.nombre) })}</p></div>
          ${explorer}
          ${resultAction}
          <p class="diagnosis-disclaimer">${content.result.disclaimer}</p>
        </section>
        ${offer}
      </div>
    `, "result-screen");
    bindResult(diagnosis);
    trackEvent("result_view", {
      segmento: diagnosis.segment,
      niveles: Object.fromEntries(Object.entries(diagnosis.levels).map(([key, value]) => [key, content.result.levels[value.key]])),
      fortaleza: diagnosis.strength,
      reto: diagnosis.challenge,
      area: area.label
    });
  }

  function renderNoBaseActions() {
    return `<div class="no-base-actions">
      ${config.freeChecklistUrl ? `<a class="button primary" id="checklistBtn" href="${escapeHTML(config.freeChecklistUrl)}">${content.offer.checklistCta}</a>` : ""}
      <button class="button secondary" id="notifyBtn">${content.segments.sin_base.cta}<span aria-hidden="true">→</span></button>
    </div>`;
  }

  const honestFitBlock = () => `<section class="offer-section honest-fit" aria-labelledby="honest-fit-title">
    <p class="section-number">${content.offer.honestFit.eyebrow}</p>
    <h2 id="honest-fit-title">${content.offer.honestFit.title}</h2>
    <p class="honest-fit__subtitle">${content.offer.honestFit.subtitle}</p>
    <div class="honest-fit__cards">
      <article class="honest-fit__card honest-fit__card--yes">
        <h3>${content.offer.honestFit.yesTitle}</h3>
        <ul>${content.offer.honestFit.yesItems.map(item => `<li><span class="honest-fit__icon" aria-hidden="true">✓</span><span>${item}</span></li>`).join("")}</ul>
      </article>
      <article class="honest-fit__card honest-fit__card--no">
        <h3>${content.offer.honestFit.noTitle}</h3>
        <ul>${content.offer.honestFit.noItems.map(item => `<li><span class="honest-fit__icon" aria-hidden="true">✕</span><span>${item}</span></li>`).join("")}</ul>
      </article>
    </div>
    <p class="honest-fit__closing"><strong>${content.offer.honestFit.closingWhat}</strong> ${content.offer.honestFit.closingWhatText} <strong>${content.offer.honestFit.closingNot}</strong> ${content.offer.honestFit.closingNotText} ${content.offer.honestFit.closingEnd}</p>
  </section>`;

  const weekBlock = (highlight = false) => `<section class="offer-section week ${highlight ? "highlight" : ""}">
    <p class="section-number">${content.offer.labels.week}</p><h2>${content.offer.weekTitle}</h2><p class="muted">${content.offer.weekIntro}</p>
    <ol>${content.offer.week.map(item => `<li>${item}</li>`).join("")}</ol>
  </section>`;

  function renderSampleButton(position) {
    if (!config.freeSampleUrl) return "";
    return `<a class="button secondary sample-button" data-position="${position}" href="${escapeHTML(config.freeSampleUrl)}">${content.offer.sampleCta}<span aria-hidden="true">↗</span></a>`;
  }

  function renderTestimonials() {
    if (!config.testimonials.length) return "";
    return `<section class="offer-section testimonials"><p class="section-number">${content.offer.labels.testimonials}</p><h2>${content.offer.testimonialsTitle}</h2><div class="testimonial-list">${config.testimonials.map(item => `<blockquote>${item.imageUrl ? `<img src="${escapeHTML(item.imageUrl)}" alt="" loading="lazy">` : ""}<p>“${escapeHTML(item.text)}”</p><cite>${escapeHTML(item.name)}</cite></blockquote>`).join("")}</div></section>`;
  }

  function orderedFaq() {
    const priority = state.answers.dudas || [];
    const items = [...content.faq.items];
    items.sort((a, b) => {
      const ai = priority.indexOf(a.id), bi = priority.indexOf(b.id);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return content.faq.items.indexOf(a) - content.faq.items.indexOf(b);
    });
    if (state.answers.edad === "menor") items.push(content.faq.minor);
    return items;
  }

  function renderFaq() {
    return `<section class="offer-section faq"><p class="section-number">${content.offer.labels.faq}</p><h2>${content.faq.title}</h2><div class="faq-list">${orderedFaq().map(item => `<details data-question="${escapeHTML(item.question)}"><summary>${item.question}<span aria-hidden="true">+</span></summary><p>${item.answer}</p></details>`).join("")}</div></section>`;
  }

  function renderOffer(diagnosis) {
    const isShort = diagnosis.segment === "con_experiencia";
    const pillars = isShort ? content.offer.pillars.filter((_, index) => [1, 2].includes(index)) : content.offer.pillars;
    const intro = `<section class="offer-section offer-intro"><p class="eyebrow">${content.offer.eyebrow}</p><h2>${content.offer.bridgeTitle}</h2><p class="lead">${content.offer.bridge}</p></section>`;
    const what = `<section class="offer-section what"><p class="section-number">${content.offer.labels.what}</p><h2>${content.offer.whatTitle}</h2><p class="lead">${content.offer.what}</p></section>`;
    const includes = `<section class="offer-section includes" id="includes"><p class="section-number">${content.offer.labels.includes}</p><h2>${content.offer.includesTitle}</h2><p class="includes-intro">${content.offer.includesIntro}</p><div class="pillar-grid">${pillars.map((pillar, index) => `<article class="pillar ${diagnosis.segment === "inseguro" && index === pillars.length - 1 ? "highlight" : ""}"><span>${pillar.label}</span><h3>${pillar.title}</h3><ul>${pillar.items.map(item => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div></section>`;
    const price = `<section class="offer-section price"><p class="section-number">${content.offer.labels.price}</p><h2>${content.offer.priceTitle}</h2><div class="price-value">${fill(content.offer.onePayment, { price: escapeHTML(config.price) })}</div><p>${content.offer.noHidden}</p><p class="muted">${fill(content.offer.payment, { methods: escapeHTML(config.paymentMethods.join(", ")) })}</p><button class="button primary big price-cta" id="priceCta" aria-describedby="priceCtaNote">${fill(content.offer.priceCta, { price: escapeHTML(config.price) })}<span aria-hidden="true">→</span></button><p class="price-cta-note" id="priceCtaNote">${content.offer.priceCtaNote}</p>${renderSampleButton("offer")}</section>`;
    const sample = config.freeSampleUrl ? `<section class="offer-section sample"><h2>${content.offer.sampleTitle}</h2>${renderSampleButton("section")}</section>` : "";
    const final = `<section class="offer-section final-cta"><span class="final-arrow" aria-hidden="true">↗</span><h2>${content.offer.finalTitle}</h2><p>${content.offer.finalText}</p><button class="button primary big" id="finalCta">${content.offer.finalCta}<span aria-hidden="true">→</span></button></section>`;
    let blocks;
    if (isShort) blocks = [what, includes, honestFitBlock(), price, renderFaq(), final];
    else blocks = [intro, what, includes, weekBlock(diagnosis.segment === "poco_tiempo"), honestFitBlock(), price, sample, renderTestimonials(), renderFaq(), final];
    if (diagnosis.segment === "desconfiado") {
      blocks = [intro, what, includes, weekBlock(), honestFitBlock(), price, sample, renderTestimonials(), renderFaq(), final];
    }
    return `<div class="offer" id="offer">${blocks.join("")}</div>`;
  }

  function bindResult(diagnosis) {
    document.querySelector("#checklistBtn")?.addEventListener("click", () => trackEvent("checklist_click"));
    document.querySelector("#notifyBtn")?.addEventListener("click", () => openWhatsApp("aviso"));
    document.querySelectorAll(".sample-button").forEach(button => button.addEventListener("click", () => trackEvent("sample_click", { posicion: button.dataset.position })));
    const resultAction = document.querySelector("#resultAction");
    resultAction?.addEventListener("click", () => {
      trackEvent("cta_click", { posicion: "resultado", segmento: diagnosis.segment });
      if (diagnosis.segment === "desconfiado") return openWhatsApp("dudas");
      if (["decidido", "con_experiencia"].includes(diagnosis.segment)) return openWhatsApp("principal");
      document.querySelector("#includes")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    document.querySelector("#finalCta")?.addEventListener("click", () => {
      trackEvent("cta_click", { posicion: "final", segmento: diagnosis.segment });
      openWhatsApp("principal");
    });
    document.querySelector("#priceCta")?.addEventListener("click", () => {
      trackEvent("cta_click", { posicion: "precio", segmento: diagnosis.segment });
      openWhatsApp("principal");
    });
    document.querySelectorAll("details").forEach(detail => detail.addEventListener("toggle", () => {
      if (detail.open) trackEvent("faq_open", { pregunta: detail.dataset.question });
    }));
    if (diagnosis.segment !== "sin_base") setupOfferTracking(diagnosis);
  }

  function setupOfferTracking(diagnosis) {
    stickyCta.innerHTML = `<button class="button primary" id="stickyButton">${content.offer.finalCta}<span aria-hidden="true">→</span></button>`;
    stickyCta.hidden = false;
    document.querySelector("#stickyButton").addEventListener("click", () => {
      trackEvent("cta_click", { posicion: "barra_fija", segmento: diagnosis.segment });
      openWhatsApp("principal");
    });
    const includes = document.querySelector("#includes");
    if (includes) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting) && !state.events.offer) {
          state.events.offer = true;
          saveState();
          trackEvent("offer_view");
        }
      }, { threshold: 0.2 });
      observer.observe(includes);
    }
    const priceCta = document.querySelector("#priceCta");
    if (priceCta) {
      const priceObserver = new IntersectionObserver(entries => {
        stickyCta.classList.toggle("price-cta-visible", entries.some(entry => entry.isIntersecting));
      }, { threshold: 0.35 });
      priceObserver.observe(priceCta);
    }
    const onScroll = () => {
      if (!includes) return;
      const offer = document.querySelector("#offer");
      const starts = window.scrollY + window.innerHeight >= includes.offsetTop;
      const ends = window.scrollY < offer.offsetTop + offer.offsetHeight;
      stickyCta.classList.toggle("visible", starts && ends);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 1;
      if (ratio >= 0.5 && !state.events.scroll50) {
        state.events.scroll50 = true; saveState(); trackEvent("scroll_offer_50");
      }
      if (ratio >= 0.98 && !state.events.scroll100) {
        state.events.scroll100 = true; saveState(); trackEvent("scroll_offer_100");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function whatsappMessage(type) {
    const template = type === "dudas" ? content.whatsapp.doubts : type === "aviso" ? content.whatsapp.notify : content.whatsapp.main;
    return fill(template, {
      nombre: state.answers.nombre,
      objetivo: objectiveText(),
      duda: doubtText(),
      codigo: state.codigo
    });
  }

  function openWhatsApp(type) {
    const message = whatsappMessage(type);
    lastWhatsAppMessage = message;
    trackEvent("whatsapp_open", { tipo: type });
    const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
    setTimeout(() => {
      if (document.visibilityState === "visible") showWhatsAppFallback(message);
    }, 1200);
  }

  function showWhatsAppFallback(message = lastWhatsAppMessage) {
    fallback.hidden = false;
    fallback.innerHTML = `<div class="fallback-card" role="dialog" aria-modal="true" aria-labelledby="fallbackTitle">
      <button class="fallback-close" id="fallbackClose" aria-label="${content.ui.close}">×</button>
      <h2 id="fallbackTitle">${content.ui.whatsappFallbackTitle}</h2>
      <p>${fill(content.ui.whatsappFallbackText, { number: escapeHTML(config.whatsappNumber) })}</p>
      <div class="message-preview">${escapeHTML(message)}</div>
      <button class="button primary" id="copyMessage">${content.ui.copyMessage}</button>
    </div>`;
    document.querySelector("#fallbackClose").addEventListener("click", () => { fallback.hidden = true; });
    document.querySelector("#copyMessage").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(message); }
      catch {
        const field = document.createElement("textarea"); field.value = message; document.body.append(field); field.select(); document.execCommand("copy"); field.remove();
      }
      showToast(content.ui.copied);
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && state.started && !abandonTracked) {
      abandonTracked = true;
      trackEvent("abandon", { ultima_pantalla: state.lastScreen });
    }
  });
  window.addEventListener("pagehide", () => {
    if (state.started && !abandonTracked) {
      abandonTracked = true;
      trackEvent("abandon", { ultima_pantalla: state.lastScreen });
    }
  });

  setColors();
  renderLanding();
  trackEvent("page_view");
})();

