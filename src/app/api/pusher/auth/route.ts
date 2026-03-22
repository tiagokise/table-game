// src/app/api/pusher/auth/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  const data = await request.text();
  const [socketId, channelName] = data.split('&').map(str => str.split('=')[1]);
  
  const randomId = Math.random().toString(36).substring(2, 9);
  const userInfo = {
    user_id: randomId,
    user_info: { name: `Player ${randomId}` },
  };

  const authResponse = pusher.authorizeChannel(socketId, channelName, userInfo);
  return new Response(JSON.stringify(authResponse));
}
