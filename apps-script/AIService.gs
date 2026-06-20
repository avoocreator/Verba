/**
 * AIService.gs
 * -----------------------------------------------------------------------
 * Talks to an external AI API (Anthropic Claude by default, OpenAI also
 * supported) to turn a raw word + Indonesian meaning into a complete,
 * structured set of learning material.
 *
 * Swap providers by changing the AI_PROVIDER script property — no other
 * code needs to change since both providers are normalized to the same
 * return shape by parseAIJson_().
 * -----------------------------------------------------------------------
 */

function buildVocabularyPrompt_(word, meaning) {
  return [
    'You are a precise English-vocabulary content generator for an Indonesian-speaking learner.',
    'Given the English word "' + word + '" with the learner-provided Indonesian meaning "' + meaning + '",',
    'return ONLY a single valid JSON object (no markdown fences, no commentary) with this exact shape:',
    '',
    '{',
    '  "word": string,',
    '  "meaning": string,                 // best Indonesian meaning (refine if needed)',
    '  "pronunciation": string,            // IPA, e.g. "/əˈtʃiːv/"',
    '  "part_of_speech": "verb"|"noun"|"adjective"|"adverb"|"other",',
    '  "level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",',
    '  "definition": string,               // clear English definition',
    '  "verb_forms": {"v1":string,"v2":string,"v3":string,"ving":string} | null,',
    '  "noun_forms": {"singular":string,"plural":string} | null,',
    '  "adjective_forms": {"comparative":string,"superlative":string} | null,',
    '  "examples": [ {"sentence": string, "translation": string} ],  // 3 examples',
    '  "synonyms": [string],               // up to 5',
    '  "antonyms": [string],               // up to 5',
    '  "related_words": [string],          // up to 5',
    '  "common_expressions": [string],     // common phrases/idioms using the word',
    '  "usage_notes": string,              // short note on how/when to use it naturally',
    '  "common_mistakes": string           // common mistake Indonesian learners make with this word',
    '}',
    '',
    'Only fill verb_forms / noun_forms / adjective_forms that match part_of_speech; set the others to null.',
    'Respond with the JSON object only.'
  ].join('\n');
}

/**
 * Calls the configured AI provider and returns a parsed, normalized object.
 * Throws on failure so the caller can mark the vocabulary entry as "error".
 */
function callAIForVocabulary_(word, meaning) {
  var cfg = getAIConfig_();
  if (!cfg.apiKey) {
    throw new Error('AI_API_KEY is not set in Script Properties.');
  }

  var prompt = buildVocabularyPrompt_(word, meaning);
  var rawText;

  if (cfg.provider === 'openai') {
    rawText = callOpenAI_(prompt, cfg);
  } else {
    rawText = callAnthropic_(prompt, cfg);
  }

  return parseAIJson_(rawText);
}

function callAnthropic_(prompt, cfg) {
  var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: cfg.model || 'claude-3-5-haiku-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    }),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var body = JSON.parse(response.getContentText());
  if (code >= 300) {
    throw new Error('Anthropic API error (' + code + '): ' + (body.error && body.error.message));
  }
  return (body.content || []).map(function (c) { return c.text || ''; }).join('\n');
}

function callOpenAI_(prompt, cfg) {
  var response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + cfg.apiKey },
    payload: JSON.stringify({
      model: cfg.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    }),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var body = JSON.parse(response.getContentText());
  if (code >= 300) {
    throw new Error('OpenAI API error (' + code + '): ' + (body.error && body.error.message));
  }
  return body.choices[0].message.content;
}

/** Strips markdown fences if present and parses the JSON payload. */
function parseAIJson_(rawText) {
  var cleaned = rawText.trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();

  var firstBrace = cleaned.indexOf('{');
  var lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('AI response did not contain a JSON object.');
  }
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  return JSON.parse(cleaned);
}
