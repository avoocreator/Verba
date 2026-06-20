/**
 * Config.gs
 * -----------------------------------------------------------------------
 * Central configuration for the Verba backend.
 *
 * All secrets (Spreadsheet ID, AI API key) are read from Script Properties
 * so nothing sensitive lives in source code. Set them once via:
 *   Apps Script editor -> Project Settings -> Script Properties
 * or run setupScriptProperties() below from the editor (fill in the
 * values first, run once, then DELETE the values from this file).
 * -----------------------------------------------------------------------
 */

// Names of the sheets/tabs inside the Google Spreadsheet.
var SHEETS = {
  VOCABULARY: 'Vocabulary',
  AI_MATERIALS: 'AI_Materials',
  QUIZ_DATA: 'Quiz_Data',
  QUIZ_HISTORY: 'Quiz_History',
  PROGRESS: 'Progress'
};

// How many new words trigger an automatic quiz (50, 100, 150 ...).
var QUIZ_MILESTONE = 50;

// Default single-user id used until real auth/multi-user is added.
var DEFAULT_USER_ID = 'user_default';

/**
 * Returns the active Spreadsheet object.
 * Priority:
 *  1. SPREADSHEET_ID stored in Script Properties (works for standalone scripts)
 *  2. The Spreadsheet this script is bound to (if deployed as a container-bound script)
 */
function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('No Spreadsheet configured. Set SPREADSHEET_ID in Script Properties.');
}

/** Reads the AI provider config from Script Properties. */
function getAIConfig_() {
  var props = PropertiesService.getScriptProperties();
  return {
    provider: props.getProperty('AI_PROVIDER') || 'anthropic', // 'anthropic' | 'openai'
    apiKey: props.getProperty('AI_API_KEY') || '',
    model: props.getProperty('AI_MODEL') || 'claude-3-5-haiku-20241022'
  };
}

/**
 * One-time helper to set Script Properties from code.
 * Fill in the values, select this function in the editor, click Run once,
 * then clear the values again so they are not left in plain text here.
 */
function setupScriptProperties() {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    'SPREADSHEET_ID': 'PASTE_YOUR_SPREADSHEET_ID_HERE',
    'AI_PROVIDER': 'anthropic',
    'AI_API_KEY': 'PASTE_YOUR_AI_API_KEY_HERE',
    'AI_MODEL': 'claude-3-5-haiku-20241022'
  });
  Logger.log('Script properties saved.');
}
