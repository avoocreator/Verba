/**
 * Code.gs
 * -----------------------------------------------------------------------
 * Entry point for the Verba API.
 *
 * Deploy this project as a Web App:
 *   Deploy -> New deployment -> type: Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * The deployment URL becomes the API_BASE_URL used by the frontend
 * (see frontend/js/config.js).
 *
 * Every request — whether GET or POST — carries an "action" field that
 * selects which backend function to run. POST requests send the action
 * and payload as a JSON string in the request body (sent as
 * "text/plain" by the frontend on purpose, to avoid CORS preflight,
 * since Apps Script Web Apps cannot reply to OPTIONS preflight requests).
 * -----------------------------------------------------------------------
 */

function doGet(e) {
  return handleRequest_(e, 'GET');
}

function doPost(e) {
  return handleRequest_(e, 'POST');
}

function handleRequest_(e, method) {
  var action = '';
  var payload = {};

  try {
    if (method === 'GET') {
      action = (e.parameter && e.parameter.action) || '';
      payload = e.parameter || {};
    } else {
      action = (e.parameter && e.parameter.action) || '';
      if (e.postData && e.postData.contents) {
        var body = JSON.parse(e.postData.contents);
        action = action || body.action;
        payload = body.payload || body;
      }
    }

    var result = routeAction_(action, payload);
    return jsonResponse_({ ok: true, action: action, data: result });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      action: action,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function routeAction_(action, payload) {
  switch (action) {
    case 'ping':
      return { message: 'Verba API is running', time: new Date().toISOString() };

    case 'setup':
      return setupSpreadsheet();

    case 'addVocabulary':
      return addVocabulary(payload);

    case 'getVocabulary':
      return getVocabulary(payload);

    case 'getVocabularyDetail':
      return getVocabularyDetail(payload);

    case 'deleteVocabulary':
      return deleteVocabulary(payload);

    case 'getDashboard':
      return getDashboardSummary(payload);

    case 'generateQuiz':
      return generateQuiz(payload);

    case 'saveQuizResult':
      return saveQuizResult(payload);

    case 'getQuizHistory':
      return getQuizHistory(payload);

    case 'getProgress':
      return getProgress(payload);

    default:
      throw new Error('Unknown action: ' + action);
  }
}

/** Wraps a JS object as a JSON Web App response. */
function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
