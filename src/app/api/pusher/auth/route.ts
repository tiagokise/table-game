// src/app/api/pusher/auth/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { GameState } from '../../../game/types';
import { initialGameState } from '../../../game/game-state';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

const rooms = new Map<string, GameState>();

function getRoom(roomName: string): GameState {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, JSON.parse(JSON.stringify(initialGameState)));
  }
  return rooms.get(roomName)!;
}

export async function POST(request: Request) {
  const data = await request.formData();
  const socketId = data.get('socket_id') as string;
  const channel = data.get('channel_name') as string;
  const userId = Math.random().toString(36).substring(2, 9);

  const roomName = channel.replace('presence-game-', '');
  const gameState = getRoom(roomName);

  const playerColor = ['red', 'blue', 'green', 'yellow'][gameState.players.length % 4];
  if (gameState.players.length < 4) {
    gameState.players.push({ id: userId, position: 0, score: 0, color: playerColor });
  }

  const userInfo = {
    user_id: userId,
    user_info: { name: `Player ${userId}`, color: playerColor },
  };

  const authResponse = pusher.authorizeChannel(socketId, channel, userInfo);
  
  // Trigger an event to update everyone
  await pusher.trigger(channel, 'gameState', gameState);

  return new Response(JSON.stringify(authResponse));
}
