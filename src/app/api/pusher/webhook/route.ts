// src/app/api/pusher/webhook/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// This should share the same 'rooms' instance as your main API route.
// In a serverless environment, this is not guaranteed.
// A proper implementation requires an external data store like Redis or a database.
const rooms = new Map<string, any>(); 

export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const webhook = pusher.webhook({ headers, rawBody });
  const events = webhook.getEvents();

  for (const event of events) {
    const roomName = event.channel.replace('presence-game-', '');
    const gameState = rooms.get(roomName);

    if (!gameState) continue;

    if (event.name === 'member_removed') {
      gameState.players = gameState.players.filter((p: any) => p.id !== (event as any).user_id);
      if (gameState.currentPlayerIndex >= gameState.players.length) {
        gameState.currentPlayerIndex = 0;
      }
      await pusher.trigger(event.channel, 'gameState', gameState);
    }
  }

  return NextResponse.json({ success: true });
}
