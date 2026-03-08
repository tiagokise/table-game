# GEMINI.md - Project Overview

## Project Overview

This is a web-based table game built with Next.js, React, and TypeScript. The game is played on a perimeter-based board where player movement is determined by a dice roll. After each roll, the player must answer a quiz question correctly to advance. Answering incorrectly will move the player backward. The goal is to reach the final position on the board.

The application uses Tailwind CSS for styling.

## Building and Running

### Prerequisites

- Node.js
- npm (or yarn/pnpm/bun)

### Installation

```bash
npm install
```

### Running the Development Server

To run the application in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will auto-update as you edit the files.

### Building for Production

To create a production build:

```bash
npm run build
```

### Running in Production

To start the application in production mode (after building):

```bash
npm run start
```

## Development Conventions

### Linting

The project uses ESLint for code linting. To run the linter:

```bash
npm run lint
```

### Code Style

- **TypeScript:** The project is written in TypeScript, so all new code should include type definitions.
- **Styling:** Styling is done using Tailwind CSS utility classes.
- **Components:** The application is built with React components, which can be found in `src/app/components`.
- **Game Logic:** The core game logic is separated from the UI and can be found in the `src/app/game` directory.

### Project Structure

- `src/app/page.tsx`: The main application component that orchestrates the game.
- `src/app/components/`: Contains the React components for the game (Board, Dice, Player, Quiz).
- `src/app/game/`: Contains the game logic, state, questions, and types.
- `public/`: Contains static assets like images and SVGs.
- `tailwind.config.ts`: Configuration file for Tailwind CSS.
- `next.config.ts`: Configuration file for Next.js.
