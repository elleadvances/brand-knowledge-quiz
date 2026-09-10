// Serves pre-written quiz questions from data/quizzes.json -- no live
// ClickUp, Google Drive, or Anthropic calls at all. This trades "always
// live" for "free and simple": the questions were written once (by hand,
// reading each client's real questionnaire) and just get served here.
//
// To update: regenerate data/quizzes.json (ask Claude to read updated
// client docs and rewrite it) and redeploy. See README.md.

const quizzes = require("./data/quizzes.json");

exports.handler = async (event) => {
  try {
    const pm = (event.queryStringParameters && event.queryStringParameters.pm) || "ALL";

    const questions = quizzes[pm];
    if (!questions || questions.length === 0) {
      return respond(200, {
        questions: [],
        clients: [],
        message: "No quiz questions found for this selection.",
      });
    }

    // Shuffle order on every load so repeat plays don't feel identical.
    const shuffled = shuffle(questions);
    const clients = [...new Set(shuffled.map((q) => q.client))];

    return respond(200, { questions: shuffled, clients });
  } catch (err) {
    console.error(err);
    return respond(500, { error: err.message || "Something went wrong loading the quiz." });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
