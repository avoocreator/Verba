/**
 * api.js
 * -----------------------------------------------------------------------
 * Thin wrapper around fetch() for talking to the Apps Script Web App.
 *
 * The backend URL is no longer hardcoded — it's read from/written to
 * localStorage (see config.js for the storage key), set once via the
 * Setup screen the first time the app is opened on a device.
 *
 * Requests are POSTed with Content-Type "text/plain" on purpose — Apps
 * Script Web Apps cannot respond to CORS preflight (OPTIONS) requests,
 * so we keep every request a "simple request" (one of the few content
 * types that skip preflight) and parse JSON manually server-side via
 * e.postData.contents.
 * -----------------------------------------------------------------------
 */

const Verba = window.Verba || {};

Verba.api = (function () {
  const STORAGE_KEY = (window.VERBA_CONFIG && window.VERBA_CONFIG.STORAGE_KEY) || 'verba_api_url';
  const USER_ID = (window.VERBA_CONFIG && window.VERBA_CONFIG.USER_ID) || 'user_default';

  function getApiUrl() {
    return (localStorage.getItem(STORAGE_KEY) || '').trim();
  }

  function setApiUrl(url) {
    localStorage.setItem(STORAGE_KEY, url.trim());
  }

  function clearApiUrl() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isConfigured() {
    return Boolean(getApiUrl());
  }

  /** Low-level POST against an explicit URL — used both by call() and by the Setup screen to test a URL before saving it. */
  async function callUrl(url, action, payload = {}) {
    const fullPayload = Object.assign({ user_id: USER_ID }, payload);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload: fullPayload })
    });

    if (!res.ok) {
      throw new Error('Network error: ' + res.status + ' ' + res.statusText);
    }

    const json = await res.json();
    if (!json.ok) {
      throw new Error(json.error || 'Unknown API error');
    }
    return json.data;
  }

  async function call(action, payload = {}) {
    const url = getApiUrl();
    if (!url) {
      throw new Error('Verba is not connected to a backend yet. Enter your Apps Script Web App URL to get started.');
    }
    return callUrl(url, action, payload);
  }

  return {
    isConfigured,
    getApiUrl,
    setApiUrl,
    clearApiUrl,
    testUrl: (url) => callUrl(url, 'ping'),
    ping: () => call('ping'),
    setup: () => call('setup'),
    addVocabulary: (word, meaning) => call('addVocabulary', { word, meaning }),
    getVocabulary: (filters) => call('getVocabulary', filters || {}),
    getVocabularyDetail: (id) => call('getVocabularyDetail', { id }),
    deleteVocabulary: (id) => call('deleteVocabulary', { id }),
    getDashboard: () => call('getDashboard'),
    generateQuiz: (count) => call('generateQuiz', { count }),
    saveQuizResult: (answers) => call('saveQuizResult', { answers }),
    getQuizHistory: () => call('getQuizHistory'),
    getProgress: () => call('getProgress'),
    resetData: () => call('resetData')
  };
})();

window.Verba = Verba;