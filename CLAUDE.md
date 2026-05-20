# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (http://localhost:3000)
- `npm run build` — produce a **static export** into `out/` (see "Static export" below)
- `npm run lint` — run ESLint (`eslint-config-next` + TypeScript rules)
- `npm run start` — start a Next.js production server (rarely used here; the deploy target is static + Capacitor)

There is no test runner configured.

### Capacitor (iOS / Android)

The web app is wrapped as a native shell via Capacitor. `webDir` in `capacitor.config.ts` points at `out/`, so the native builds always consume whatever `npm run build` last produced.

- `npx cap sync` — copy the latest `out/` build into the `ios/` and `android/` projects
- `npx cap open ios` / `npx cap open android` — open the native project in Xcode / Android Studio

Typical mobile flow: `npm run build && npx cap sync && npx cap open <platform>`.

## Architecture

### Stack

Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS v4, with the React Compiler enabled (`reactCompiler: true` in `next.config.ts`, `babel-plugin-react-compiler` as a devDep). The whole UI is in Portuguese (pt-BR).

### Static export, not SSR

`next.config.ts` sets `output: 'export'`. There is **no server runtime** in production — everything is pre-rendered to static files in `out/`, and the Gemini API is called directly from the browser. This has two consequences worth keeping in mind before adding code:

- Do not add API routes, server actions, middleware, or anything that needs a Node server. They will not run.
- `NEXT_GEMINI_API_KEY` is exposed via `next.config.ts`'s `env` block, so it ends up in client bundles. Treat any value placed there as public.

`next.config.ts` also threads `PUSHER_*` and `REDIS_URL` env vars, but nothing in `src/` currently reads them — they are dormant scaffolding for a possible multiplayer/server feature, not active code.

### Game model

The whole game lives on a single client page (`src/app/page.tsx`) with local React state. There is no shared store, no router beyond the root, and no persistence between reloads.

Key pieces and how they connect:

- `src/app/game/types.ts` — `GameState`, `Player`, `Question`.
- `src/app/game/game-state.ts` — `initialGameState`. Currently hard-coded to **one player** (`id: '1'`, red). `GameState.players` is an array and `currentPlayerIndex` exists, so the data model is multi-player-ready, but `page.tsx` never advances `currentPlayerIndex`. Adding turn rotation is a one-spot change in `handleAnswer`.
- `src/app/game/questions.ts` — default Portuguese question bank (used when no PDF/image has been uploaded).
- `src/app/game/gemini.ts` — calls the Gemini API (`gemini-2.5-flash`) via `@google/generative-ai` directly from the browser. Three entry points: `extractQuestionsFromText`, `extractQuestionsFromImage` (multimodal), `generateTitleFromText`. Each prompts in Portuguese and asks for a JSON array; the code then slices between the first `[` and last `]` to tolerate prose wrappers around the JSON.
- `src/app/components/Board.tsx` — renders a 10×10 grid where **only the perimeter is playable** (36 cells, numbered 1–36 clockwise from the top-left). The center is reserved for the dice/buttons via a `center-content-container` grid area. It uses `React.Children.forEach` + `child.type.name === PlayerComponent.name` to split player tokens from other children so it can absolutely-position them on top of the perimeter cells. That name-based check is fragile under minification — extend it carefully if you add new child types.
- `src/app/components/Player.tsx` / `Dice.tsx` / `Quiz.tsx` — presentational.
- `src/app/components/PdfUploader.tsx` — handles `.pdf`, `.png`, `.jpg`. PDFs are parsed in the browser with `pdfjs-dist` in **5-page chunks**, and each chunk is sent to Gemini; the first chunk also generates a `Tema` (title). Images are read as base64 and sent to the multimodal endpoint.

### Game loop

`page.tsx` orchestrates everything:

1. `handleRoll(diceValue)` is called by `<Dice>` with a 1–6. It picks a random question from `customQuestions` (if a PDF/image has been processed) or the default `questions` bank, then sets `isQuizVisible: true`.
2. `<Quiz>` calls `handleAnswer(isCorrect)`. Correct → `position += diceValue`; incorrect → `position -= diceValue` (floored at 0). The hard-coded `WINNING_POSITION = 35` in `page.tsx` determines when the win modal shows — note this is **one less than the 36 perimeter cells** rendered by `Board`.
3. A feedback overlay shows for 2 s via `setTimeout`, then the dice is re-enabled.

### Dynamic imports

`Board` and `PdfUploader` are loaded with `next/dynamic` + `ssr: false` from `page.tsx`. `PdfUploader` *must* stay client-only because `pdfjs-dist` sets a worker URL via `import.meta.url` at module scope. If you add components that touch `window`, `document`, or worker URLs, follow the same pattern.

## Conventions

- The UI strings, prompts, and most identifiers are in Portuguese — keep new user-facing copy consistent.
- Game logic stays in `src/app/game/`; React/DOM concerns stay in `src/app/components/`. `page.tsx` is the only place that wires them together.
- Styling is plain CSS classes in `src/app/globals.css` (e.g. `quiz-overlay`, `restart-button`, `game-sidebar`) rather than Tailwind utilities, even though Tailwind v4 is configured. Match the existing class-name approach when editing existing components.
