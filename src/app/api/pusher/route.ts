// src/app/api/pusher/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { GameState } from '@/app/game/types';
import redis from '@/lib/redis';
import { initialGameState } from '@/app/game/game-state';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

const WINNING_POSITION = 35;

async function getRoom(roomName: string): Promise<GameState> {
  const roomData = await redis.get(`room:${roomName}`);
  if (roomData) {
    return JSON.parse(roomData);
  }
  return JSON.parse(JSON.stringify(initialGameState));
}

export async function POST(request: Request) {
  const { event, channel, payload, userId } = await request.json();
  const roomName = channel.replace('presence-game-', '');
  const gameState = await getRoom(roomName);
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
      }));
      await redis.set(`room:${roomName}`, JSON.stringify(newGameState));
      await pusher.trigger(channel, 'gameState', newGameState);
      return NextResponse.json({ success: true });
  }

  await redis.set(`room:${roomName}`, JSON.stringify(gameState));
  await pusher.trigger(channel, 'gameState', gameState);
  return NextResponse.json({ success: true });
}
