// Serves pre-written quiz questions from data/quizzes.json -- no live
// ClickUp, Google Drive, or Anthropic calls at all.
//
// Each PM has 5 fixed question sets (data/quizzes.json[pm] is an array of
// 5 arrays). Pass ?set=0-4 to pick one; the site rotates through them in
// order (0,1,2,3,4,0,...) so clicking the same PM repeatedly doesn't show
// the same questions every time. Defaults to set 0 if omitted/invalid.
//
// To update content: regenerate data/quizzes.json (ask Claude to read
// updated client docs and rewrite it) and redeploy. See README.md.

const quizzes = require("./data/quizzes.json");

exports.handler = async (event) => {
  try {
    const pm = (event.queryStringParameters && event.queryStringParameters.pm) || "ALL";
    const setParam = event.queryStringParameters && event.queryStringParameters.set;
    const setIndex = Number.isInteger(Number(setParam)) && Number(setParam) >= 0 && Number(setParam) <= 4
      ? Number(setParam)
      : 0;

    const sets = quizzes[pm];
    const questions = sets && sets[setIndex];

    if (!questions || questions.length === 0) {
      return respond(200, {
        questions: [],
        clients: [],
        message: "No quiz questions found for this selection.",
      });
    }

    // Shuffle order within the set on every load so it doesn't feel static.
    const shuffled = shuffle(questions);
    const clients = [...new Set(shuffled.map((q) => q.client))];

    return respond(200, { questions: shuffled, clients, setIndex });
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
