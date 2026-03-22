// src/app/api/pusher/auth/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { GameState } from '@/app/game/types';
import { initialGameState } from '@/app/game/game-state';
import redis from '@/lib/redis';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

async function getRoom(roomName: string): Promise<GameState> {
  const roomData = await redis.get(`room:${roomName}`);
  if (roomData) {
    return JSON.parse(roomData);
  }
  const newRoom = JSON.parse(JSON.stringify(initialGameState));
  await redis.set(`room:${roomName}`, JSON.stringify(newRoom));
  return newRoom;
}

export async function POST(request: Request) {
  const data = await request.formData();
  const socketId = data.get('socket_id') as string;
  const channel = data.get('channel_name') as string;
  const userId = Math.random().toString(36).substring(2, 9);

  const roomName = channel.replace('presence-game-', '');
  const gameState = await getRoom(roomName);

  const playerColor = ['red', 'blue', 'green', 'yellow'][gameState.players.length % 4];
  if (gameState.players.length < 4 && !gameState.players.some(p => p.id === userId)) {
    gameState.players.push({ id: userId, position: 0, score: 0, color: playerColor });
  }

  const userInfo = {
    user_id: userId,
    user_info: { name: `Player ${userId}`, color: playerColor },
  };

  const authResponse = pusher.authorizeChannel(socketId, channel, userInfo);
  
  await redis.set(`room:${roomName}`, JSON.stringify(gameState));
  await pusher.trigger(channel, 'gameState', gameState);

  return new Response(JSON.stringify(authResponse));
}
