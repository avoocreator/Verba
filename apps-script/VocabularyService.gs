/**
 * VocabularyService.gs
 * -----------------------------------------------------------------------
 * Implements the core vocabulary endpoints described in the spec:
 *   addVocabulary(), getVocabulary(), getVocabularyDetail()
 * plus deleteVocabulary() and getDashboardSummary() which the frontend
 * needs but weren't explicitly named in the original list.
 * -----------------------------------------------------------------------
 */

var JSON_FIELDS_AI = [
  'verb_forms', 'noun_forms', 'adjective_forms', 'examples',
  'synonyms', 'antonyms', 'related_words', 'common_expressions'
];

/**
 * 1) Saves the raw word to Vocabulary
 * 2) Calls the AI to generate full learning material
 * 3) Saves the AI result to AI_Materials
 * 4) Updates Progress
 * 5) Flags whether this addition just crossed a quiz milestone (every 50 words)
 */
function addVocabulary(payload) {
  var word = (payload.word || '').toString().trim();
  var meaning = (payload.meaning || '').toString().trim();
  var userId = payload.user_id || DEFAULT_USER_ID;

  if (!word || !meaning) {
    throw new Error('Both "word" and "meaning" are required.');
  }

  var id = generateId_('vocab');
  var createdAt = new Date().toISOString();

  appendObject_(SHEETS.VOCABULARY, {
    id: id,
    word: word,
    indonesian_meaning: meaning,
    status: 'processing',
    created_at: createdAt
  });

  var aiResult;
  var status = 'ready';
  var errorMessage = '';

  try {
    aiResult = callAIForVocabulary_(word, meaning);
  } catch (err) {
    status = 'error';
    errorMessage = err && err.message ? err.message : String(err);
    aiResult = {
      pronunciation: '', part_of_speech: 'other', level: 'A1',
      definition: '', verb_forms: null, noun_forms: null, adjective_forms: null,
      examples: [], synonyms: [], antonyms: [], related_words: [],
      common_expressions: [], usage_notes: '', common_mistakes: ''
    };
  }

  appendObject_(SHEETS.AI_MATERIALS, {
    id: generateId_('mat'),
    vocabulary_id: id,
    pronunciation: aiResult.pronunciation || '',
    part_of_speech: aiResult.part_of_speech || 'other',
    level: aiResult.level || 'A1',
    definition: aiResult.definition || '',
    verb_forms: aiResult.verb_forms || null,
    noun_forms: aiResult.noun_forms || null,
    adjective_forms: aiResult.adjective_forms || null,
    examples: aiResult.examples || [],
    synonyms: aiResult.synonyms || [],
    antonyms: aiResult.antonyms || [],
    related_words: aiResult.related_words || [],
    common_expressions: aiResult.common_expressions || [],
    usage_notes: aiResult.usage_notes || '',
    common_mistakes: aiResult.common_mistakes || '',
    updated_at: new Date().toISOString()
  });

  updateObjectById_(SHEETS.VOCABULARY, 'id', id, {
    status: status,
    indonesian_meaning: aiResult.meaning || meaning
  });

  // Auto-generate quiz questions for this new word so the quiz bank grows with the vocabulary.
  try { createQuizQuestionsForVocabulary_(id, word, aiResult); } catch (e) { /* non-fatal */ }

  var progress = bumpProgressAfterNewWord_(userId);

  var triggerQuiz = progress.total_words > 0 &&
    progress.total_words % QUIZ_MILESTONE === 0 &&
    progress.last_milestone_quizzed < progress.total_words;

  return {
    id: id,
    word: word,
    meaning: aiResult.meaning || meaning,
    status: status,
    error: errorMessage,
    material: parseJsonFields_(aiResult, []),
    progress: progress,
    triggerQuiz: triggerQuiz,
    milestone: progress.total_words
  };
}

/** Returns a filtered, paginated list of vocabulary cards (joined with AI_Materials). */
function getVocabulary(payload) {
  payload = payload || {};
  var search = (payload.search || '').toString().toLowerCase().trim();
  var letter = (payload.letter || '').toString().toUpperCase().trim();
  var partOfSpeech = (payload.category || payload.part_of_speech || '').toString().toLowerCase().trim();
  var level = (payload.level || '').toString().toUpperCase().trim();
  var page = parseInt(payload.page, 10) || 1;
  var pageSize = parseInt(payload.pageSize, 10) || 20;

  var vocab = sheetToObjects_(SHEETS.VOCABULARY);
  var materials = sheetToObjects_(SHEETS.AI_MATERIALS);
  var materialsByVocabId = {};
  materials.forEach(function (m) { materialsByVocabId[m.vocabulary_id] = m; });

  var merged = vocab.map(function (v) {
    var m = materialsByVocabId[v.id] || {};
    return {
      id: v.id,
      word: v.word,
      meaning: v.indonesian_meaning,
      status: v.status,
      created_at: v.created_at,
      part_of_speech: m.part_of_speech || '',
      level: m.level || '',
      pronunciation: m.pronunciation || '',
      definition: m.definition || ''
    };
  });

  var filtered = merged.filter(function (v) {
    if (search && v.word.toLowerCase().indexOf(search) === -1 &&
        v.meaning.toLowerCase().indexOf(search) === -1) return false;
    if (letter && v.word.charAt(0).toUpperCase() !== letter) return false;
    if (partOfSpeech && v.part_of_speech.toLowerCase() !== partOfSpeech) return false;
    if (level && v.level.toUpperCase() !== level) return false;
    return true;
  });

  filtered.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });

  var total = filtered.length;
  var start = (page - 1) * pageSize;
  var pageItems = filtered.slice(start, start + pageSize);

  return { items: pageItems, total: total, page: page, pageSize: pageSize };
}

/** Returns the full vocabulary record + complete AI material for the detail page. */
function getVocabularyDetail(payload) {
  var id = payload.id;
  if (!id) throw new Error('"id" is required.');

  var vocab = sheetToObjects_(SHEETS.VOCABULARY).find(function (v) { return v.id === id; });
  if (!vocab) throw new Error('Vocabulary not found: ' + id);

  var material = sheetToObjects_(SHEETS.AI_MATERIALS).find(function (m) { return m.vocabulary_id === id; });
  var parsedMaterial = material ? parseJsonFields_(material, JSON_FIELDS_AI) : null;

  return {
    id: vocab.id,
    word: vocab.word,
    meaning: vocab.indonesian_meaning,
    status: vocab.status,
    created_at: vocab.created_at,
    material: parsedMaterial
  };
}

function deleteVocabulary(payload) {
  var id = payload.id;
  if (!id) throw new Error('"id" is required.');

  deleteObjectById_(SHEETS.VOCABULARY, 'id', id);

  var materials = sheetToObjects_(SHEETS.AI_MATERIALS);
  var match = materials.find(function (m) { return m.vocabulary_id === id; });
  if (match) deleteObjectById_(SHEETS.AI_MATERIALS, 'id', match.id);

  var quizQuestions = sheetToObjects_(SHEETS.QUIZ_DATA).filter(function (q) { return q.vocabulary_id === id; });
  quizQuestions.forEach(function (q) { deleteObjectById_(SHEETS.QUIZ_DATA, 'id', q.id); });

  return { deleted: true, id: id };
}

/** Aggregates everything the Dashboard page needs in a single call. */
function getDashboardSummary(payload) {
  var userId = (payload && payload.user_id) || DEFAULT_USER_ID;
  var progress = ensureProgressRow_(userId);
  var vocab = sheetToObjects_(SHEETS.VOCABULARY);
  var materials = sheetToObjects_(SHEETS.AI_MATERIALS);
  var materialsByVocabId = {};
  materials.forEach(function (m) { materialsByVocabId[m.vocabulary_id] = m; });

  var recent = vocab
    .slice()
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); })
    .slice(0, 5)
    .map(function (v) {
      var m = materialsByVocabId[v.id] || {};
      var parsed = parseJsonFields_(m, JSON_FIELDS_AI);
      return {
        id: v.id,
        word: v.word,
        meaning: v.indonesian_meaning,
        part_of_speech: m.part_of_speech || '',
        definition: m.definition || '',
        example: (parsed.examples && parsed.examples[0] && parsed.examples[0].sentence) || ''
      };
    });

  var history = sheetToObjects_(SHEETS.QUIZ_HISTORY).filter(function (h) { return h.user_id === userId; });
  var avgScore = history.length
    ? Math.round(history.reduce(function (s, h) { return s + Number(h.score || 0); }, 0) / history.length)
    : 0;

  var wordsToNextMilestone = QUIZ_MILESTONE - (progress.total_words % QUIZ_MILESTONE || QUIZ_MILESTONE);

  return {
    total_words: progress.total_words,
    mastery_level: progress.mastery_level,
    streak: progress.streak,
    quiz_average: avgScore,
    quizzes_taken: history.length,
    words_to_next_quiz: progress.total_words % QUIZ_MILESTONE === 0 ? QUIZ_MILESTONE : wordsToNextMilestone,
    recent_vocabulary: recent
  };
}

/** Updates Progress.total_words / streak / last_activity after a successful add. */
function bumpProgressAfterNewWord_(userId) {
  var progress = ensureProgressRow_(userId);
  var newTotal = Number(progress.total_words || 0) + 1;
  var today = new Date();
  var lastActivity = progress.last_activity ? new Date(progress.last_activity) : null;
  var streak = Number(progress.streak || 0);

  if (lastActivity) {
    var dayDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) streak += 1;
    else if (dayDiff > 1) streak = 1;
    // dayDiff === 0 -> same day, keep streak as-is
  } else {
    streak = 1;
  }

  var mastery = newTotal >= 500 ? 'Advanced' : newTotal >= 150 ? 'Intermediate' : 'Beginner';

  var patch = {
    total_words: newTotal,
    streak: streak,
    last_activity: today.toISOString(),
    mastery_level: mastery
  };
  updateObjectById_(SHEETS.PROGRESS, 'user_id', userId, patch);

  return Object.assign({}, progress, patch);
}
