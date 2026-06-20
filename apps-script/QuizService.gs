/**
 * QuizService.gs
 * -----------------------------------------------------------------------
 * - createQuizQuestionsForVocabulary_(): builds a small bank of question
 *   rows (Quiz_Data) every time a word is added, using the just-generated
 *   AI material plus random distractors pulled from the existing bank.
 * - generateQuiz(): samples random questions from Quiz_Data for the
 *   quiz screen (triggered automatically every 50 words, or on demand).
 * - saveQuizResult(): records a finished quiz attempt and updates Progress.
 * -----------------------------------------------------------------------
 */

var QUESTION_TYPES = ['en_to_id', 'id_to_en', 'fill_blank', 'usage', 'multiple_choice'];

function pickRandom_(arr, n) {
  var copy = arr.slice();
  var out = [];
  while (copy.length && out.length < n) {
    var idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * Generates 2-3 questions for a freshly-added word and appends them to
 * Quiz_Data, using other existing words as multiple-choice distractors.
 */
function createQuizQuestionsForVocabulary_(vocabId, word, aiResult) {
  var allVocab = sheetToObjects_(SHEETS.VOCABULARY).filter(function (v) { return v.id !== vocabId; });
  var meaning = aiResult.meaning || '';
  var example = (aiResult.examples && aiResult.examples[0]) || null;

  // Build distractor pools from other words already in the bank.
  var distractorMeanings = pickRandom_(allVocab.map(function (v) { return v.indonesian_meaning; }).filter(Boolean), 3);
  var distractorWords = pickRandom_(allVocab.map(function (v) { return v.word; }).filter(Boolean), 3);

  var rows = [];

  // Type 1: English -> Indonesian (multiple choice)
  if (meaning && distractorMeanings.length >= 1) {
    var optsMeaning = shuffleOptions_(meaning, distractorMeanings);
    rows.push({
      id: generateId_('quiz'),
      vocabulary_id: vocabId,
      type: 'en_to_id',
      question: 'What is the meaning of "' + word + '"?',
      option_a: optsMeaning[0], option_b: optsMeaning[1],
      option_c: optsMeaning[2], option_d: optsMeaning[3],
      correct_answer: meaning
    });
  }

  // Type 2: Indonesian -> English (multiple choice)
  if (meaning && distractorWords.length >= 1) {
    var optsWord = shuffleOptions_(word, distractorWords);
    rows.push({
      id: generateId_('quiz'),
      vocabulary_id: vocabId,
      type: 'id_to_en',
      question: 'Which English word means "' + meaning + '"?',
      option_a: optsWord[0], option_b: optsWord[1],
      option_c: optsWord[2], option_d: optsWord[3],
      correct_answer: word
    });
  }

  // Type 3: Fill in the blank, using the AI-generated example sentence.
  if (example && example.sentence && example.sentence.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
    var blanked = example.sentence.replace(new RegExp(word, 'i'), 'ـ_____ـ');
    var optsBlank = shuffleOptions_(word, distractorWords);
    rows.push({
      id: generateId_('quiz'),
      vocabulary_id: vocabId,
      type: 'fill_blank',
      question: 'Fill in the blank: "' + blanked + '"',
      option_a: optsBlank[0], option_b: optsBlank[1],
      option_c: optsBlank[2], option_d: optsBlank[3],
      correct_answer: word
    });
  }

  rows.forEach(function (r) { appendObject_(SHEETS.QUIZ_DATA, r); });
  return rows;
}

function shuffleOptions_(correct, distractors) {
  var pool = [correct].concat(distractors.slice(0, 3));
  while (pool.length < 4) pool.push('—'); // pad if not enough distractors yet
  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  return pool;
}

/** Samples `count` random questions from the Quiz_Data bank. */
function generateQuiz(payload) {
  payload = payload || {};
  var count = parseInt(payload.count, 10) || 10;

  var bank = sheetToObjects_(SHEETS.QUIZ_DATA);
  if (bank.length === 0) {
    return { questions: [], total_available: 0 };
  }

  var selected = pickRandom_(bank, Math.min(count, bank.length)).map(function (q) {
    return {
      id: q.id,
      vocabulary_id: q.vocabulary_id,
      type: q.type,
      question: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(function (o) { return o !== '—'; }),
      correct_answer: q.correct_answer
    };
  });

  return { questions: selected, total_available: bank.length };
}

/**
 * Stores the result of a completed quiz attempt and updates Progress
 * (quiz_score running average + marks the milestone as quizzed so the
 * frontend stops re-triggering the same quiz).
 */
function saveQuizResult(payload) {
  payload = payload || {};
  var userId = payload.user_id || DEFAULT_USER_ID;
  var answers = payload.answers || []; // [{question_id, given_answer, correct_answer}]
  var correct = answers.filter(function (a) { return a.given_answer === a.correct_answer; }).length;
  var total = answers.length;
  var score = total > 0 ? Math.round((correct / total) * 100) : 0;

  var historyId = generateId_('hist');
  appendObject_(SHEETS.QUIZ_HISTORY, {
    id: historyId,
    user_id: userId,
    date: new Date().toISOString(),
    total_questions: total,
    correct: correct,
    wrong: total - correct,
    score: score,
    details: answers
  });

  var progress = ensureProgressRow_(userId);
  var history = sheetToObjects_(SHEETS.QUIZ_HISTORY).filter(function (h) { return h.user_id === userId; });
  var avgScore = Math.round(history.reduce(function (s, h) { return s + Number(h.score || 0); }, 0) / history.length);

  updateObjectById_(SHEETS.PROGRESS, 'user_id', userId, {
    quiz_score: avgScore,
    last_milestone_quizzed: progress.total_words
  });

  return { id: historyId, score: score, correct: correct, wrong: total - correct, total: total, average_score: avgScore };
}

function getQuizHistory(payload) {
  var userId = (payload && payload.user_id) || DEFAULT_USER_ID;
  var history = sheetToObjects_(SHEETS.QUIZ_HISTORY)
    .filter(function (h) { return h.user_id === userId; })
    .map(function (h) { return parseJsonFields_(h, ['details']); })
    .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  return { history: history };
}

function getProgress(payload) {
  var userId = (payload && payload.user_id) || DEFAULT_USER_ID;
  var progress = ensureProgressRow_(userId);
  var vocab = sheetToObjects_(SHEETS.VOCABULARY);
  var materials = sheetToObjects_(SHEETS.AI_MATERIALS);

  var levelCounts = {};
  materials.forEach(function (m) {
    var lvl = m.level || 'Unknown';
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
  });

  var history = sheetToObjects_(SHEETS.QUIZ_HISTORY).filter(function (h) { return h.user_id === userId; });
  var weakWords = []; // words most frequently answered wrong, derived from quiz history details
  var wrongCounts = {};
  history.forEach(function (h) {
    var details = h.details;
    try { details = typeof details === 'string' ? JSON.parse(details) : details; } catch (e) { details = []; }
    (details || []).forEach(function (a) {
      if (a.given_answer !== a.correct_answer) {
        wrongCounts[a.correct_answer] = (wrongCounts[a.correct_answer] || 0) + 1;
      }
    });
  });
  weakWords = Object.keys(wrongCounts)
    .sort(function (a, b) { return wrongCounts[b] - wrongCounts[a]; })
    .slice(0, 10)
    .map(function (w) { return { answer: w, missed: wrongCounts[w] }; });

  return {
    total_words: progress.total_words,
    mastery_level: progress.mastery_level,
    quiz_average: progress.quiz_score,
    streak: progress.streak,
    quizzes_taken: history.length,
    level_distribution: levelCounts,
    weak_words: weakWords,
    last_activity: progress.last_activity
  };
}
