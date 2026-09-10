# AdVance Client Questionnaire Quiz

A quiz site for the team: pick a PM (or "All Clients") and get a multiple-choice
quiz testing how well you know each active client's onboarding questionnaire.

## How it works (static version)

Every quiz question was written by hand (well — by Claude, reading each
client's actual questionnaire doc) and saved in
`netlify/functions/data/quizzes.json`. The site just serves questions from
that file — **no live ClickUp, Google Drive, or Anthropic API calls at
quiz-time at all.** This means:

- No rate limits, ever, no matter how much the team uses it.
- No ongoing API costs.
- No API keys or environment variables needed at all.
- Question order (and which client's questions come up) reshuffles on every
  load, so repeat plays don't feel identical.

The tradeoff: it's not automatically live. When a client's answers change or
a new client goes active, the quiz won't reflect that until `quizzes.json`
is regenerated and redeployed.

## Deployment

This is about as simple as static sites get:

1. Push this whole folder to a GitHub repo.
2. Connect the repo to Netlify (New site from Git).
3. Deploy. That's it — no environment variables to set.

`netlify.toml` handles the redirect from `/api/*` to the actual function.

## Updating the quiz content later

When you want to refresh what's in the quiz (new client, updated answers,
a client goes inactive):

1. Gather the updated questionnaire content — either the client's own doc
   link, or just paste the text directly.
2. Ask Claude (in a chat, same way this was built) to read it and update
   `netlify/functions/data/quizzes.json` with new/updated questions,
   following the same JSON shape:
   ```json
   {
     "Aldrin": [ { "client": "...", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } ],
     "Alexis": [ ... ],
     "Ann": [ ... ],
     "Liz": [ ... ],
     "ALL": [ ... ]
   }
   ```
   `"ALL"` should be the combined set of every PM's questions.
3. Replace `netlify/functions/data/quizzes.json` in the repo with the
   updated file and redeploy.

## Project structure

```
index.html                          -- the whole site (PM picker + quiz UI)
netlify.toml                        -- redirects /api/* to functions
netlify/functions/get-quiz.js       -- serves questions from data/quizzes.json
netlify/functions/data/quizzes.json -- the actual quiz content
```
