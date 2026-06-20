/**
 * config.js
 * -----------------------------------------------------------------------
 * Verba no longer hardcodes the Apps Script URL here. Instead, the user
 * enters their deployment URL once on first launch (Setup screen), and
 * it's stored in this browser's localStorage — so the same build of the
 * app works for any user/device without editing source code.
 * -----------------------------------------------------------------------
 */
window.VERBA_CONFIG = {
  STORAGE_KEY: 'verba_api_url',   // localStorage key holding the Apps Script Web App URL
  USER_ID: 'user_default',        // single-user mode for now
  QUIZ_MILESTONE: 50              // every N words a quiz is auto-triggered
};