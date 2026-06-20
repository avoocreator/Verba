/**
 * SheetService.gs
 * -----------------------------------------------------------------------
 * Everything that touches Google Spreadsheet directly:
 *  - setupSpreadsheet(): creates sheets/tabs + headers if missing
 *  - generic row <-> object helpers used by every other service
 * -----------------------------------------------------------------------
 */

var SHEET_SCHEMAS = {
  Vocabulary: ['id', 'word', 'indonesian_meaning', 'status', 'created_at'],
  AI_Materials: [
    'id', 'vocabulary_id', 'pronunciation', 'part_of_speech', 'level',
    'definition', 'verb_forms', 'noun_forms', 'adjective_forms',
    'examples', 'synonyms', 'antonyms', 'related_words',
    'common_expressions', 'usage_notes', 'common_mistakes', 'updated_at'
  ],
  Quiz_Data: [
    'id', 'vocabulary_id', 'type', 'question',
    'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'
  ],
  Quiz_History: [
    'id', 'user_id', 'date', 'total_questions', 'correct', 'wrong', 'score', 'details'
  ],
  Progress: [
    'user_id', 'total_words', 'quiz_score', 'mastery_level',
    'streak', 'last_activity', 'last_milestone_quizzed'
  ]
};

/**
 * Creates every required sheet (if missing) with the correct header row.
 * Safe to run multiple times. Call once from the Apps Script editor,
 * or via the API action "setup".
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet_();
  var created = [];

  Object.keys(SHEET_SCHEMAS).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      created.push(name);
    }
    var headers = SHEET_SCHEMAS[name];
    var existingHeaderRange = sheet.getRange(1, 1, 1, headers.length);
    existingHeaderRange.setValues([headers]);
    sheet.setFrozenRows(1);
  });

  // Remove the default empty "Sheet1" if it's still there and unused.
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    var isEmpty = defaultSheet.getLastRow() === 0;
    if (isEmpty) ss.deleteSheet(defaultSheet);
  }

  // Seed a Progress row for the default user if one doesn't exist yet.
  ensureProgressRow_(DEFAULT_USER_ID);

  return { createdSheets: created, allSheets: Object.keys(SHEET_SCHEMAS) };
}

function getSheet_(name) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet "' + name + '" not found. Run setupSpreadsheet() first.');
  }
  return sheet;
}

function getHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

/** Reads an entire sheet and returns an array of plain objects. */
function sheetToObjects_(sheetName) {
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .map(function (row, idx) {
      var obj = { _row: idx + 2 }; // 1-based row index, header is row 1
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    })
    .filter(function (obj) { return obj.id !== '' && obj.id !== undefined && obj.id !== null; });
}

/** Appends a single object as a new row, matching the sheet's header order. */
function appendObject_(sheetName, obj) {
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);
  var row = headers.map(function (h) {
    var v = obj[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  sheet.appendRow(row);
  return obj;
}

/** Updates an existing row (found by matching idField === idValue) with new values. */
function updateObjectById_(sheetName, idField, idValue, patch) {
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);
  var idCol = headers.indexOf(idField);
  if (idCol === -1) throw new Error('Field "' + idField + '" not found in sheet ' + sheetName);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var idValues = sheet.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]) === String(idValue)) {
      var rowIndex = i + 2;
      var existingRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      var merged = headers.map(function (h, c) {
        if (patch.hasOwnProperty(h)) {
          var v = patch[h];
          return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v;
        }
        return existingRow[c];
      });
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([merged]);
      return true;
    }
  }
  return false;
}

function deleteObjectById_(sheetName, idField, idValue) {
  var sheet = getSheet_(sheetName);
  var headers = getHeaders_(sheet);
  var idCol = headers.indexOf(idField);
  if (idCol === -1) throw new Error('Field "' + idField + '" not found in sheet ' + sheetName);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var idValues = sheet.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]) === String(idValue)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/** Parses any JSON-string fields back into objects/arrays for the API response. */
function parseJsonFields_(obj, fields) {
  var out = Object.assign({}, obj);
  fields.forEach(function (f) {
    if (typeof out[f] === 'string' && out[f].trim().length > 0) {
      try { out[f] = JSON.parse(out[f]); } catch (e) { /* leave as raw string */ }
    }
  });
  return out;
}

function generateId_(prefix) {
  return prefix + '_' + Utilities.getUuid().split('-')[0] + Date.now().toString(36);
}

function ensureProgressRow_(userId) {
  var rows = sheetToObjects_(SHEETS.PROGRESS);
  var existing = rows.find(function (r) { return r.user_id === userId; });
  if (existing) return existing;

  var fresh = {
    user_id: userId,
    total_words: 0,
    quiz_score: 0,
    mastery_level: 'Beginner',
    streak: 0,
    last_activity: new Date().toISOString(),
    last_milestone_quizzed: 0
  };
  appendObject_(SHEETS.PROGRESS, fresh);
  return fresh;
}
