/**
 * app.js
 * -----------------------------------------------------------------------
 * Minimal hash-router SPA (no build step / framework) that renders the
 * 7 Verba screens into #app-main, reusing the shared TopAppBar and
 * BottomNav defined in index.html. Talks to the backend exclusively
 * through window.Verba.api (see api.js).
 * -----------------------------------------------------------------------
 */

const VerbaApp = (function () {
  const main = () => document.getElementById('app-main');
  const toastHost = () => document.getElementById('toast-host');

  const state = {
    vocabularyFilters: { search: '', letter: '', category: '', level: '' },
    activeQuiz: null // { questions, index, answers }
  };

  // ---------------------------------------------------------------------
  // Small UI helpers
  // ---------------------------------------------------------------------
  function toast(message, kind = 'info') {
    const colors = {
      info: 'bg-on-surface text-inverse-on-surface',
      error: 'bg-error text-on-error',
      success: 'bg-primary text-on-primary'
    };
    const el = document.createElement('div');
    el.className = `${colors[kind]} px-4 py-3 rounded-xl shadow-lg font-body-md text-body-md mb-2`;
    el.textContent = message;
    toastHost().appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function loadingBlock(text) {
    return `
      <div class="flex flex-col items-center justify-center py-xl gap-sm text-on-surface-variant">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="font-body-md text-body-md">${text}</p>
      </div>`;
  }

  function emptyState(icon, title, subtitle) {
    return `
      <div class="flex flex-col items-center justify-center py-xl gap-xs text-center px-md">
        <span class="material-symbols-outlined text-[40px] text-outline-variant mb-2">${icon}</span>
        <h3 class="font-headline-md text-headline-md-mobile text-on-surface">${title}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">${subtitle}</p>
      </div>`;
  }

  function escapeHtml(str) {
    return (str || '').toString()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------------------------------------------------------------------
  // SETUP (first-launch: ask for the Apps Script Web App URL)
  // ---------------------------------------------------------------------
  function setChromeVisible(visible) {
    const header = document.getElementById('top-app-bar');
    const nav = document.getElementById('bottom-nav');
    if (header) header.classList.toggle('hidden', !visible);
    if (nav) nav.classList.toggle('hidden', !visible);
  }

  function renderSetupScreen() {
    setChromeVisible(false);
    main().innerHTML = `
      <div class="min-h-[85vh] flex flex-col justify-center max-w-sm mx-auto">
        <div class="text-center mb-lg">
          <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-sm">
            <span class="material-symbols-outlined text-on-primary-container text-[32px]">spa</span>
          </div>
          <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Welcome to Verba AI</h1>
          <p class="font-body-md text-body-md text-on-surface-variant">Connect your Google Apps Script backend to get started.</p>
        </div>

        <form id="setup-form" class="space-y-sm">
          <div class="flex flex-col gap-2">
            <label class="font-label-sm text-label-sm text-on-surface-variant px-1">APPS SCRIPT WEB APP URL</label>
            <input required id="setup-url-input" class="w-full h-14 px-4 bg-white border border-outline-variant rounded-xl text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="https://script.google.com/macros/s/.../exec" type="url"/>
          </div>
          <button type="submit" id="setup-connect-btn" class="w-full h-14 bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">link</span> Connect
          </button>
          <p id="setup-error" class="font-label-sm text-label-sm text-error text-center"></p>
        </form>

        <p class="font-label-sm text-label-sm text-on-surface-variant text-center mt-md">
          Don't have a URL yet? Deploy the Apps Script project as a Web App (Deploy → New deployment → Web app) and paste the <code>/exec</code> link above.
        </p>
      </div>
    `;

    document.getElementById('setup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('setup-url-input').value.trim();
      const btn = document.getElementById('setup-connect-btn');
      const errorEl = document.getElementById('setup-error');
      errorEl.textContent = '';
      if (!url) return;

      btn.disabled = true;
      btn.classList.add('opacity-60');
      try {
        await Verba.api.testUrl(url);
        Verba.api.setApiUrl(url);
        toast('Connected to Verba backend!', 'success');
        boot();
      } catch (err) {
        errorEl.textContent = 'Could not connect: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.classList.remove('opacity-60');
      }
    });
  }

  // ---------------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------------
  const routes = {
    '/dashboard': renderDashboard,
    '/add': renderAddVocabulary,
    '/bank': renderVocabularyBank,
    '/quiz': renderQuiz,
    '/progress': renderProgress,
    '/settings': renderSettings
  };

  function parseHash() {
    const hash = location.hash.replace(/^#/, '') || '/dashboard';
    const [path, queryString] = hash.split('?');
    const params = Object.fromEntries(new URLSearchParams(queryString || ''));
    return { path: path || '/dashboard', params };
  }

  async function navigate() {
    if (!Verba.api.isConfigured()) {
      renderSetupScreen();
      return;
    }
    setChromeVisible(true);

    const { path, params } = parseHash();
    setActiveNav(path);

    if (path.startsWith('/bank/')) {
      return renderVocabularyDetail(path.replace('/bank/', ''));
    }

    const renderer = routes[path] || renderDashboard;
    try {
      await renderer(params);
    } catch (err) {
      main().innerHTML = emptyState('error', 'Something went wrong', escapeHtml(err.message));
    }
  }

  function setActiveNav(path) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const isActive = path === a.dataset.nav || (path.startsWith('/bank') && a.dataset.nav === '/bank');
      a.classList.toggle('bg-primary-container', isActive);
      a.classList.toggle('text-on-primary-container', isActive);
      a.classList.toggle('text-on-surface-variant', !isActive);
    });
  }

  function goTo(path) {
    location.hash = path;
  }

  // ---------------------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------------------
  async function renderDashboard() {
    main().innerHTML = loadingBlock('Loading your dashboard...');
    const data = await Verba.api.getDashboard();

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

    main().innerHTML = `
      <section class="flex justify-between items-end mb-md">
        <div>
          <h1 class="font-headline-md text-headline-md-mobile text-on-surface">${greeting}!</h1>
          <p class="font-body-md text-body-md text-on-surface-variant">${data.words_to_next_quiz} words until your next quiz.</p>
        </div>
      </section>

      <section class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm relative overflow-hidden mb-md">
        <div class="relative z-10">
          <div class="flex justify-between items-center mb-sm">
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider">Mastery Level</span>
            <span class="font-label-md text-label-md text-on-surface">${escapeHtml(data.mastery_level)}</span>
          </div>
          <h2 class="font-headline-md text-headline-md-mobile mb-xs">${data.total_words} words collected</h2>
          <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-1000" style="width:${Math.min(100, (data.total_words % 50) / 50 * 100)}%;"></div>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mt-sm">Streak: ${data.streak} day${data.streak === 1 ? '' : 's'}</p>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-sm mb-md">
        <div class="bg-surface-container-low p-sm rounded-xl border border-outline-variant">
          <div class="flex items-center gap-xs mb-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-[20px]">menu_book</span>
            <span class="font-label-sm text-label-sm">Total Vocab</span>
          </div>
          <span class="font-headline-md text-headline-md-mobile">${data.total_words}</span>
        </div>
        <div class="bg-surface-container-low p-sm rounded-xl border border-outline-variant">
          <div class="flex items-center gap-xs mb-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-[20px]">bolt</span>
            <span class="font-label-sm text-label-sm">Quiz Average</span>
          </div>
          <span class="font-headline-md text-headline-md-mobile">${data.quiz_average}%</span>
        </div>
      </section>

      <section class="relative rounded-xl overflow-hidden flex items-center justify-between p-md bg-primary text-on-primary mb-lg cursor-pointer active:scale-[0.98] transition-transform" id="quiz-teaser">
        <div>
          <h3 class="font-headline-md text-headline-md-mobile">Daily Challenge</h3>
          <p class="font-label-md text-label-md opacity-90">Test yourself on your vocabulary bank</p>
        </div>
        <span class="material-symbols-outlined text-[32px]">arrow_forward_ios</span>
      </section>

      <section class="space-y-sm mb-lg">
        <div class="flex justify-between items-center">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Recent Vocabulary</h3>
          <a href="#/bank" class="text-primary font-label-sm text-label-sm">View All</a>
        </div>
        <div class="space-y-sm">
          ${data.recent_vocabulary.length
            ? data.recent_vocabulary.map((v) => `
              <a href="#/bank/${v.id}" class="block bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm">
                <div class="flex items-center gap-sm mb-xs">
                  <h4 class="font-headline-md text-headline-md-mobile text-on-surface">${escapeHtml(v.word)}</h4>
                  ${v.part_of_speech ? `<span class="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">${escapeHtml(v.part_of_speech)}</span>` : ''}
                </div>
                <p class="font-body-md text-body-md text-on-surface-variant italic line-clamp-2">${escapeHtml(v.definition || v.meaning)}</p>
              </a>`).join('')
            : emptyState('menu_book', 'No vocabulary yet', 'Add your first word to get started.')}
        </div>
      </section>
    `;

    document.getElementById('quiz-teaser')?.addEventListener('click', () => goTo('/quiz'));
  }

  // ---------------------------------------------------------------------
  // ADD VOCABULARY
  // ---------------------------------------------------------------------
  async function renderAddVocabulary() {
    main().innerHTML = `
      <section class="text-center mt-6 mb-10">
        <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Add New Vocabulary</h1>
        <p class="font-body-md text-body-md text-on-surface-variant">Expand your mental library one word at a time.</p>
      </section>

      <form id="add-vocab-form" class="space-y-gutter">
        <div class="flex flex-col gap-2">
          <label class="font-label-sm text-label-sm text-on-surface-variant px-1">ENGLISH WORD</label>
          <div class="relative">
            <input required id="word-input" class="w-full h-14 px-4 bg-white border border-outline-variant rounded-xl text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="e.g., Eloquent" type="text"/>
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">language</span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-label-sm text-label-sm text-on-surface-variant px-1">INDONESIAN MEANING</label>
          <div class="relative">
            <input required id="meaning-input" class="w-full h-14 px-4 bg-white border border-outline-variant rounded-xl text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="e.g., Fasih" type="text"/>
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">translate</span>
          </div>
        </div>
        <button type="submit" id="save-vocab-btn" class="w-full h-14 bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-md active:scale-95 transition-transform duration-150 mt-4 flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">save</span> Save Vocabulary
        </button>
      </form>

      <div id="add-vocab-result" class="mt-lg"></div>

      <section class="mt-12 mb-8">
        <h2 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Learning Tips</h2>
        <div class="flex overflow-x-auto gap-4 hide-scrollbar snap-x snap-mandatory -mx-margin-mobile px-margin-mobile">
          <div class="min-w-[260px] snap-center p-6 rounded-2xl bg-[#F0FDFA] border border-outline-variant shadow-sm flex flex-col gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <span class="material-symbols-outlined">psychology</span>
            </div>
            <h3 class="font-headline-md text-headline-md text-primary">Spaced Repetition</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">Review new words after a few hours, then the next day, to lock them in.</p>
          </div>
          <div class="min-w-[260px] snap-center p-6 rounded-2xl bg-surface-container border border-outline-variant shadow-sm flex flex-col gap-3">
            <div class="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span class="material-symbols-outlined">lightbulb</span>
            </div>
            <h3 class="font-headline-md text-headline-md text-secondary">Context is Key</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">Try using the new word in a sentence of your own right after saving it.</p>
          </div>
        </div>
      </section>
    `;

    document.getElementById('add-vocab-form').addEventListener('submit', handleAddVocabSubmit);
  }

  async function handleAddVocabSubmit(e) {
    e.preventDefault();
    const word = document.getElementById('word-input').value.trim();
    const meaning = document.getElementById('meaning-input').value.trim();
    const btn = document.getElementById('save-vocab-btn');
    const resultBox = document.getElementById('add-vocab-result');
    if (!word || !meaning) return;

    btn.disabled = true;
    btn.classList.add('opacity-60');
    resultBox.innerHTML = loadingBlock('AI is preparing your learning material...');

    try {
      const result = await Verba.api.addVocabulary(word, meaning);
      toast(`"${word}" added to your vocabulary bank!`, 'success');
      e.target.reset();
      resultBox.innerHTML = renderAddedWordPreview(result);

      if (result.triggerQuiz) {
        toast(`Milestone reached: ${result.milestone} words! Starting your quiz...`, 'info');
        setTimeout(() => goTo('/quiz'), 1500);
      }
    } catch (err) {
      toast(err.message, 'error');
      resultBox.innerHTML = emptyState('error', 'Could not process this word', escapeHtml(err.message));
    } finally {
      btn.disabled = false;
      btn.classList.remove('opacity-60');
    }
  }

  function renderAddedWordPreview(result) {
    const m = result.material || {};
    const forms = m.verb_forms
      ? `V1: ${escapeHtml(m.verb_forms.v1)} · V2: ${escapeHtml(m.verb_forms.v2)} · V3: ${escapeHtml(m.verb_forms.v3)} · V-ing: ${escapeHtml(m.verb_forms.ving)}`
      : m.noun_forms
        ? `Singular: ${escapeHtml(m.noun_forms.singular)} · Plural: ${escapeHtml(m.noun_forms.plural)}`
        : m.adjective_forms
          ? `Comparative: ${escapeHtml(m.adjective_forms.comparative)} · Superlative: ${escapeHtml(m.adjective_forms.superlative)}`
          : '';
    const example = (m.examples && m.examples[0]) || null;

    return `
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm space-y-xs">
        <div class="flex items-center gap-sm">
          <h4 class="font-headline-md text-headline-md-mobile text-on-surface">${escapeHtml(result.word)}</h4>
          <span class="px-2 py-0.5 bg-primary-container text-on-primary-container rounded text-[10px] font-bold uppercase">${escapeHtml(m.part_of_speech || '')}</span>
          <span class="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold uppercase">${escapeHtml(m.level || '')}</span>
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(m.definition || '')}</p>
        ${forms ? `<p class="font-label-sm text-label-sm text-on-surface-variant">${forms}</p>` : ''}
        ${example ? `<p class="font-body-md text-body-md italic text-outline">"${escapeHtml(example.sentence)}" — ${escapeHtml(example.translation)}</p>` : ''}
      </div>`;
  }

  // ---------------------------------------------------------------------
  // VOCABULARY BANK
  // ---------------------------------------------------------------------
  async function renderVocabularyBank() {
    main().innerHTML = `
      <section class="mb-md">
        <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-sm">Vocabulary Bank</h1>
        <div class="relative mb-sm">
          <input id="bank-search" value="${escapeHtml(state.vocabularyFilters.search)}" class="w-full h-12 pl-10 pr-4 bg-white border border-outline-variant rounded-xl font-body-md outline-none focus:ring-2 focus:ring-primary" placeholder="Search words or meanings..." type="text"/>
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
        </div>
        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1" id="bank-letters"></div>
      </section>
      <section id="bank-list" class="space-y-sm"></section>
    `;

    const letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
    document.getElementById('bank-letters').innerHTML = letters.map((l) => `
      <button data-letter="${l === 'All' ? '' : l}" class="letter-chip shrink-0 px-3 py-1.5 rounded-full border font-label-sm text-label-sm transition-colors
        ${state.vocabularyFilters.letter === (l === 'All' ? '' : l) ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant'}">
        ${l}
      </button>`).join('');

    document.getElementById('bank-search').addEventListener('input', debounce((e) => {
      state.vocabularyFilters.search = e.target.value;
      loadBankList();
    }, 300));

    document.querySelectorAll('.letter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.vocabularyFilters.letter = btn.dataset.letter;
        renderVocabularyBank();
      });
    });

    await loadBankList();
  }

  async function loadBankList() {
    const listEl = document.getElementById('bank-list');
    listEl.innerHTML = loadingBlock('Loading your vocabulary...');
    const data = await Verba.api.getVocabulary(state.vocabularyFilters);

    if (!data.items.length) {
      listEl.innerHTML = emptyState('search_off', 'No words found', 'Try a different search or add new vocabulary.');
      return;
    }

    listEl.innerHTML = data.items.map((v) => `
      <a href="#/bank/${v.id}" class="block bg-white p-md rounded-xl border border-outline-variant shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-sm mb-1">
              <h4 class="font-headline-md text-headline-md-mobile text-on-surface uppercase">${escapeHtml(v.word)}</h4>
              ${v.status === 'processing' ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">processing…</span>' : ''}
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(v.meaning)}</p>
          </div>
          <div class="text-right shrink-0 ml-sm">
            ${v.part_of_speech ? `<span class="block font-label-sm text-label-sm text-primary">${escapeHtml(v.part_of_speech)}</span>` : ''}
            ${v.level ? `<span class="block font-label-sm text-label-sm text-on-surface-variant">${escapeHtml(v.level)}</span>` : ''}
          </div>
        </div>
      </a>`).join('');
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // ---------------------------------------------------------------------
  // VOCABULARY DETAIL
  // ---------------------------------------------------------------------
  async function renderVocabularyDetail(id) {
    main().innerHTML = loadingBlock('Loading word details...');
    const v = await Verba.api.getVocabularyDetail(id);
    const m = v.material || {};

    const forms = m.verb_forms
      ? [['V1', m.verb_forms.v1], ['V2', m.verb_forms.v2], ['V3', m.verb_forms.v3], ['V-ing', m.verb_forms.ving]]
      : m.noun_forms
        ? [['Singular', m.noun_forms.singular], ['Plural', m.noun_forms.plural]]
        : m.adjective_forms
          ? [['Comparative', m.adjective_forms.comparative], ['Superlative', m.adjective_forms.superlative]]
          : [];

    main().innerHTML = `
      <a href="#/bank" class="inline-flex items-center gap-1 text-primary font-label-md text-label-md mb-sm">
        <span class="material-symbols-outlined text-[18px]">arrow_back</span> Back to Bank
      </a>

      <section class="bg-white p-md rounded-xl border border-outline-variant shadow-sm mb-md">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">${escapeHtml(v.word)}</h1>
            <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(m.pronunciation || '')}</p>
          </div>
          <button id="delete-word-btn" class="text-error">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
        <div class="flex gap-2 mt-sm">
          ${m.part_of_speech ? `<span class="px-2 py-1 bg-primary-container text-on-primary-container rounded text-[11px] font-bold uppercase">${escapeHtml(m.part_of_speech)}</span>` : ''}
          ${m.level ? `<span class="px-2 py-1 bg-surface-container-high rounded text-[11px] font-bold uppercase">${escapeHtml(m.level)}</span>` : ''}
        </div>
      </section>

      <section class="space-y-md">
        ${detailBlock('Meaning', escapeHtml(v.meaning))}
        ${detailBlock('Definition', escapeHtml(m.definition))}
        ${forms.length ? detailBlock('Grammar Forms', forms.map(([k, val]) => `<span class="inline-block mr-3"><b>${k}:</b> ${escapeHtml(val)}</span>`).join('')) : ''}
        ${(m.examples || []).length ? detailBlock('Examples', m.examples.map((ex) => `<p class="mb-1 italic">"${escapeHtml(ex.sentence)}" <span class="text-on-surface-variant not-italic">— ${escapeHtml(ex.translation)}</span></p>`).join('')) : ''}
        ${(m.synonyms || []).length ? detailBlock('Synonyms', m.synonyms.map(escapeHtml).join(', ')) : ''}
        ${(m.antonyms || []).length ? detailBlock('Antonyms', m.antonyms.map(escapeHtml).join(', ')) : ''}
        ${(m.related_words || []).length ? detailBlock('Related Words', m.related_words.map(escapeHtml).join(', ')) : ''}
        ${(m.common_expressions || []).length ? detailBlock('Common Expressions', m.common_expressions.map(escapeHtml).join(', ')) : ''}
        ${m.usage_notes ? detailBlock('Usage Notes', escapeHtml(m.usage_notes)) : ''}
        ${m.common_mistakes ? detailBlock('Common Mistakes', escapeHtml(m.common_mistakes)) : ''}
      </section>
    `;

    document.getElementById('delete-word-btn').addEventListener('click', async () => {
      if (!confirm(`Remove "${v.word}" from your vocabulary bank?`)) return;
      await Verba.api.deleteVocabulary(id);
      toast('Word removed.', 'success');
      goTo('/bank');
    });
  }

  function detailBlock(title, html) {
    return `
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
        <h3 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">${title}</h3>
        <div class="font-body-md text-body-md text-on-surface">${html}</div>
      </div>`;
  }

  // ---------------------------------------------------------------------
  // QUIZ
  // ---------------------------------------------------------------------
  async function renderQuiz() {
    main().innerHTML = loadingBlock('Preparing your quiz...');
    const data = await Verba.api.generateQuiz(10);

    if (!data.questions.length) {
      main().innerHTML = emptyState('quiz', 'Not enough vocabulary yet', 'Add a few words first — quizzes are generated from your own vocabulary bank.');
      return;
    }

    state.activeQuiz = { questions: data.questions, index: 0, answers: [] };
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const quiz = state.activeQuiz;
    const q = quiz.questions[quiz.index];
    const progressPct = Math.round((quiz.index / quiz.questions.length) * 100);

    main().innerHTML = `
      <section class="mb-md">
        <div class="flex justify-between items-center mb-xs">
          <span class="font-label-sm text-label-sm text-on-surface-variant">Question ${quiz.index + 1} of ${quiz.questions.length}</span>
          <span class="font-label-sm text-label-sm text-primary">${q.type.replace('_', ' ')}</span>
        </div>
        <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div class="bg-primary h-full rounded-full transition-all duration-300" style="width:${progressPct}%;"></div>
        </div>
      </section>

      <section class="bg-white p-md rounded-xl border border-outline-variant shadow-sm mb-md">
        <h2 class="font-headline-md text-headline-md-mobile text-on-surface">${escapeHtml(q.question)}</h2>
      </section>

      <section id="quiz-options" class="space-y-sm">
        ${q.options.map((opt) => `
          <button data-answer="${escapeHtml(opt)}" class="quiz-option w-full text-left p-md bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-body-md hover:bg-surface-container-low transition-colors">
            ${escapeHtml(opt)}
          </button>`).join('')}
      </section>
    `;

    document.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => handleQuizAnswer(btn.dataset.answer, q));
    });
  }

  function handleQuizAnswer(given, question) {
    const quiz = state.activeQuiz;
    quiz.answers.push({ question_id: question.id, given_answer: given, correct_answer: question.correct_answer });

    const isCorrect = given === question.correct_answer;
    document.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.answer === question.correct_answer) {
        btn.classList.add('bg-primary-container', 'border-primary');
      } else if (btn.dataset.answer === given && !isCorrect) {
        btn.classList.add('bg-error-container', 'border-error');
      }
    });

    setTimeout(() => {
      quiz.index += 1;
      if (quiz.index < quiz.questions.length) {
        renderQuizQuestion();
      } else {
        finishQuiz();
      }
    }, 700);
  }

  async function finishQuiz() {
    main().innerHTML = loadingBlock('Scoring your quiz...');
    const result = await Verba.api.saveQuizResult(state.activeQuiz.answers);
    state.activeQuiz = null;

    main().innerHTML = `
      <section class="flex flex-col items-center text-center py-xl gap-sm">
        <span class="material-symbols-outlined text-[56px] text-primary">emoji_events</span>
        <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">${result.score}%</h1>
        <p class="font-body-md text-body-md text-on-surface-variant">${result.correct} correct · ${result.wrong} wrong out of ${result.total}</p>
        <div class="flex gap-sm mt-md">
          <a href="#/quiz" class="px-5 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md">Try Again</a>
          <a href="#/dashboard" class="px-5 py-3 bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md">Dashboard</a>
        </div>
      </section>
    `;
  }

  // ---------------------------------------------------------------------
  // PROGRESS
  // ---------------------------------------------------------------------
  async function renderProgress() {
    main().innerHTML = loadingBlock('Loading your progress...');
    const data = await Verba.api.getProgress();

    main().innerHTML = `
      <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-md">Learning Progress</h1>

      <section class="grid grid-cols-2 gap-sm mb-md">
        ${metricCard('menu_book', 'Total Words', data.total_words)}
        ${metricCard('military_tech', 'Mastery', data.mastery_level)}
        ${metricCard('bolt', 'Quiz Average', data.quiz_average + '%')}
        ${metricCard('local_fire_department', 'Streak', data.streak + ' days')}
      </section>

      <section class="bg-white p-md rounded-xl border border-outline-variant mb-md">
        <h3 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Vocabulary by Level</h3>
        <div class="space-y-xs">
          ${Object.entries(data.level_distribution).map(([level, count]) => `
            <div class="flex justify-between items-center">
              <span class="font-body-md text-body-md text-on-surface">${escapeHtml(level)}</span>
              <span class="font-label-md text-label-md text-primary">${count}</span>
            </div>`).join('') || '<p class="font-body-md text-body-md text-on-surface-variant">No data yet.</p>'}
        </div>
      </section>

      <section class="bg-white p-md rounded-xl border border-outline-variant">
        <h3 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Weak Words</h3>
        ${data.weak_words.length
          ? `<div class="flex flex-wrap gap-2">${data.weak_words.map((w) => `<span class="px-3 py-1 bg-error-container text-on-error-container rounded-full text-label-sm font-label-sm">${escapeHtml(w.answer)} (${w.missed})</span>`).join('')}</div>`
          : '<p class="font-body-md text-body-md text-on-surface-variant">No weak words detected yet — keep quizzing!</p>'}
      </section>
    `;
  }

  function metricCard(icon, label, value) {
    return `
      <div class="bg-surface-container-low p-sm rounded-xl border border-outline-variant">
        <div class="flex items-center gap-xs mb-xs text-on-surface-variant">
          <span class="material-symbols-outlined text-[20px]">${icon}</span>
          <span class="font-label-sm text-label-sm">${label}</span>
        </div>
        <span class="font-headline-md text-headline-md-mobile">${value}</span>
      </div>`;
  }

  // ---------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------
  async function renderSettings() {
    const configured = Verba.api.isConfigured();
    const apiUrl = Verba.api.getApiUrl();

    main().innerHTML = `
      <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-md">Settings</h1>

      <section class="mb-lg">
        <h2 class="font-headline-md text-headline-md-mobile text-on-surface mb-sm">Connection</h2>
        <div class="bg-white rounded-xl border border-outline-variant p-md shadow-sm flex items-center gap-sm">
          <span class="material-symbols-outlined ${configured ? 'text-primary' : 'text-error'}">${configured ? 'cloud_done' : 'cloud_off'}</span>
          <div class="min-w-0">
            <p class="font-body-md text-body-md text-on-surface">${configured ? 'Connected to Apps Script backend' : 'Backend not configured'}</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant truncate">${configured ? escapeHtml(apiUrl) : ''}</p>
          </div>
        </div>
        <button id="ping-btn" class="mt-sm px-4 py-2 bg-surface-container-low rounded-lg font-label-md text-label-md text-primary">Test Connection</button>
        <p id="ping-result" class="font-label-sm text-label-sm text-on-surface-variant mt-xs"></p>
      </section>

      <section class="mb-lg">
        <h2 class="font-headline-md text-headline-md-mobile text-on-surface mb-sm">Account</h2>
        <div class="bg-white rounded-xl border border-outline-variant shadow-sm divide-y divide-outline-variant overflow-hidden">
          <button id="logout-btn" class="w-full flex items-start gap-sm p-md text-left active:bg-surface-container-lowest">
            <span class="material-symbols-outlined text-on-surface-variant">logout</span>
            <div>
              <p class="font-body-md text-body-md text-on-surface">Log Out</p>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Disconnect this device and return to the setup screen. Your spreadsheet data is not affected.</p>
            </div>
          </button>
          <button id="reset-data-btn" class="w-full flex items-start gap-sm p-md text-left active:bg-error-container/30">
            <span class="material-symbols-outlined text-error">delete_forever</span>
            <div>
              <p class="font-body-md text-body-md text-error">Reset All Data</p>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Permanently erase every word, quiz, and progress entry from the Google Spreadsheet. This cannot be undone.</p>
            </div>
          </button>
        </div>
      </section>

      <section class="mb-lg">
        <h2 class="font-headline-md text-headline-md-mobile text-on-surface mb-sm">About</h2>
        <div class="bg-white rounded-xl border border-outline-variant p-md shadow-sm space-y-1">
          <p class="font-body-md text-body-md text-on-surface">Verba — AI Vocabulary Learning Platform</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant">Database: Google Spreadsheet · Backend: Google Apps Script</p>
        </div>
      </section>
    `;

    document.getElementById('ping-btn').addEventListener('click', async () => {
      const out = document.getElementById('ping-result');
      out.textContent = 'Pinging...';
      try {
        const res = await Verba.api.ping();
        out.textContent = '✓ ' + res.message;
      } catch (err) {
        out.textContent = '✗ ' + err.message;
      }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      if (!confirm('Log out and disconnect this device? You will need to re-enter your Apps Script URL to use Verba again.')) return;
      Verba.api.clearApiUrl();
      toast('Logged out.', 'info');
      VerbaApp.boot();
    });

    document.getElementById('reset-data-btn').addEventListener('click', async () => {
      const sure = confirm('This will permanently delete ALL vocabulary, quizzes, and progress from your Google Spreadsheet. This cannot be undone. Continue?');
      if (!sure) return;
      const typed = prompt('Type RESET (all caps) to confirm:');
      if (typed !== 'RESET') {
        toast('Reset cancelled.', 'info');
        return;
      }
      try {
        await Verba.api.resetData();
        toast('All data has been reset.', 'success');
        goTo('/dashboard');
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  function boot() {
    if (!Verba.api.isConfigured()) {
      renderSetupScreen();
      return;
    }
    setChromeVisible(true);
    navigate();
  }

  function init() {
    window.addEventListener('hashchange', navigate);
    boot();
  }

  return { init, goTo, boot };
})();

document.addEventListener('DOMContentLoaded', VerbaApp.init);