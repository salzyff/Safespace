# SafeSpace

Sometimes a message is obviously bad. Sometimes it just feels weird and you cannot really explain why.

SafeSpace is for the second kind.

You can paste part of a conversation or add a screenshot. The app looks for warning signs such as pressure, secrecy, threats, grooming behaviour, scams and requests for private information. Instead of only giving a label, it explains what it noticed and suggests a few sensible next steps.

I built it for the **Child Safety in AI** hackathon.

## The idea

Most child-safety tools I found were built around monitoring: parents watch, kids get watched. I wanted to try a different direction.

SafeSpace does not run in the background. It does not create a parent activity feed. The person using it decides when they want help and what they want to share.

The goal is not to make AI the authority. The goal is to make it easier to pause, notice a red flag and talk to the right person when something feels off.

## What works in this MVP

- Paste a message or conversation for a safety check
- Upload a screenshot or image
- Gemini multimodal analysis
- Low, medium, high and urgent concern levels
- Plain-English explanations of what stood out
- Practical next steps for the person using it
- No account required
- No saved activity feed in the frontend

## Built with

- React
- Vite
- Google Gemini
- Vercel serverless functions
- Plain CSS

## Run it locally

Install the project:

```bash
npm install
```

Create `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The frontend itself can run with:

```bash
npm run dev
```

For the real `/api/analyze` function as well, use Vercel CLI:

```bash
npx vercel dev
```

## Deploying on Vercel

Import the repo into Vercel and add `GEMINI_API_KEY` under the project's environment variables. `GEMINI_MODEL` is optional if you want to change the model.

## A note on privacy

This MVP does not have accounts or a conversation-history database. The content someone submits is sent to the configured AI provider for that check.

A real production version would need a proper retention policy, rate limiting, abuse protection, child-appropriate consent, regional safeguarding guidance and an independent safety review before I would call it ready for real-world use.

## Important limitation

SafeSpace can be wrong. It is not an emergency service and it cannot know the full context of a relationship from one message. The result should be treated as a second opinion, not proof about another person's intentions.
