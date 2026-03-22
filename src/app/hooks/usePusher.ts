// src/app/hooks/usePusher.ts
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

const usePusher = (room: string | null) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [gameState, setGameState] = useState<any | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!room || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) return;

    const newPusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
    });

    const channelName = `presence-game-${room}`;
    const channel = newPusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setPlayerId(members.myID);
    });
    
    channel.bind('gameState', (data: any) => {
      setGameState(data);
    });

    // Optional: for more immediate feedback on players joining/leaving
    channel.bind('pusher:member_added', (member: any) => {
      // The backend will send a full gameState update, but you could handle a preliminary update here if needed.
    });

    channel.bind('pusher:member_removed', (member: any) => {
      // The backend webhook should handle this, but you could handle a preliminary update here.
    });

    setPusher(newPusher);

    return () => {
      newPusher.unsubscribe(channelName);
      newPusher.disconnect();
    };
  }, [room]);

  const emit = async (event: string, payload: any) => {
    if (!room) return;
    await fetch('/api/pusher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, channel: `presence-game-${room}`, payload, userId: playerId }),
    });
  };

  return { gameState, playerId, emit };
};

export default usePusher;
