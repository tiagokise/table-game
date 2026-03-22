// src/app/api/pusher/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// This is a simplified in-memory store. For production, use a database or a cache like Redis.
const rooms = new Map<string, any>();

function getRoom(roomName: string) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, {
      players: [],
      currentPlayerIndex: 0,
      isQuizVisible: false,
      currentQuestion: null,
      diceValue: null,
      lastAnswerResult: null,
    });
  }
  return rooms.get(roomName);
}

export async function POST(request: Request) {
  const { event, channel, payload } = await request.json();

  const roomName = channel.replace('presence-', '');
  const gameState = getRoom(roomName);

  // Here you would handle your game logic based on the event
  // For simplicity, we will just broadcast the received payload
  // You should expand this with the logic from your old server.js
  
  await pusher.trigger(channel, event, payload);

  return NextResponse.json({ success: true });
}
