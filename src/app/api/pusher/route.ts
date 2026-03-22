// src/app/api/pusher/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { initialGameState } from '../../../game/game-state';
import { GameState } from '../../../game/types';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

const rooms = new Map<string, GameState>();
const WINNING_POSITION = 35;

function getRoom(roomName: string): GameState {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, JSON.parse(JSON.stringify(initialGameState)));
  }
  return rooms.get(roomName)!;
}

export async function POST(request: Request) {
  const { event, channel, payload, userId } = await request.json();
  const roomName = channel.replace('presence-game-', '');
  const gameState = getRoom(roomName);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  switch (event) {
    case 'rollDice':
      if (currentPlayer?.id !== userId) return NextResponse.json({ success: false, message: "Not your turn" });
      gameState.lastAnswerResult = null;
      gameState.diceValue = payload.diceValue;
      gameState.currentQuestion = payload.question;
      break;

    case 'showQuestion':
      if (currentPlayer?.id !== userId) return NextResponse.json({ success: false, message: "Not your turn" });
      gameState.isQuizVisible = true;
      break;

    case 'answerQuestion':
      if (currentPlayer?.id !== userId) return NextResponse.json({ success: false, message: "Not your turn" });
      const { isCorrect } = payload;
      const diceRoll = gameState.diceValue!;
      
      if (isCorrect) {
        currentPlayer.position = Math.min(WINNING_POSITION, currentPlayer.position + diceRoll);
        currentPlayer.score += diceRoll;
      }
      
      gameState.lastAnswerResult = { playerId: currentPlayer.id, isCorrect };
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      gameState.isQuizVisible = false;
      gameState.currentQuestion = null;
      gameState.diceValue = null;
      break;

    case 'resetGame':
      const newGameState = JSON.parse(JSON.stringify(initialGameState));
      newGameState.players = gameState.players.map((p, index) => ({
        ...p,
        position: 0,
        score: 0,
        id: index + 1, // Re-assign IDs to be safe
      }));
      rooms.set(roomName, newGameState);
      break;
  }

  await pusher.trigger(channel, 'gameState', rooms.get(roomName));
  return NextResponse.json({ success: true });
}
